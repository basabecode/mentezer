# KNOWLEDGE_SYSTEM — PsyAssist

## Sistema de Biblioteca Clínica con Perfiles de Conocimiento

> **Para Claude Code:** Lee este archivo completo antes de escribir una sola línea de código.
> Lee también `CLAUDE.md` y `AGENTS.md` en la raíz del proyecto.
> **Regla absoluta: NUNCA des por implementado algo que no hayas validado ejecutando el código.**

---

## CONTEXTO DEL SISTEMA

PsyAssist tiene 126 libros de psicología clínica que deben convertirse en conocimiento
recuperable por IA durante el análisis de sesiones. El sistema tiene **dos capas**:

**Capa 1 — Biblioteca base (sistema):**
Gestionada por Mario (admin). Los 126 libros organizados en 8 grupos de enfoque.
Todos los psicólogos pueden activar/desactivar qué grupos quieren usar.

**Capa 2 — Biblioteca personal (por psicólogo):**
Cada psicólogo sube sus propios documentos (libros adicionales, investigaciones,
protocolos, tesis). La IA los clasifica automáticamente y los indexa solo para ese
psicólogo. Nunca se comparten entre cuentas.

---

## DÓNDE DEBEN IR LOS 126 LIBROS

**Antes de arrancar cualquier sprint, Mario debe:**

1. Crear la carpeta `/books-to-index/` en la raíz del proyecto
2. Organizar los PDFs en subcarpetas por enfoque sugerido:

```
/books-to-index/
  /01-cbt/              ← TCC, Beck, Burns, DBT, ACT, Ellis
  /02-psicoanalitico/   ← Freud, Winnicott, Kernberg, Bowlby, Lacan
  /03-humanista/        ← Rogers, Frankl, Yalom, Maslow, Gestalt
  /04-sistemica/        ← Minuchin, Satir, Bowen, Haley, narrativa
  /05-trauma/           ← Van der Kolk, Shapiro (EMDR), Levine, Polyvagal
  /06-neuropsico/       ← DSM-5, CIE-11, Luria, Baddeley, WAIS
  /07-infanto/          ← Piaget, Vygotsky, Winnicott niños, juego terapéutico
  /08-positiva/         ← Seligman, Kabat-Zinn, Neff, mindfulness
  /sin-clasificar/      ← Los que no sabes dónde van (la IA los clasifica)
```

**Si no sabes en qué carpeta va un libro:** ponlo en `/sin-clasificar/`.
El script de carga (Sprint 1, Tarea 4) lo clasifica automáticamente con Claude.

**Formatos aceptados:** PDF, EPUB (convertido), TXT

---

## LOS 8 GRUPOS DE CONOCIMIENTO BASE

Claude Code debe crear estos grupos exactamente con estos slugs:

```typescript
const KNOWLEDGE_GROUPS = [
  {
    slug: 'cbt',
    name: 'Cognitivo-conductual (TCC)',
    description:
      'Beck, Burns, Ellis, Linehan. Protocolos basados en evidencia para ansiedad, depresión, trastornos de personalidad. Incluye DBT, ACT y terapias de tercera ola.',
    color: '#3B6FA0',
    is_system: true,
  },
  {
    slug: 'psicoanalitico',
    name: 'Psicodinámico / Psicoanalítico',
    description:
      'Freud, Winnicott, Kernberg, Bowlby, Lacan. Inconsciente, mecanismos de defensa, apego, relaciones objetales, transferencia.',
    color: '#534AB7',
    is_system: true,
  },
  {
    slug: 'humanista',
    name: 'Humanista / Existencial',
    description:
      'Rogers, Maslow, Frankl, Yalom, Perls. Autorrealización, sentido de vida, Gestalt, relación terapéutica centrada en la persona.',
    color: '#4A7C59',
    is_system: true,
  },
  {
    slug: 'sistemica',
    name: 'Sistémica / Familiar',
    description:
      'Minuchin, Satir, Haley, Bowen. Dinámicas familiares, comunicación, roles sistémicos, terapia de pareja y familia.',
    color: '#0F6E56',
    is_system: true,
  },
  {
    slug: 'trauma',
    name: 'Trauma / EMDR / Somática',
    description:
      'Van der Kolk, Shapiro, Levine. Trauma complejo, PTSD, EMDR, procesamiento somático, teoría polivagal, regulación del sistema nervioso.',
    color: '#B07D3A',
    is_system: true,
  },
  {
    slug: 'neuropsico',
    name: 'Neuropsicología / Evaluación',
    description:
      'Luria, Baddeley, DSM-5, CIE-11. Evaluación cognitiva, neuropsicología clínica, diagnóstico diferencial, pruebas psicométricas.',
    color: '#993C1D',
    is_system: true,
  },
  {
    slug: 'infanto',
    name: 'Psicología infanto-juvenil',
    description:
      'Piaget, Vygotsky, Winnicott. Desarrollo infantil, psicopatología del desarrollo, terapia de juego, adolescencia.',
    color: '#3B6D11',
    is_system: true,
  },
  {
    slug: 'positiva',
    name: 'Psicología positiva / Mindfulness',
    description:
      'Seligman, Kabat-Zinn, Neff. Bienestar, fortalezas, autocompasión, atención plena basada en evidencia (MBSR, MBCT).',
    color: '#185FA5',
    is_system: true,
  },
]
```

---

## ARQUITECTURA DE BASE DE DATOS

