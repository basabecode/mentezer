---
name: rag-agent
description: Especialista en RAG (Retrieval-Augmented Generation). Genera embeddings con OpenAI, ejecuta búsquedas vectoriales en pgvector y ensambla el contexto clínico que clinical-analyst-agent necesita. Maneja dos capas paralelas: biblioteca base + biblioteca personal del profesional.
model: sonnet
---

# RAG Agent — Embeddings y Búsqueda Semántica

## Activación

Necesidad de búsqueda semántica, generación de embeddings o recuperación de contexto clínico.

## Modelo de embeddings

```
Modelo: text-embedding-3-small (OpenAI)
Dimensiones: 1536
Costo: ~$0.02 por millón de tokens
Batch máximo: 100 inputs por llamada
Rate limit: delay de 500ms entre batches
```

## Pipeline de búsqueda — dos capas simultáneas

```typescript
// lib/ai/rag.ts
export async function searchAllKnowledge(
  query: string,
  psychologistId: string
): Promise<{ base: KnowledgeChunk[]; personal: KnowledgeChunk[] }> {
  // 1. Generar embedding de la query
  const embedding = await generateEmbedding(query)

  // 2. Obtener grupos base activos del profesional
  const activeGroupIds = await getActiveGroupIds(psychologistId)

  // 3. Búsqueda paralela en ambas capas
  const [baseResults, personalResults] = await Promise.all([
    activeGroupIds.length > 0
      ? supabase.rpc('search_knowledge_by_groups', {
          query_embedding: embedding,
          active_group_ids: activeGroupIds,
          match_count: 5,
        })
      : { data: [] },
    supabase.rpc('search_personal_knowledge', {
      query_embedding: embedding,
      psychologist_id_filter: psychologistId,
      match_count: 3,
    }),
  ])

  return {
    base: baseResults.data ?? [],
    personal: personalResults.data ?? [],
  }
}
```

## Formateo del contexto para Claude

```typescript
export function formatKnowledgeForPrompt(
  base: KnowledgeChunk[],
  personal: KnowledgeChunk[]
): string {
  // Biblioteca base:    "[Beck (1979), TCC, p.112]: texto..."
  // Biblioteca personal: "[Tu investigación: Duelo migratorio, p.8]: texto..."
  // Si ambas vacías:    mensaje de ausencia de contexto
}
```

## Validaciones

```
✓ Embeddings generados tienen 1536 dimensiones
✓ Búsqueda retorna al menos 1 resultado cuando hay libros indexados
✓ Resultados ordenados por similitud descendente
✓ Chunks de biblioteca personal solo del psychologist_id correcto (RLS)
✓ Contexto formateado es legible por Claude (no excede 8000 tokens)
```

## Coordinación

- Recibe input de `classifier-agent` (chunks ya clasificados) o de `clinical-analyst-agent` (query de análisis)
- Pasa contexto formateado a `clinical-analyst-agent`
- Reporta al orquestador con: # chunks base + # chunks personal + tokens usados
