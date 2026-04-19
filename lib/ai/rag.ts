import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./embeddings";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface KnowledgeChunk {
  content: string;
  page_number: number;
  document_title: string;
  author?: string;
  group_name: string;
  source_type: "system" | "personal";
  personal_label?: string;
  similarity: number;
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

// ─── Búsqueda en DOS capas ────────────────────────────────────────────────────

export async function searchAllKnowledge(
  query: string,
  psychologistId: string
): Promise<{ base: KnowledgeChunk[]; personal: KnowledgeChunk[] }> {
  const supabase = await createClient();
  const embedding = await generateEmbedding(query);

  // Grupos base activos del psicólogo
  const { data: activeGroups } = await supabase
    .from("psychologist_knowledge_groups")
    .select("group_id")
    .eq("psychologist_id", psychologistId)
    .eq("is_active", true);

  const groupIds = (activeGroups ?? []).map((g) => g.group_id);

  // Supabase tipos representan vector como string, pero pgvector acepta number[]
  const embeddingStr = embedding as unknown as string;

  // Búsqueda paralela en las dos capas
  const [baseResult, personalResult] = await Promise.all([
    groupIds.length > 0
      ? supabase.rpc("search_knowledge_by_groups", {
          query_embedding: embeddingStr,
          active_group_ids: groupIds,
          match_count: 5,
        })
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("search_personal_knowledge", {
      query_embedding: embeddingStr,
      psychologist_id_filter: psychologistId,
      match_count: 3,
    }),
  ]);

  if (baseResult.error) console.error("[RAG] Base search error:", baseResult.error);
  if (personalResult.error) console.error("[RAG] Personal search error:", personalResult.error);

  return {
    base: (baseResult.data ?? []) as KnowledgeChunk[],
    personal: (personalResult.data ?? []) as KnowledgeChunk[],
  };
}

// Mantener compatibilidad con código existente (búsqueda simple)
export async function searchKnowledge(
  query: string,
  psychologistId: string,
  limit = 5
): Promise<KnowledgeChunk[]> {
  const { base, personal } = await searchAllKnowledge(query, psychologistId);
  return [...base.slice(0, limit), ...personal].slice(0, limit);
}

// ─── Búsqueda de casos similares ─────────────────────────────────────────────

export async function searchSimilarCases(
  sessionSummary: string,
  psychologistId: string,
  limit = 3
): Promise<SimilarCase[]> {
  const supabase = await createClient();
  const embedding = await generateEmbedding(sessionSummary.slice(0, 2000));

  const { data, error } = await supabase.rpc("search_cases", {
    query_embedding: embedding as unknown as string,
    psychologist_uuid: psychologistId,
    match_count: limit,
  });

  if (error) {
    console.error("[RAG] Cases search error:", error);
    return [];
  }
  return (data ?? []) as SimilarCase[];
}

// ─── Formateo para prompts ────────────────────────────────────────────────────

export function formatKnowledgeForPrompt(
  base: KnowledgeChunk[],
  personal: KnowledgeChunk[]
): string {
  let result = "";

  if (base.length > 0) {
    result += "REFERENCIAS DE BIBLIOTECA CLÍNICA BASE:\n";
    result += base
      .map(
        (c) =>
          `[${c.document_title}${c.author ? `, ${c.author}` : ""}, p.${c.page_number}] (${c.group_name}):\n${c.content}`
      )
      .join("\n\n");
  }

  if (personal.length > 0) {
    result += "\n\nREFERENCIAS DE TU BIBLIOTECA PERSONAL:\n";
    result += personal
      .map(
        (c) =>
          `[Tu referencia: "${c.personal_label || c.document_title}", p.${c.page_number}]:\n${c.content}`
      )
      .join("\n\n");
  }

  if (!result) {
    result = "No se encontraron referencias relevantes en la biblioteca clínica.";
  }

  return result;
}

// Alias para compatibilidad con código existente
export function formatKnowledgeContext(chunks: KnowledgeChunk[]): string {
  return formatKnowledgeForPrompt(chunks, []);
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