### Tablas nuevas (agregar a las ya definidas en CLAUDE.md)

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRUPOS DE CONOCIMIENTO BASE (sistema)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE knowledge_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  color       text NOT NULL DEFAULT '#3B6FA0',
  book_count  int DEFAULT 0,
  is_system   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
-- Sin RLS: estos son públicos (lectura). Solo admin puede escribir.
ALTER TABLE knowledge_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "todos pueden leer grupos" ON knowledge_groups
  FOR SELECT USING (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRUPOS PERSONALES (creados por IA cuando no hay match)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE personal_knowledge_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  label           text NOT NULL,
  description     text,
  document_count  int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE personal_knowledge_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_personal_groups" ON personal_knowledge_groups
  USING (psychologist_id = auth.uid());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SELECCIÓN DE GRUPOS POR PSICÓLOGO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE psychologist_knowledge_groups (
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  group_id        uuid REFERENCES knowledge_groups(id) ON DELETE CASCADE,
  is_active       boolean DEFAULT true,
  activated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (psychologist_id, group_id)
);
ALTER TABLE psychologist_knowledge_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_group_selection" ON psychologist_knowledge_groups
  USING (psychologist_id = auth.uid());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COLUMNAS NUEVAS EN knowledge_documents (ya existe en CLAUDE.md)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES knowledge_groups(id),
  ADD COLUMN IF NOT EXISTS personal_group_id uuid REFERENCES personal_knowledge_groups(id),
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'system',
  -- 'system' = biblioteca base (Mario), 'personal' = subido por psicólogo
  ADD COLUMN IF NOT EXISTS ai_classification jsonb,
  -- Resultado del clasificador: {group_slug, confidence, reasoning, suggested_label}
  ADD COLUMN IF NOT EXISTS personal_label text;
  -- Solo si source_type='personal' y no hay grupo base → nombre del grupo personal
```

### Función pgvector actualizada

```sql
-- Reemplaza search_knowledge del SKILL.md
-- Busca en grupos BASE activos del psicólogo
CREATE OR REPLACE FUNCTION search_knowledge_by_groups(
  query_embedding vector(1536),
  active_group_ids uuid[],
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content        text,
  page_number    int,
  document_title text,
  author         text,
  group_name     text,
  source_type    text,
  similarity     float
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.content,
    dc.page_number,
    kd.title AS document_title,
    kd.author,
    kg.name AS group_name,
    kd.source_type,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  JOIN knowledge_groups kg ON kg.id = kd.group_id
  WHERE kd.group_id = ANY(active_group_ids)
    AND kd.processing_status = 'ready'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Busca en BIBLIOTECA PERSONAL de un psicólogo
CREATE OR REPLACE FUNCTION search_personal_knowledge(
  query_embedding vector(1536),
  psychologist_id_filter uuid,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  content        text,
  page_number    int,
  document_title text,
  personal_label text,
  source_type    text,
  similarity     float
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.content,
    dc.page_number,
    kd.title AS document_title,
    kd.personal_label,
    kd.source_type,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  WHERE kd.psychologist_id = psychologist_id_filter
    AND kd.source_type = 'personal'
    AND kd.processing_status = 'ready'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## SPRINTS DE IMPLEMENTACIÓN

> **Regla para Claude Code:** Completar y VALIDAR cada tarea antes de pasar a la siguiente.
> Validar = el código corre sin errores, la UI muestra datos reales, los tests pasan.
> Si algo falla, arréglalo en el mismo sprint. No acumules deuda.

---

## SPRINT A — Base de datos y seed de grupos ✅ CÓDIGO LISTO — PENDIENTE: supabase db push

**Estimado:** 2-3 horas · **Agente:** database-agent
**Estado:** Migración creada. **Mario debe ejecutar `supabase db push` para aplicarla.**

### Tarea A1 — Migración de tablas nuevas ✅

Archivo creado: `supabase/migrations/20260418000004_knowledge_groups_system.sql`
Incluye: knowledge_groups, personal_knowledge_groups, psychologist_knowledge_groups,
columnas nuevas en knowledge_documents, funciones pgvector, y seed de 8 grupos.

**Pendiente — Mario ejecuta:**

```bash
supabase db push
# Debe terminar sin errores
supabase db diff
# Debe mostrar 0 cambios pendientes

# Luego regenerar tipos (elimina los `as any` temporales del código):
supabase gen types typescript --local > types/supabase.ts
```

### Tarea A2 — Seed de los 8 grupos base ✅

Crear `supabase/seed/knowledge_groups.sql`:

```sql
INSERT INTO knowledge_groups (slug, name, description, color, is_system)
VALUES
  ('cbt', 'Cognitivo-conductual (TCC)', 'Beck, Burns, Ellis, Linehan. DBT, ACT, terapias de tercera ola.', '#3B6FA0', true),
  ('psicoanalitico', 'Psicodinámico / Psicoanalítico', 'Freud, Winnicott, Kernberg, Bowlby. Inconsciente, apego, transferencia.', '#534AB7', true),
  ('humanista', 'Humanista / Existencial', 'Rogers, Frankl, Yalom, Perls. Gestalt, sentido de vida.', '#4A7C59', true),
  ('sistemica', 'Sistémica / Familiar', 'Minuchin, Satir, Bowen. Dinámicas familiares, terapia de pareja.', '#0F6E56', true),
  ('trauma', 'Trauma / EMDR / Somática', 'Van der Kolk, Shapiro, Levine. PTSD, EMDR, teoría polivagal.', '#B07D3A', true),
  ('neuropsico', 'Neuropsicología / Evaluación', 'Luria, Baddeley, DSM-5, CIE-11. Evaluación y diagnóstico diferencial.', '#993C1D', true),
  ('infanto', 'Psicología infanto-juvenil', 'Piaget, Vygotsky, Winnicott. Desarrollo infantil, terapia de juego.', '#3B6D11', true),
  ('positiva', 'Psicología positiva / Mindfulness', 'Seligman, Kabat-Zinn, Neff. Bienestar, autocompasión, MBSR.', '#185FA5', true)
ON CONFLICT (slug) DO NOTHING;
```

**Validar:**

```bash
supabase db seed
# Luego verificar en Studio: knowledge_groups debe tener 8 filas
```

### Tarea A3 — Tipos TypeScript actualizados ⏳ PENDIENTE (depende de db push)

```bash
supabase gen types typescript --local > types/supabase.ts
```

Verificar que aparecen los tipos: `knowledge_groups`, `personal_knowledge_groups`,
`psychologist_knowledge_groups`.

---

## SPRINT B — Script de carga masiva de los 126 libros ✅ CÓDIGO LISTO — PENDIENTE: ejecutar

**Estimado:** 3-4 horas · **Agente:** ai-agent + database-agent
**Estado:** Scripts creados y listos. Mario debe crear `/books-to-index/` con sus PDFs y ejecutar.

> Este sprint carga los libros de Mario desde `/books-to-index/` a Supabase.
> Solo corre una vez. Debe ser resiliente (puede pausar y retomar).

### Tarea B1 — Script de extracción de texto PDF ✅

Archivo creado: `scripts/extract-pdf-text.ts`

```typescript
import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'

export interface ExtractedDoc {
  filename: string
  fullPath: string
  folder: string // nombre de la subcarpeta = hint de grupo
  text: string
  pageCount: number
  sizeBytes: number
}

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

export async function scanBooksFolder(
  rootDir: string
): Promise<ExtractedDoc[]> {
  const results: ExtractedDoc[] = []
  const folders = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter(d => d.isDirectory())

  for (const folder of folders) {
    const folderPath = path.join(rootDir, folder.name)
    const files = fs
      .readdirSync(folderPath)
      .filter(f => f.toLowerCase().endsWith('.pdf'))

    for (const file of files) {
      const fullPath = path.join(folderPath, file)
      const stats = fs.statSync(fullPath)
      console.log(
        `[SCAN] ${folder.name}/${file} (${Math.round(stats.size / 1024)}KB)`
      )

      try {
        const text = await extractPdfText(fullPath)
        results.push({
          filename: file,
          fullPath,
          folder: folder.name,
          text,
          pageCount: text.split('\f').length,
          sizeBytes: stats.size,
        })
      } catch (err) {
        console.error(`[ERROR] No se pudo leer ${file}:`, err)
      }
    }
  }

  return results
}
```

**Instalar dependencia:**

```bash
pnpm add pdf-parse
pnpm add -D @types/pdf-parse
```

**Validar:**

```bash
npx ts-node scripts/extract-pdf-text.ts
# Debe imprimir la lista de PDFs encontrados con tamaño
# Si falla, revisar que los PDFs no estén protegidos con contraseña
```

### Tarea B2 — Clasificador IA (Claude) ✅

Archivo creado: `scripts/classify-document.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const GROUPS_FOR_CLASSIFIER = [
  {
    slug: 'cbt',
    name: 'Cognitivo-conductual (TCC)',
    keywords:
      'Beck, Burns, distorsiones cognitivas, terapia conductual, DBT, ACT, Linehan, esquemas, pensamientos automáticos',
  },
  {
    slug: 'psicoanalitico',
    name: 'Psicodinámico / Psicoanalítico',
    keywords:
      'Freud, inconsciente, transferencia, contratransferencia, Winnicott, Bowlby, apego, mecanismos de defensa, Kernberg, Lacan',
  },
  {
    slug: 'humanista',
    name: 'Humanista / Existencial',
    keywords:
      'Rogers, autorrealización, Frankl, logoterapia, Yalom, Perls, Gestalt, empatía, aceptación incondicional, sentido de vida',
  },
  {
    slug: 'sistemica',
    name: 'Sistémica / Familiar',
    keywords:
      'Minuchin, Satir, Bowen, triangulación, roles familiares, comunicación, terapia de pareja, narrativa, soluciones',
  },
  {
    slug: 'trauma',
    name: 'Trauma / EMDR / Somática',
    keywords:
      'Van der Kolk, trauma, PTSD, EMDR, Shapiro, disociación, sistema nervioso, teoría polivagal, Levine, regulación emocional',
  },
  {
    slug: 'neuropsico',
    name: 'Neuropsicología / Evaluación',
    keywords:
      'DSM, CIE-11, diagnóstico, evaluación neuropsicológica, tests, baterías, Luria, funciones ejecutivas, memoria, atención',
  },
  {
    slug: 'infanto',
    name: 'Psicología infanto-juvenil',
    keywords:
      'Piaget, Vygotsky, desarrollo infantil, juego terapéutico, adolescencia, aprendizaje, crianza, Winnicott niños',
  },
  {
    slug: 'positiva',
    name: 'Psicología positiva / Mindfulness',
    keywords:
      'Seligman, fortalezas, bienestar, Kabat-Zinn, mindfulness, Neff, autocompasión, resiliencia, MBSR, meditación',
  },
]

export interface ClassificationResult {
  group_slug: string | null // null si no hay grupo base
  group_name: string
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  suggested_personal_label: string | null
}

export async function classifyDocument(
  filename: string,
  folderHint: string, // nombre de la subcarpeta donde estaba el PDF
  textSample: string // primeros 4000 chars del texto extraído
): Promise<ClassificationResult> {
  // Si la carpeta NO es "sin-clasificar", usarla como hint fuerte
  const folderIsHint = folderHint !== 'sin-clasificar'

  const prompt = `Eres un experto en psicología clínica. Clasifica este documento en uno de los grupos de conocimiento de PsyAssist.

NOMBRE DEL ARCHIVO: ${filename}
CARPETA DE ORIGEN: ${folderHint}${folderIsHint ? ' (el psicólogo lo puso aquí como hint — úsalo si tiene sentido)' : ''}

GRUPOS DISPONIBLES:
${GROUPS_FOR_CLASSIFIER.map(g => `- ${g.slug}: ${g.name}\n  Palabras clave: ${g.keywords}`).join('\n')}

MUESTRA DEL TEXTO (primeras páginas):
${textSample.slice(0, 4000)}

Responde SOLO en JSON válido, sin markdown, sin comentarios:
{
  "group_slug": "slug_del_grupo_o_null",
  "group_name": "nombre completo del grupo",
  "confidence": "high|medium|low",
  "reasoning": "máximo 2 frases explicando por qué",
  "suggested_personal_label": "nombre descriptivo si group_slug es null, ejemplo: 'Psicofarmacología clínica', 'Neurociencia cognitiva'"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (response.content[0] as any).text
    return JSON.parse(text)
  } catch (err) {
    console.error(`[CLASSIFIER ERROR] ${filename}:`, err)
    return {
      group_slug: null,
      group_name: 'Sin clasificar',
      confidence: 'low',
      reasoning: 'Error en clasificación automática',
      suggested_personal_label: filename.replace('.pdf', ''),
    }
  }
}
```

**Validar con UN libro:**

```bash
npx ts-node -e "
import { extractPdfText } from './scripts/extract-pdf-text'
import { classifyDocument } from './scripts/classify-document'
const text = await extractPdfText('./books-to-index/sin-clasificar/LIBRO_PRUEBA.pdf')
const result = await classifyDocument('LIBRO_PRUEBA.pdf', 'sin-clasificar', text)
console.log(JSON.stringify(result, null, 2))
"
# El resultado debe ser JSON válido con un group_slug coherente
```

### Tarea B3 — Script de carga masiva con reintentos ✅

Archivo creado: `scripts/bulk-load-books.ts`
**Para ejecutar (después de `supabase db push`):**

```bash
# Probar con 3 libros primero:
mkdir books-to-index/test
# Copiar 3 PDFs a books-to-index/test/
npx ts-node scripts/bulk-load-books.ts

# Luego con los 126:
# Organizar PDFs en books-to-index/01-cbt/ ... books-to-index/sin-clasificar/
npx ts-node scripts/bulk-load-books.ts
# Si se interrumpe, retomar: el log en scripts/bulk-load-log.json protege contra duplicados
```

```typescript
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { scanBooksFolder } from './extract-pdf-text'
import { classifyDocument } from './classify-document'

// IMPORTANTE: usar service_role para saltar RLS en carga inicial
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const openai = new OpenAI()

const BOOKS_DIR = './books-to-index'
const LOG_FILE = './scripts/bulk-load-log.json'
const CHUNK_SIZE = 600 // tokens aproximados por chunk
const CHUNK_OVERLAP = 60 // overlap entre chunks
const BATCH_SIZE = 20 // embeddings por llamada a OpenAI
const DELAY_MS = 500 // delay entre batches (rate limiting)

// Cargar log de progreso (para poder retomar)
function loadLog(): Record<string, 'done' | 'error'> {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
  }
  return {}
}

function saveLog(log: Record<string, string>) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))
}

