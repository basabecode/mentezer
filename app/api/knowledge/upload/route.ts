import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processDocument } from "@/lib/ai/embeddings";
import { classifyDocument } from "@/lib/ai/classifier";
import type { Json } from "@/types/supabase";

export const maxDuration = 300;

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return (data.text as string)?.trim() ?? "";
  }

  return buffer.toString("utf-8").trim();
}

function cleanText(raw: string): string {
  return raw
    .replace(/\f/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const formData  = await request.formData();
    const file      = formData.get("file")   as File   | null;
    const titleHint = formData.get("title")  as string | null;
    const author    = formData.get("author") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Se requiere un archivo" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo supera 50MB" }, { status: 400 });
    }

    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt")) {
      return NextResponse.json({ error: "Solo se aceptan PDF y TXT" }, { status: 400 });
    }

    const rawText     = await extractText(file);
    const textContent = cleanText(rawText);

    if (!textContent || textContent.length < 100) {
      return NextResponse.json(
        { error: "El archivo no contiene texto extraíble o es un PDF escaneado. Convierte a PDF con texto seleccionable." },
        { status: 422 }
      );
    }

    const filePath = `${user.id}/knowledge/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { data: doc, error: docError } = await supabase
      .from("knowledge_documents")
      .insert({
        psychologist_id: user.id,
        title: titleHint || file.name.replace(/\.[^.]+$/, "").replace(/_/g, " "),
        author: author || null,
        category: "Clasificando...",
        file_url: publicData.publicUrl,
        file_size_bytes: file.size,
        processing_status: "processing",
        source_type: "personal",
      })
      .select("id")
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Error al registrar el documento" }, { status: 500 });
    }

    // Procesar en background — no bloquear la respuesta
    processDocumentBackground(doc.id, user.id, file.name, textContent).catch((err) =>
      console.error("[BG PROCESS ERROR]", err)
    );

    return NextResponse.json({
      data: {
        id: doc.id,
        title: titleHint || file.name.replace(/\.[^.]+$/, ""),
        status: "processing",
        message: "Documento recibido. La IA lo está clasificando e indexando.",
      },
    });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return NextResponse.json({ error: "Error al procesar el documento" }, { status: 500 });
  }
}

async function processDocumentBackground(
  documentId: string,
  psychologistId: string,
  filename: string,
  textContent: string
) {
  const supabase = await createClient();

  try {
    const { data: rawGroups } = await supabase
      .from("knowledge_groups")
      .select("id, slug, name, description");

    const groups = rawGroups ?? [];

    const classification = await classifyDocument(
      filename,
      "personal",
      textContent,
      groups
    );

    let groupId: string | null = null;
    if (classification.group_slug) {
      const match = groups.find((g) => g.slug === classification.group_slug);
      groupId = match?.id ?? null;
    }

    let personalGroupId: string | null = null;
    if (!groupId && classification.suggested_personal_label) {
      const { data: existingGroup } = await supabase
        .from("personal_knowledge_groups")
        .select("id, document_count")
        .eq("psychologist_id", psychologistId)
        .eq("label", classification.suggested_personal_label)
        .maybeSingle();

      if (existingGroup) {
        personalGroupId = existingGroup.id;
        await supabase
          .from("personal_knowledge_groups")
          .update({ document_count: (existingGroup.document_count ?? 0) + 1 })
          .eq("id", personalGroupId);
      } else {
        const { data: newGroup } = await supabase
          .from("personal_knowledge_groups")
          .insert({
            psychologist_id: psychologistId,
            label: classification.suggested_personal_label,
            description: classification.reasoning,
            document_count: 1,
          })
          .select("id")
          .single();
        personalGroupId = newGroup?.id ?? null;
      }
    }

    await supabase
      .from("knowledge_documents")
      .update({
        group_id: groupId,
        personal_group_id: personalGroupId,
        personal_label: classification.suggested_personal_label,
        ai_classification: classification as unknown as Json,
        category: classification.group_name,
      })
      .eq("id", documentId)
      .eq("psychologist_id", psychologistId);

    const chunkCount = await processDocument(documentId, psychologistId, textContent);

    await supabase.from("audit_logs").insert({
      psychologist_id: psychologistId,
      action: "knowledge.document_uploaded",
      resource_type: "knowledge_document",
      resource_id: documentId,
      metadata: {
        filename,
        chunk_count: chunkCount,
        group: classification.group_name,
        confidence: classification.confidence,
      },
    });

    console.log(`[UPLOAD DONE] ${documentId} → ${classification.group_name} (${chunkCount} chunks)`);
  } catch (err) {
    console.error("[BG PROCESS ERROR]", err);
    await supabase
      .from("knowledge_documents")
      .update({ processing_status: "error" })
      .eq("id", documentId)
      .eq("psychologist_id", psychologistId);
  }
}
