import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ").trim();
    if (chunk.length > 100) chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
}

export async function processDocument(
  documentId: string,
  psychologistId: string,
  text: string
): Promise<number> {
  const supabase = await createClient();

  await supabase
    .from("knowledge_documents")
    .update({ processing_status: "processing" })
    .eq("id", documentId)
    .eq("psychologist_id", psychologistId);

  const chunks = chunkText(text);

  // Embeddings en lote (máx 100 por request)
  const BATCH = 100;
  const rows: Array<{
    document_id: string;
    psychologist_id: string;
    content: string;
    page_number: number;
    embedding: number[];
  }> = [];

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const response = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    batch.forEach((content, j) => {
      rows.push({
        document_id: documentId,
        psychologist_id: psychologistId,
        content,
        page_number: Math.floor((i + j) / 3) + 1,
        embedding: response.data[j].embedding,
      });
    });
  }

  const { error } = await supabase.from("document_chunks").insert(rows);

  if (error) {
    await supabase
      .from("knowledge_documents")
      .update({ processing_status: "error" })
      .eq("id", documentId);
    throw error;
  }

  await supabase
    .from("knowledge_documents")
    .update({ processing_status: "ready", chunk_count: rows.length })
    .eq("id", documentId)
    .eq("psychologist_id", psychologistId);

  return rows.length;
}