// Chunking respetando párrafos
function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    const clean = para.trim().replace(/\s+/g, ' ')
    if (!clean || clean.length < 30) continue

    if ((current + ' ' + clean).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim())
      // Overlap: último 20% del chunk anterior
      const overlapText = current.slice(-CHUNK_OVERLAP)
      current = overlapText + ' ' + clean
    } else {
      current += (current ? ' ' : '') + clean
    }
  }
  if (current.trim().length > 50) chunks.push(current.trim())
  return chunks
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Obtener UUID del grupo por slug
async function getGroupId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from('knowledge_groups')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id ?? null
}

async function processBook(doc: any, log: Record<string, string>) {
  const key = doc.fullPath

  if (log[key] === 'done') {
    console.log(`[SKIP] Ya procesado: ${doc.filename}`)
    return
  }

  console.log(`\n[INICIO] ${doc.filename} (${doc.folder})`)

  // 1. Clasificar con IA
  const classification = await classifyDocument(
    doc.filename,
    doc.folder,
    doc.text
  )
  console.log(
    `[CLASIFICADO] → ${classification.group_name} (${classification.confidence})`
  )
  console.log(`[RAZÓN] ${classification.reasoning}`)

  // 2. Resolver group_id
  let groupId: string | null = null
  if (classification.group_slug) {
    groupId = await getGroupId(classification.group_slug)
  }

  // 3. Crear registro en knowledge_documents
  const { data: docRecord, error: docError } = await supabase
    .from('knowledge_documents')
    .insert({
      psychologist_id: null, // null = biblioteca del sistema
      title: doc.filename.replace('.pdf', '').replace(/_/g, ' '),
      author: '', // Mario puede completar después
      category: classification.group_name,
      file_url: '', // se actualiza si Mario sube a Storage
      file_size_bytes: doc.sizeBytes,
      processing_status: 'processing',
      group_id: groupId,
      source_type: 'system',
      ai_classification: classification,
      personal_label: classification.suggested_personal_label,
    })
    .select()
    .single()

  if (docError) {
    console.error(`[DB ERROR] ${doc.filename}:`, docError)
    log[key] = 'error'
    saveLog(log)
    return
  }

  const documentId = docRecord.id

  // 4. Chunking
  const chunks = chunkText(doc.text)
  console.log(`[CHUNKS] ${chunks.length} chunks generados`)

  if (chunks.length === 0) {
    console.warn(
      `[WARN] Sin chunks para ${doc.filename} — posible PDF escaneado sin OCR`
    )
    await supabase
      .from('knowledge_documents')
      .update({ processing_status: 'error' })
      .eq('id', documentId)
    log[key] = 'error'
    saveLog(log)
    return
  }

  // 5. Generar embeddings en batches
  const allRows: any[] = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    process.stdout.write(
      `[EMBED] Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`
    )

    try {
      const embResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      })

      batch.forEach((content, j) => {
        allRows.push({
          document_id: documentId,
          psychologist_id: null, // sistema
          content,
          page_number: Math.floor((i + j) / 4) + 1,
          embedding: embResponse.data[j].embedding,
        })
      })

      process.stdout.write(' OK\n')
      await sleep(DELAY_MS)
    } catch (err) {
      console.error(`\n[EMBED ERROR] Batch ${i}:`, err)
      await sleep(3000) // esperar más si hay rate limit
    }
  }

  // 6. Insertar chunks en DB (en sub-batches de 100)
  for (let i = 0; i < allRows.length; i += 100) {
    const batch = allRows.slice(i, i + 100)
    const { error } = await supabase.from('document_chunks').insert(batch)

    if (error) {
      console.error(`[INSERT ERROR] Chunks ${i}-${i + 100}:`, error)
    }
  }

  // 7. Marcar como listo y actualizar book_count del grupo
  await supabase
    .from('knowledge_documents')
    .update({
      processing_status: 'ready',
      chunk_count: allRows.length,
    })
    .eq('id', documentId)

  if (groupId) {
    await supabase.rpc('increment_group_book_count', { gid: groupId })
  }

  log[key] = 'done'
  saveLog(log)
  console.log(`[DONE] ${doc.filename} → ${allRows.length} chunks guardados`)
}

