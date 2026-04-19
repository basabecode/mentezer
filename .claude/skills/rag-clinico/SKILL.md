# SKILL: rag-clinico
## RAG Pipeline Clínico — PsyAssist

### Cuándo usar este skill
Cualquier tarea relacionada con:
- Subir PDFs y generar embeddings
- Búsqueda semántica en la biblioteca clínica
- Análisis post-sesión con Claude
- Búsqueda de casos similares exitosos
- Pipeline completo de procesamiento de sesión

---

## Pipeline Completo

```
Audio/Texto
    │
    ▼
1. Whisper API → Transcript limpio
    │
    ▼
2. Contexto del paciente (historial, sesiones previas, plan)
    │
    ▼
3. pgvector search → Top 5 chunks de libros clínicos
    │              (filtrado por psychologist_id)
    ▼
4. pgvector search → Top 3 casos similares exitosos
    │              (filtrado por psychologist_id)
    ▼
5. Prompt ensamblado → Claude claude-sonnet-4-20250514
    │
    ▼
6. AIReport JSON → Guardado en DB
    │
    ▼
7. Notificación al psicólogo
```

---

## Implementación: lib/ai/rag.ts

```typescript
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI()

// Generar embedding para búsqueda
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // límite seguro
  })
  return response.data[0].embedding
}

// Buscar chunks relevantes en la biblioteca del psicólogo
export async function searchKnowledge(
  query: string,
  psychologistId: string,
  limit = 5
) {
  const supabase = createServerClient()
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('search_knowledge', {
    query_embedding: embedding,
    psychologist_id_filter: psychologistId,
    match_count: limit,
  })

  if (error) throw error
  return data // [{content, page_number, document_title, author, similarity}]
}

// Buscar casos similares exitosos del psicólogo
export async function searchSimilarCases(
  sessionSummary: string,
  psychologistId: string,
  limit = 3
) {
  const supabase = createServerClient()
  const embedding = await generateEmbedding(sessionSummary)

  const { data, error } = await supabase.rpc('search_cases', {
    query_embedding: embedding,
    psychologist_id_filter: psychologistId,
    match_count: limit,
  })

  if (error) throw error
  return data // [{title, description, outcome, interventions_used, similarity}]
}
```

---

## Implementación: lib/ai/analysis.ts

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { searchKnowledge, searchSimilarCases } from './rag'

const anthropic = new Anthropic()

export async function analyzeSession({
  transcript,
  patientContext,
  previousSessions,
  psychologistId,
}: {
  transcript: string
  patientContext: string
  previousSessions: string
  psychologistId: string
}) {
  // 1. Buscar conocimiento relevante
  const [knowledgeChunks, similarCases] = await Promise.all([
    searchKnowledge(transcript, psychologistId),
    searchSimilarCases(transcript.slice(0, 2000), psychologistId),
  ])

  // 2. Ensamblar contexto clínico
  const knowledgeContext = knowledgeChunks
    .map(c => `[${c.document_title}, p.${c.page_number}]: ${c.content}`)
    .join('\n\n')

  const casesContext = similarCases
    .map(c => `Caso: ${c.title}\nResultado: ${c.outcome}\nIntervenciones: ${c.interventions_used}`)
    .join('\n\n')

  // 3. Prompt clínico
  const systemPrompt = `Eres un asistente clínico de apoyo para psicólogos.
Analiza sesiones de terapia basándote ÚNICAMENTE en:
1. La transcripción proporcionada
2. Los fragmentos de libros clínicos del psicólogo (con fuente)
3. Los casos similares de la base propia del psicólogo

REGLAS ESTRICTAS:
- NUNCA hagas afirmaciones sin respaldo en los documentos proporcionados
- SIEMPRE cita el libro, autor y página cuando hagas observación clínica
- SIEMPRE incluye el disclaimer clínico
- Responde SOLO en JSON válido, sin markdown

DISCLAIMER OBLIGATORIO a incluir en cada reporte:
"⚠️ Este análisis es una herramienta de apoyo al criterio clínico. El diagnóstico y tratamiento son responsabilidad exclusiva del profesional de salud mental."`

  const userPrompt = `CONTEXTO DEL PACIENTE:
${patientContext}

SESIONES ANTERIORES (resumen):
${previousSessions || 'Primera sesión'}

TRANSCRIPCIÓN DE LA SESIÓN:
${transcript}

FRAGMENTOS DE LIBROS CLÍNICOS RELEVANTES:
${knowledgeContext}

CASOS SIMILARES EXITOSOS:
${casesContext || 'No se encontraron casos similares previos'}

Genera el AIReport en JSON con esta estructura exacta:
{
  "summary": "string",
  "patterns": [{"pattern": "string", "evidence": "string", "source": "string"}],
  "diagnostic_hints": [{"hypothesis": "string", "basis": "string", "book": "string", "page": "string"}],
  "risk_signals": [{"signal": "string", "severity": "low|medium|high", "description": "string"}],
  "similar_cases": [{"title": "string", "similarity": "string", "outcome": "string"}],
  "evolution_vs_previous": "string",
  "therapeutic_suggestions": [{"suggestion": "string", "basis": "string"}],
  "disclaimer": "string"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Respuesta inesperada de Claude')

  return JSON.parse(content.text)
}
```

---

## Función pgvector en Supabase (agregar en migración)

```sql
-- Búsqueda en base de conocimiento
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  psychologist_id_filter uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content text,
  page_number int,
  document_title text,
  author text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.content,
    dc.page_number,
    kd.title as document_title,
    kd.author,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  WHERE dc.psychologist_id = psychologist_id_filter
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Búsqueda en casos exitosos
CREATE OR REPLACE FUNCTION search_cases(
  query_embedding vector(1536),
  psychologist_id_filter uuid,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  title text,
  description text,
  outcome text,
  interventions_used text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cc.title,
    cc.description,
    cc.outcome,
    cc.interventions_used,
    1 - (cc.embedding <=> query_embedding) as similarity
  FROM clinical_cases cc
  WHERE cc.psychologist_id = psychologist_id_filter
    AND cc.outcome IN ('successful', 'partial')
    AND cc.is_indexed = true
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Procesamiento de PDFs: lib/ai/embeddings.ts

```typescript
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'

const openai = new OpenAI()

// Chunking de texto clínico
function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const sentences = text.split(/[.!?]\s+/)
  const chunks: string[] = []
  let current = ''
  let pageEstimate = 1

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current += (current ? '. ' : '') + sentence
    }
  }
  if (current) chunks.push(current.trim())
  return chunks.filter(c => c.length > 50)
}

// Procesar PDF y guardar embeddings
export async function processDocument(
  documentId: string,
  psychologistId: string,
  text: string
) {
  const supabase = createServerClient()
  const chunks = chunkText(text)

  // Generar embeddings en batch
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  })

  // Guardar chunks con embeddings
  const rows = chunks.map((content, i) => ({
    document_id: documentId,
    psychologist_id: psychologistId,
    content,
    page_number: Math.floor(i / 3) + 1, // estimado
    embedding: embeddingResponse.data[i].embedding,
  }))

  const { error } = await supabase
    .from('document_chunks')
    .insert(rows)

  if (error) throw error

  // Actualizar estado del documento
  await supabase
    .from('knowledge_documents')
    .update({ processing_status: 'ready', chunk_count: chunks.length })
    .eq('id', documentId)
    .eq('psychologist_id', psychologistId) // seguridad RLS extra
}
```
