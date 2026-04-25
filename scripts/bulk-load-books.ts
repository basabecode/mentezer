/**
 * Mentezer — Carga masiva de libros clínicos (126 libros de Mario)
 * Uso:
 *   npx ts-node scripts/bulk-load-books.ts
 *
 * Variables utiles para cuidar el free tier:
 *   MAX_BOOKS=2              limita cuantos libros procesar en una corrida
 *   MAX_CHUNKS_PER_BOOK=300  limita chunks/embeddings guardados por libro
 *   DRY_RUN=true             clasifica y calcula chunks sin escribir en Supabase
 *
 * Resiliente: usa bulk-load-log.json para pausar y retomar.
 * Validar con pocos libros antes de correr con todos.
 */

import "./load-env.ts";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { scanBooksFolder } from "./extract-pdf-text.ts";
import { classifyDocument } from "./classify-document.ts";
import { parseOptionalPositiveInt, selectChunksForBook } from "./bulk-load-utils.ts";

const BOOKS_DIR = process.env.BOOKS_BASE_DIR ?? "./books-to-index";
const LOG_FILE = "./scripts/bulk-load-log.json";
const BATCH_SIZE = 20;
const DELAY_MS = 500;
const MAX_BOOKS = parseOptionalPositiveInt(process.env.MAX_BOOKS);
const MAX_CHUNKS_PER_BOOK = parseOptionalPositiveInt(process.env.MAX_CHUNKS_PER_BOOK) ?? 300;
const DRY_RUN = process.env.DRY_RUN === "true";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !DRY_RUN) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL para escribir en Supabase.");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !DRY_RUN) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY para escribir en Supabase.");
}

if (!process.env.OPENAI_API_KEY && !DRY_RUN) {
  throw new Error("Falta OPENAI_API_KEY para generar embeddings.");
}

// Service role para saltear RLS en carga inicial (NUNCA usar en frontend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dry-run"
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "dry-run" });

function loadLog(): Record<string, "done" | "error"> {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  }
  return {};
}

function saveLog(log: Record<string, string>) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGroupId(slug: string): Promise<string | null> {
  if (DRY_RUN) return null;

  const { data } = await supabase
    .from("knowledge_groups")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
}