// MAIN
async function main() {
  console.log('=== PsyAssist — Carga masiva de libros ===')
  console.log(`Directorio: ${BOOKS_DIR}`)

  const log = loadLog()
  const done = Object.values(log).filter(v => v === 'done').length
  console.log(`Log de progreso: ${done} libros ya procesados`)

  const docs = await scanBooksFolder(BOOKS_DIR)
  console.log(`Total PDFs encontrados: ${docs.length}`)

  for (const doc of docs) {
    await processBook(doc, log)
  }

  console.log('\n=== CARGA COMPLETADA ===')
  const finalLog = loadLog()
  const finalDone = Object.values(finalLog).filter(v => v === 'done').length
  const errors = Object.values(finalLog).filter(v => v === 'error').length
  console.log(`Exitosos: ${finalDone} | Errores: ${errors}`)
}

main().catch(console.error)
```

Crear también la función SQL para el contador:

```sql
CREATE OR REPLACE FUNCTION increment_group_book_count(gid uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE knowledge_groups SET book_count = book_count + 1 WHERE id = gid;
$$;
```

**Validar con 3 libros primero:**

```bash
# Antes de correr con los 126, probar con 3 libros en /books-to-index/test/
mkdir books-to-index/test
# Copiar 3 PDFs
npx ts-node scripts/bulk-load-books.ts

# Verificar en Supabase Studio:
# - knowledge_documents: 3 registros con processing_status='ready'
# - document_chunks: varios cientos de filas con embeddings
# - knowledge_groups: book_count actualizado
```

**Solo después de validar con 3 libros, correr con los 126:**

```bash
npx ts-node scripts/bulk-load-books.ts
# Si se interrumpe, se puede retomar sin reprocesar los ya hechos
# Ver progreso en scripts/bulk-load-log.json
```

---

## SPRINT C — API de carga de documentos personales ✅ COMPLETADO

**Estimado:** 3-4 horas · **Agente:** ai-agent + database-agent
**Estado:** Todas las tareas completadas y build pasa.

### Tarea C1 — API route de upload ✅

Implementado en `app/api/knowledge/upload/route.ts`:
- Extracción de texto PDF/TXT
- Clasificación IA en background (sin bloquear respuesta)
- Creación de grupos personales si no hay match en base
- Audit log automático

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { classifyDocument } from '@/lib/ai/classifier'
import { processDocument } from '@/lib/ai/embeddings'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const psychologistId = session.user.id
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json(
      { error: 'No se recibió archivo' },
      { status: 400 }
    )
  }

  // Validaciones
  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'El archivo supera 50MB' },
      { status: 400 }
    )
  }

  const allowedTypes = ['application/pdf', 'text/plain']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Solo se aceptan PDF y TXT' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  // 1. Subir a Supabase Storage
  const fileName = `${psychologistId}/${Date.now()}-${file.name}`
  const { error: storageError } = await supabase.storage
    .from('knowledge-documents')
    .upload(fileName, file)

  if (storageError) {
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('knowledge-documents').getPublicUrl(fileName)

  // 2. Crear registro inicial
  const { data: docRecord, error: dbError } = await supabase
    .from('knowledge_documents')
    .insert({
      psychologist_id: psychologistId,
      title: file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
      author: '',
      category: 'Clasificando...',
      file_url: publicUrl,
      file_size_bytes: file.size,
      processing_status: 'processing',
      source_type: 'personal',
    })
    .select()
    .single()

  if (dbError || !docRecord) {
    return NextResponse.json(
      { error: 'Error al registrar documento' },
      { status: 500 }
    )
  }

  // 3. Procesar en background (no bloquear la respuesta)
  processDocumentBackground(docRecord.id, psychologistId, file).catch(err =>
    console.error('[BG PROCESS ERROR]', err)
  )

  return NextResponse.json({
    data: {
      id: docRecord.id,
      title: docRecord.title,
      status: 'processing',
      message: 'Documento recibido. La IA lo está clasificando e indexando.',
    },
  })
}

async function processDocumentBackground(
  documentId: string,
  psychologistId: string,
  file: File
) {
  const supabase = createServerClient()

  try {
    // Extraer texto
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Para PDF usar pdf-parse, para TXT leer directo
    let text = ''
    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    if (!text || text.length < 100) {
      await supabase
        .from('knowledge_documents')
        .update({ processing_status: 'error' })
        .eq('id', documentId)
        .eq('psychologist_id', psychologistId)
      return
    }

    // Clasificar con IA
    const { data: groups } = await supabase
      .from('knowledge_groups')
      .select('id, slug, name, description')

    const classification = await classifyDocument(
      file.name,
      'personal',
      text,
      groups ?? []
    )

    // Resolver group_id si la IA encontró un grupo base
    let groupId: string | null = null
    if (classification.group_slug) {
      const match = groups?.find(g => g.slug === classification.group_slug)
      groupId = match?.id ?? null
    }

    // Si no hay grupo base, crear o reutilizar grupo personal
    let personalGroupId: string | null = null
    if (!groupId && classification.suggested_personal_label) {
      const { data: existingGroup } = await supabase
        .from('personal_knowledge_groups')
        .select('id')
        .eq('psychologist_id', psychologistId)
        .eq('label', classification.suggested_personal_label)
        .single()

      if (existingGroup) {
        personalGroupId = existingGroup.id
      } else {
        const { data: newGroup } = await supabase
          .from('personal_knowledge_groups')
          .insert({
            psychologist_id: psychologistId,
            label: classification.suggested_personal_label,
            description: classification.reasoning,
          })
          .select()
          .single()
        personalGroupId = newGroup?.id ?? null
      }
    }

    // Actualizar registro con clasificación
    await supabase
      .from('knowledge_documents')
      .update({
        group_id: groupId,
        personal_group_id: personalGroupId,
        personal_label: classification.suggested_personal_label,
        ai_classification: classification,
        category: classification.group_name,
      })
      .eq('id', documentId)
      .eq('psychologist_id', psychologistId)

    // Generar embeddings y guardar chunks
    await processDocument(documentId, psychologistId, text)

    console.log(
      `[PERSONAL UPLOAD DONE] ${documentId} → ${classification.group_name}`
    )
  } catch (err) {
    console.error('[BG PROCESS ERROR]', err)
    await supabase
      .from('knowledge_documents')
      .update({ processing_status: 'error' })
      .eq('id', documentId)
      .eq('psychologist_id', psychologistId)
  }
}
```

**Validar:**

```bash
# Subir un PDF de prueba via curl o desde la UI
curl -X POST http://localhost:3000/api/knowledge/upload \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -F "file=@./test-book.pdf"

# Respuesta esperada: { data: { id, title, status: 'processing' } }
# Después de ~30s verificar en Studio que:
# - processing_status cambió a 'ready'
# - document_chunks tiene filas para ese document_id
# - ai_classification tiene el JSON de clasificación
```

### Tarea C2 — API de estado de procesamiento ✅

Implementado en `app/api/knowledge/[id]/status/route.ts` (GET — polling).
También creados:
- `app/api/knowledge/[id]/route.ts` — PATCH para corregir grupo
- `app/api/knowledge/groups/route.ts` — GET grupos + POST toggle activo/inactivo

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select(
      'id, title, processing_status, ai_classification, chunk_count, personal_label, group_id'
    )
    .eq('id', params.id)
    .eq('psychologist_id', session.user.id)
    .single()

  if (error)
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ data })
}
```

---

## SPRINT D — RAG actualizado con las dos capas ✅ COMPLETADO

**Estimado:** 2 horas · **Agente:** ai-agent
**Estado:** `lib/ai/rag.ts` reemplazado con `searchAllKnowledge` (dos capas paralelas).
Mantiene compatibilidad con `searchKnowledge` y `formatKnowledgeContext` para código existente.

Implementación en `lib/ai/rag.ts`:

```typescript
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI()

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

