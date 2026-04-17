import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./embeddings";

export interface KnowledgeChunk {
  id: string;
  content: string;
  page_number: number;
  similarity: number;
  document_title: string;
  document_author: string | null;
}

export interface SimilarCase {
  id: string;
  title: string;
  description: string;
  outcome: string;
  interventions_used: unknown[];
  sessions_count: number;
  similarity: number;
}

export async function searchKnowledge(
  query: string,
  psychologistId: string,
  limit = 5
): Promise<KnowledgeChunk[]> {
  const supabase = await createClient();
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("search_knowledge", {
    query_embedding: embedding,
    psychologist_uuid: psychologistId,
    match_count: limit,
  });

  if (error) {
    console.error("Knowledge search error:", error);
    return [];
  }
  return (data ?? []) as KnowledgeChunk[];
}

export async function searchSimilarCases(
  sessionSummary: string,
  psychologistId: string,
  limit = 3
): Promise<SimilarCase[]> {
  const supabase = await createClient();
  const embedding = await generateEmbedding(sessionSummary.slice(0, 2000));

  const { data, error } = await supabase.rpc("search_cases", {
    query_embedding: embedding,
    psychologist_uuid: psychologistId,
    match_count: limit,
  });

  if (error) {
    console.error("Cases search error:", error);
    return [];
  }
  return (data ?? []) as SimilarCase[];
}

export function formatKnowledgeContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "No se encontraron fragmentos relevantes en la biblioteca.";
  return chunks
    .map(
      (c) =>
        `[${c.document_title}${c.document_author ? ` — ${c.document_author}` : ""}, p.${c.page_number}]:\n${c.content}`
    )
    .join("\n\n---\n\n");
}

export function formatCasesContext(cases: SimilarCase[]): string {
  if (cases.length === 0) return "No se encontraron casos similares previos.";
  return cases
    .map(
      (c) =>
        `Caso: ${c.title}\nResultado: ${c.outcome}\nSesiones: ${c.sessions_count}\nIntervenciones: ${JSON.stringify(c.interventions_used)}`
    )
    .join("\n\n---\n\n");
}
