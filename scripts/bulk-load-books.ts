/**
 * PsyAssist — Carga masiva de libros clínicos (126 libros de Mario)
 * Uso: npx ts-node scripts/bulk-load-books.ts
 *
 * Resiliente: usa bulk-load-log.json para pausar y retomar.
 * Validar con 3 libros antes de correr con todos.
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { scanBooksFolder } from "./extract-pdf-text";
import { classifyDocument } from "./classify-document";

// Service role para saltear RLS en carga inicial (NUNCA usar en frontend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BOOKS_DIR  = process.env.BOOKS_BASE_DIR ?? "./books-to-index";
const LOG_FILE   = "./scripts/bulk-load-log.json";
const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 60;
const BATCH_SIZE = 20;
const DELAY_MS   = 500;

function loadLog(): Record<string, "done" | "error"> {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  }
  return {};
}

function saveLog(log: Record<string, string>) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const clean = para.trim().replace(/\s+/g, " ");
    if (!clean || clean.length < 30) continue;

    if ((current + " " + clean).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim());
      const overlapText = current.slice(-CHUNK_OVERLAP);
      current = overlapText + " " + clean;
    } else {
      current += (current ? " " : "") + clean;
    }
  }
  if (current.trim().length > 50) chunks.push(current.trim());
  return chunks;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGroupId(slug: string): Promise<string | null> {
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

  const classification = await classifyDocument(doc.filename, doc.folder, doc.text);
  console.log(`[CLASIFICADO] → ${classification.group_name} (${classification.confidence})`);
  console.log(`[RAZÓN] ${classification.reasoning}`);

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
  const chunks = chunkText(doc.text);
  console.log(`[CHUNKS] ${chunks.length} chunks generados`);

  if (chunks.length === 0) {
    console.warn(`[WARN] Sin chunks — posible PDF escaneado sin OCR`);
    await supabase.from("knowledge_documents").update({ processing_status: "error" }).eq("id", documentId);
    log[key] = "error";
    saveLog(log);
    return;
  }

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
  console.log("=== PsyAssist — Carga masiva de libros clínicos ===");
  console.log(`Directorio: ${BOOKS_DIR}`);

  const log = loadLog();
  const done = Object.values(log).filter((v) => v === "done").length;
  console.log(`Log de progreso: ${done} libros ya procesados`);

  const docs = await scanBooksFolder(BOOKS_DIR);
  console.log(`Total PDFs encontrados: ${docs.length}`);

  if (docs.length === 0) {
    console.log("No se encontraron PDFs. Revisa que la carpeta books-to-index existe y tiene subcarpetas con PDFs.");
    return;
  }

  for (const doc of docs) {
    await processBook(doc, log);
  }

  console.log("\n=== CARGA COMPLETADA ===");
  const finalLog = loadLog();
  const finalDone = Object.values(finalLog).filter((v) => v === "done").length;
  const errors = Object.values(finalLog).filter((v) => v === "error").length;
  console.log(`Exitosos: ${finalDone} | Errores: ${errors}`);
}

main().catch(console.error);