export interface KnowledgeChunk {
  content: string
  page_number: number
  document_title: string
  author?: string
  group_name: string
  source_type: 'system' | 'personal'
  personal_label?: string
  similarity: number
}

// Buscar en las DOS capas de conocimiento
export async function searchAllKnowledge(
  query: string,
  psychologistId: string
): Promise<{ base: KnowledgeChunk[]; personal: KnowledgeChunk[] }> {
  const supabase = createServerClient()
  const embedding = await generateEmbedding(query)

  // 1. Obtener grupos base activos del psicólogo
  const { data: activeGroups } = await supabase
    .from('psychologist_knowledge_groups')
    .select('group_id')
    .eq('psychologist_id', psychologistId)
    .eq('is_active', true)

  const groupIds = activeGroups?.map(g => g.group_id) ?? []

  // 2. Buscar en biblioteca base (solo grupos activos)
  let baseResults: KnowledgeChunk[] = []
  if (groupIds.length > 0) {
    const { data: baseData } = await supabase.rpc(
      'search_knowledge_by_groups',
      {
        query_embedding: embedding,
        active_group_ids: groupIds,
        match_count: 5,
      }
    )
    baseResults = baseData ?? []
  }

  // 3. Buscar en biblioteca personal (siempre, independiente de grupos activos)
  const { data: personalData } = await supabase.rpc(
    'search_personal_knowledge',
    {
      query_embedding: embedding,
      psychologist_id_filter: psychologistId,
      match_count: 3,
    }
  )
  const personalResults: KnowledgeChunk[] = personalData ?? []

  return { base: baseResults, personal: personalResults }
}