async function processBook(doc: Awaited<ReturnType<typeof scanBooksFolder>>[0], log: Record<string, string>) {
  const key = doc.fullPath;

  if (log[key] === "done") {
    console.log(`[SKIP] Ya procesado: ${doc.filename}`);
    return;
  }

  console.log(`\n[INICIO] ${doc.filename} (${doc.folder})`);
  if (DRY_RUN) {
    console.log("[DRY RUN] No se escribira en Supabase ni se generaran embeddings.");
  }

  const { generatedChunks, selectedChunks: chunks } = selectChunksForBook(doc.text, MAX_CHUNKS_PER_BOOK);
  console.log(`[CHUNKS] ${generatedChunks.length} generados | ${chunks.length} seleccionados`);
  if (generatedChunks.length > chunks.length) {
    console.log(`[LIMIT] MAX_CHUNKS_PER_BOOK=${MAX_CHUNKS_PER_BOOK}; se omitieron ${generatedChunks.length - chunks.length} chunks`);
  }

  if (chunks.length === 0) {
    console.warn(`[WARN] Sin chunks — posible PDF escaneado sin OCR`);
    if (!DRY_RUN) {
      log[key] = "error";
      saveLog(log);
    }
    return;
  }

  const classification = await classifyDocument(doc.filename, doc.folder, doc.text);
  console.log(`[CLASIFICADO] → ${classification.group_name} (${classification.confidence})`);
  console.log(`[RAZÓN] ${classification.reasoning}`);

  if (DRY_RUN) {
    console.log(`[DRY RUN] ${doc.filename} quedaria listo para guardar ${chunks.length} chunks.`);
    return;
  }

  let groupId: string | null = null;
  if (classification.group_slug) {
    groupId = await getGroupId(classification.group_slug);
  }

  const { data: docRecord, error: docError } = await supabase
    .from("knowledge_documents")
    .insert({
      psychologist_id: null,
      title: doc.filename.replace(".pdf", "").replace(/_/g, " "),
      author: "",
      category: classification.group_name,
      file_url: "",
      file_size_bytes: doc.sizeBytes,
      processing_status: "processing",
      group_id: groupId,
      source_type: "system",
      ai_classification: classification,
      personal_label: classification.suggested_personal_label,
    })
    .select()
    .single();

  if (docError || !docRecord) {
    console.error(`[DB ERROR] ${doc.filename}:`, docError);
    log[key] = "error";
    saveLog(log);
    return;
  }

  const documentId = docRecord.id as string;
  const allRows: Array<{
    document_id: string;
    psychologist_id: null;
    content: string;
    page_number: number;
    embedding: number[];
  }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    process.stdout.write(
      `[EMBED] Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`
    );

    let attempts = 0;
    while (attempts < 4) {
      try {
        const embResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: batch,
        });

        batch.forEach((content, j) => {
          allRows.push({
            document_id: documentId,
            psychologist_id: null,
            content,
            page_number: Math.floor((i + j) / 4) + 1,
            embedding: embResponse.data[j].embedding,
          });
        });

        process.stdout.write(" OK\n");
        await sleep(DELAY_MS);
        break;
      } catch (err) {
        attempts++;
        const delay = Math.pow(2, attempts) * 1000;
        console.error(`\n[EMBED ERROR] Reintento ${attempts} en ${delay}ms:`, err);
        await sleep(delay);
      }
    }
  }

  for (let i = 0; i < allRows.length; i += 100) {
    const batch = allRows.slice(i, i + 100);
    const { error } = await supabase.from("document_chunks").insert(batch);
    if (error) console.error(`[INSERT ERROR] Chunks ${i}-${i + 100}:`, error);
  }

  await supabase
    .from("knowledge_documents")
    .update({ processing_status: "ready", chunk_count: allRows.length })
    .eq("id", documentId);

  if (groupId) {
    await supabase.rpc("increment_group_book_count", { gid: groupId });
  }

  log[key] = "done";
  saveLog(log);
  console.log(`[DONE] ${doc.filename} → ${allRows.length} chunks guardados`);
}

async function main() {
  console.log("=== Mentezer — Carga masiva de libros clínicos ===");
  console.log(`Directorio: ${BOOKS_DIR}`);
  console.log(`MAX_BOOKS: ${MAX_BOOKS ?? "sin limite"}`);
  console.log(`MAX_CHUNKS_PER_BOOK: ${MAX_CHUNKS_PER_BOOK}`);
  console.log(`DRY_RUN: ${DRY_RUN ? "true" : "false"}`);

  const log = loadLog();
  const done = Object.values(log).filter((v) => v === "done").length;
  console.log(`Log de progreso: ${done} libros ya procesados`);

  const allDocs = await scanBooksFolder(BOOKS_DIR);
  const docs = MAX_BOOKS ? allDocs.slice(0, MAX_BOOKS) : allDocs;
  console.log(`Total PDFs encontrados: ${allDocs.length}`);
  if (MAX_BOOKS && allDocs.length > docs.length) {
    console.log(`[LIMIT] Se procesaran ${docs.length} por MAX_BOOKS=${MAX_BOOKS}`);
  }

  if (docs.length === 0) {
    console.log("No se encontraron PDFs. Revisa que la carpeta books-to-index existe y contiene PDFs.");
    return;
  }

  for (const doc of docs) {
    await processBook(doc, log);
  }

  console.log(`\n=== ${DRY_RUN ? "SIMULACION COMPLETADA" : "CARGA COMPLETADA"} ===`);
  const finalLog = loadLog();
  const finalDone = Object.values(finalLog).filter((v) => v === "done").length;
  const errors = Object.values(finalLog).filter((v) => v === "error").length;
  console.log(`Exitosos: ${finalDone} | Errores: ${errors}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
