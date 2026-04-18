import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processDocument } from "@/lib/ai/embeddings";
import { PDFParse } from "pdf-parse";

export const maxDuration = 300;

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  }

  // .txt o .md
  return buffer.toString("utf-8").trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const formData = await request.formData();
    const file     = formData.get("file")     as File   | null;
    const title    = formData.get("title")    as string | null;
    const author   = formData.get("author")   as string | null;
    const category = formData.get("category") as string | null;

    if (!file || !title) {
      return NextResponse.json({ error: "Archivo y título son requeridos" }, { status: 400 });
    }

    // Extraer texto server-side (soporta PDF + texto plano)
    const textContent = await extractText(file);
    if (!textContent) {
      return NextResponse.json(
        { error: "El archivo no contiene texto extraíble. Para PDFs, asegúrate de que el texto sea seleccionable (no escaneado)." },
        { status: 422 }
      );
    }

    // Subir archivo original a Storage
    const filePath = `${user.id}/knowledge/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from("documents").getPublicUrl(filePath);

    // Crear registro del documento
    const { data: doc, error: docError } = await supabase
      .from("knowledge_documents")
      .insert({
        psychologist_id: user.id,
        title,
        author:   author   || null,
        category: category || null,
        file_url: publicData.publicUrl,
        file_size_bytes: file.size,
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Error al registrar el documento" }, { status: 500 });
    }

    const chunkCount = await processDocument(doc.id, user.id, textContent);

    await supabase.from("audit_logs").insert({
      psychologist_id: user.id,
      action: "knowledge.document_uploaded",
      resource_type: "knowledge_document",
      resource_id: doc.id,
      metadata: { title, chunk_count: chunkCount, file_size: file.size },
    });

    return NextResponse.json({ success: true, documentId: doc.id, chunkCount });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al procesar el documento" }, { status: 500 });
  }
}