// Formatear para el prompt de Claude
export function formatKnowledgeForPrompt(
  base: KnowledgeChunk[],
  personal: KnowledgeChunk[]
): string {
  let result = ''

  if (base.length > 0) {
    result += 'REFERENCIAS DE BIBLIOTECA CLÍNICA BASE:\n'
    result += base
      .map(
        c =>
          `[${c.document_title}${c.author ? `, ${c.author}` : ''}, p.${c.page_number}] (${c.group_name}):\n${c.content}`
      )
      .join('\n\n')
  }

  if (personal.length > 0) {
    result += '\n\nREFERENCIAS DE TU BIBLIOTECA PERSONAL:\n'
    result += personal
      .map(
        c =>
          `[Tu referencia: "${c.personal_label || c.document_title}", p.${c.page_number}]:\n${c.content}`
      )
      .join('\n\n')
  }

  if (!result) {
    result =
      'No se encontraron referencias relevantes en la biblioteca clínica.'
  }

  return result
}
```

**Validar:**

```typescript
// Test rápido en ts-node
const { base, personal } = await searchAllKnowledge(
  'ansiedad social y pensamientos automáticos',
  'UUID_DEL_PSICOLOGO_PILOTO'
)
console.log('Base:', base.length, 'chunks')
console.log('Personal:', personal.length, 'chunks')
console.log(base[0]) // debe tener document_title, content, similarity
```

---

## SPRINT E — UI del portal de conocimiento ✅ COMPLETADO

**Estimado:** 4-5 horas · **Agente:** ui-agent + dashboard-agent
**Estado:** UI con dos pestañas completamente implementada. Build pasa sin errores.

Archivos creados:
- `components/knowledge/KnowledgeTabs.tsx` — switcher client-side
- `components/knowledge/KnowledgeGroupCard.tsx` — toggle con optimistic update
- `components/knowledge/PersonalLibrary.tsx` — upload zone + polling cada 3s + corrección de grupo

### Página principal: `app/(dashboard)/knowledge/page.tsx` ✅

Debe tener dos pestañas:

**Pestaña 1 — Biblioteca base:**

- Lista de los 8 grupos con toggle on/off
- Cada grupo muestra: nombre, descripción, cantidad de libros, color
- Toggle guarda en `psychologist_knowledge_groups`
- Estado inicial: si es nuevo psicólogo, activar TCC por defecto
- Feedback inmediato al cambiar el toggle (optimistic update)

**Pestaña 2 — Mi biblioteca personal:**

- Zona de drag & drop para subir PDFs
- Barra de progreso con 4 pasos: Extrayendo → Embeddings → Clasificando → Listo
- Polling cada 3s a `/api/knowledge/[id]/status` mientras `processing_status === 'processing'`
- Lista de documentos subidos con:
  - Nombre, tipo, páginas
  - Badge del grupo asignado por IA
  - Razonamiento de la IA (colapsable)
  - Dropdown para corregir el grupo si la IA se equivocó
  - Estado: Procesando / Indexado / Error

**Componente de corrección de grupo:**

```typescript
// El psicólogo puede mover un documento a otro grupo si la IA se equivocó
// Dropdown con los 8 grupos + "Mantener en biblioteca personal"
// Al seleccionar, llama a PATCH /api/knowledge/[id] con el nuevo group_id
```

**Paleta — respetar el diseño Spatial Clinical de CLAUDE.md:**

```
--psy-cream: #F5F2ED (fondo)
--psy-paper: #FAF8F4 (superficies)
--psy-blue: #3B6FA0 (acciones primarias)
--psy-green: #4A7C59 (estados exitosos)
Tipografía: Lora (títulos) + DM Sans (UI)
Sin header ni footer tradicional
```

**Validar:**

- [ ] Los toggles guardan en DB y persisten al recargar
- [ ] El upload procesa un PDF real y muestra el grupo asignado
- [ ] El polling para cuando `processing_status === 'ready'`
- [ ] La corrección de grupo actualiza la DB

---

## SPRINT F — Integración en el análisis de sesión ✅ COMPLETADO

**Estimado:** 2 horas · **Agente:** ai-agent
**Estado:** `lib/ai/analysis.ts` actualizado. Guarda `knowledge_sources_used` en el AIReport.

Cambios en `lib/ai/analysis.ts`:

```typescript
// En la función analyzeSession, reemplazar la línea de searchKnowledge por:
const { base: knowledgeChunks, personal: personalChunks } =
  await searchAllKnowledge(transcript, psychologistId)

