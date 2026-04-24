# KNOWLEDGE_SYSTEM.md - Biblioteca Clinica y RAG

Referencia compacta del sistema de conocimiento. Los detalles historicos de sprints fueron eliminados porque ya no son fuente de verdad.

## Objetivo

Mentezer recupera contexto clinico desde dos capas:

1. Biblioteca base del sistema: libros agrupados por enfoque clinico.
2. Biblioteca personal: documentos subidos por cada profesional, segregados por `psychologist_id`.

## Grupos Base

Slugs oficiales:

- `cbt` - Cognitivo-conductual (TCC)
- `psicoanalitico` - Psicodinamico / Psicoanalitico
- `humanista` - Humanista / Existencial
- `sistemica` - Sistemica / Familiar
- `trauma` - Trauma / EMDR / Somatica
- `neuropsico` - Neuropsicologia / Evaluacion
- `infanto` - Psicologia infanto-juvenil
- `positiva` - Psicologia positiva / Mindfulness

## Tablas Principales

- `knowledge_groups`
- `personal_knowledge_groups`
- `psychologist_knowledge_groups`
- `knowledge_documents`
- `document_chunks`
- `clinical_cases`

Las tablas con datos por profesional deben filtrar por `psychologist_id` y respetar RLS.

## Funciones RPC

- `search_knowledge_by_groups(query_embedding, active_group_ids, match_count)`
- `search_personal_knowledge(query_embedding, psychologist_id_filter, match_count)`
- `search_cases(query_embedding, psychologist_id_filter, match_count)`
- `increment_group_book_count(gid)`

## Archivos De Codigo Relevantes

- `app/(dashboard)/knowledge/page.tsx`
- `app/api/knowledge/upload/route.ts`
- `app/api/knowledge/[id]/route.ts`
- `app/api/knowledge/[id]/status/route.ts`
- `app/api/knowledge/groups/route.ts`
- `components/knowledge/*`
- `lib/ai/classifier.ts`
- `lib/ai/embeddings.ts`
- `lib/ai/rag.ts`
- `lib/ai/analysis.ts`
- `scripts/bulk-load-books.ts`

## Carga De Libros

Carpeta esperada:

```text
books-to-index/
  01-cbt/
  02-psicoanalitico/
  03-humanista/
  04-sistemica/
  05-trauma/
  06-neuropsico/
  07-infanto/
  08-positiva/
  sin-clasificar/
```

Validar primero con pocos archivos antes de cargar una biblioteca grande. El script usa logs para evitar reprocesos.

## Reglas De Seguridad

- Embeddings personales siempre segregados por `psychologist_id`.
- Documentos base no deben mezclarse con documentos personales.
- Resultados de RAG no pueden exponer informacion de otros profesionales.
- Outputs de IA deben citar fuente cuando usen conocimiento recuperado.
- Disclaimer clinico obligatorio en analisis generados.

## Estado Actual

- UI de knowledge implementada.
- Upload personal implementado.
- Clasificacion IA implementada.
- RAG de dos capas implementado.
- Integracion de fuentes en analisis implementada.
- Validacion funcional depende de datos reales cargados en Supabase.