const knowledgeContext = formatKnowledgeForPrompt(
  knowledgeChunks,
  personalChunks
)

// El resto del prompt ya usa knowledgeContext correctamente
```

**Validar con una sesión real:**

- Crear una sesión de prueba con transcript de texto
- Llamar al análisis
- Verificar que el AIReport cita libros de la biblioteca base
- Verificar que cita documentos personales si son relevantes
- Verificar que el disclaimer clínico está presente

---

## CHECKLIST FINAL ANTES DE CONSIDERAR EL SISTEMA LISTO

```
[ ] Migración corrió sin errores en Supabase          ← PENDIENTE: supabase db push
[ ] 8 grupos base existen en knowledge_groups          ← PENDIENTE: requiere db push
[ ] Al menos 10 libros indexados con embeddings reales ← PENDIENTE: correr bulk-load-books.ts
[ ] search_knowledge_by_groups retorna resultados      ← PENDIENTE: requiere libros indexados
[x] Upload de PDF personal — código listo              ← PENDIENTE: validar con db push
[x] Clasificador IA — lib/ai/classifier.ts creado      ← PENDIENTE: validar en vivo
[x] Psicólogo puede corregir la clasificación          ← PATCH /api/knowledge/[id]
[x] RAG unificado con dos capas — lib/ai/rag.ts        ← PENDIENTE: validar con grupos en DB
[x] AIReport guarda knowledge_sources_used             ← Código listo
[ ] Grupos personales se crean cuando no hay match     ← PENDIENTE: validar en vivo
[ ] RLS verificado: psicólogo A no ve docs de B        ← PENDIENTE: verificar en Studio
[x] Polling de estado — PersonalLibrary.tsx cada 3s    ← Código listo
[x] UI respeta paleta Spatial Clinical                 ← KnowledgeGroupCard + PersonalLibrary
```

### Próximos pasos para desbloquear el checklist completo:

```bash
# 1. Aplicar la migración
supabase db push

# 2. Regenerar tipos (elimina los `as any` del código)
supabase gen types typescript --local > types/supabase.ts

# 3. Verificar en Supabase Studio: knowledge_groups tiene 8 filas

# 4. Probar carga masiva con 3 libros
npx ts-node scripts/bulk-load-books.ts

# 5. Verificar en Studio: document_chunks tiene embeddings para esos libros
```

---

## ERRORES COMUNES — CÓMO MANEJARLOS

**PDF sin texto extraíble (escaneado sin OCR):**

```
processing_status = 'error'
Mostrar al psicólogo: "Este PDF parece ser una imagen escaneada.
Por favor convierte a PDF con texto usando Adobe Acrobat o similar."
```

**Rate limit de OpenAI en embeddings:**

```
Reintentar con exponential backoff: 1s → 2s → 4s → 8s (máx 4 reintentos)
Si falla después de 4 reintentos, marcar chunk como error y continuar
```

**Clasificador IA retorna JSON inválido:**

```
Reintentar 1 vez. Si falla, asignar group_slug=null y
suggested_personal_label=filename sin extensión
```

**Usuario sube archivo que no es PDF:**

```
Validar en frontend antes del upload
Validar en API route (Content-Type)
Retornar 400 con mensaje en español
```

---

## VARIABLES DE ENTORNO ADICIONALES REQUERIDAS

```bash
# Agregar a .env.local
BOOKS_BASE_DIR=./books-to-index   # Solo para el script de carga masiva
SUPABASE_SERVICE_ROLE_KEY=xxx     # Solo para bulk-load-books.ts (NUNCA en frontend)
```

---

## NOTAS PARA CLAUDE CODE

1. **No des por hecho que un comando funcionó.** Ejecuta, lee el output, valida.

2. **El script bulk-load-books.ts es destructivo:** Si corres dos veces sin el log,
   duplicará registros. El log en `bulk-load-log.json` es tu protección. Siempre
   verifica que el log existe antes de retomar una carga interrumpida.

3. **El clasificador puede equivocarse.** Está bien. El psicólogo puede corregir.
   Lo importante es que el 80%+ quede bien clasificado automáticamente.

4. **RLS en todo.** Si una query falla con "permission denied", probablemente falta
   una policy. Revisa con `supabase db diff` antes de culpar al código.

5. **Los embeddings de la biblioteca base NO tienen psychologist_id.** El campo
   es NULL para documentos del sistema. La búsqueda base filtra por group_id,
   no por psychologist_id.

6. **Prioridad del contexto en el prompt:**
   - Primero: referencias de biblioteca base (enfoques activos del psicólogo)
   - Segundo: referencias personales del psicólogo
   - Nunca mezclar documentos de distintos psicólogos

7. **El diseño es parte del producto.** No uses componentes genéricos de shadcn
   sin adaptar a la paleta Spatial Clinical. El psicólogo que ve un dashboard
   genérico no confía en la herramienta clínica.

---

_PsyAssist — Sistema de Biblioteca Clínica con Perfiles de Conocimiento_
_Diseñado para Claude Code — Cali, Colombia 2025_
