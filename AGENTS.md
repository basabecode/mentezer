# AGENTS.md — PsyAssist

## Equipo de Agentes Especializados con Orquestador Central

> **Para Claude Code:** Este archivo reemplaza el AGENTS.md anterior.
> Lee CLAUDE.md completo antes de activar cualquier agente.
> El orquestador es el único que recibe instrucciones directamente de Mario.
> Los subagentes solo actúan cuando el orquestador los invoca.

---

## ARQUITECTURA DEL EQUIPO

```
Mario
  └─► ORQUESTADOR (orchestrator-agent)
        ├─► CAPA 1: Infraestructura
        │     ├─ setup-agent
        │     ├─ database-agent
        │     ├─ auth-agent
        │     └─ security-agent
        ├─► CAPA 2: Inteligencia Clínica
        │     ├─ book-ingestor-agent
        │     ├─ classifier-agent
        │     ├─ rag-agent
        │     └─ clinical-analyst-agent
        ├─► CAPA 3: Producto
        │     ├─ ui-agent
        │     ├─ patients-agent
        │     ├─ sessions-agent
        │     └─ dashboard-agent
        └─► CAPA 4: Plataforma
              ├─ recorder-agent
              ├─ reports-agent
              ├─ saas-agent
              └─ qa-agent
```

**Regla de oro de todo el equipo:**
Ningún agente da por implementado algo que no haya validado ejecutando código real.
Si un paso falla, se detiene y reporta al orquestador antes de continuar.

---

## ORQUESTADOR — orchestrator-agent

**Archivo:** `.claude/agents/orchestrator-agent.md`
**Activa cuando:** Mario describe cualquier tarea, feature, bug o pregunta técnica.

### Responsabilidad

Es el director del proyecto. Recibe cada instrucción de Mario, la descompone en
tareas atómicas, asigna cada una al agente correcto, coordina dependencias entre
agentes, y reporta el estado de avance a Mario en lenguaje claro.

### Proceso obligatorio al recibir una tarea

```
1. LEER: CLAUDE.md + AGENTS.md + KNOWLEDGE_SYSTEM.md completos
2. ANALIZAR: ¿Qué capa del sistema afecta? ¿Qué agentes necesito?
3. VERIFICAR: ¿Hay dependencias entre agentes? ¿En qué orden deben actuar?
4. PLANIFICAR: Listar subtareas con agente asignado y orden de ejecución
5. EJECUTAR: Invocar agentes en orden, esperando validación de cada uno
6. REPORTAR: Decirle a Mario qué se hizo, qué falta, y qué sigue en el roadmap
```

### Cómo delega

```
[ORQUESTADOR → database-agent]
Tarea: Crear migración para tabla knowledge_groups
Contexto: Ver sección "Arquitectura de base de datos" en KNOWLEDGE_SYSTEM.md
Validar: Ejecutar supabase db push y confirmar 0 errores antes de continuar
```

### Reglas del orquestador

- NUNCA implementa código directamente — siempre delega a un subagente
- NUNCA avanza al siguiente agente si el anterior reportó un error
- SIEMPRE verifica que el roadmap en CLAUDE.md no sea violado
- SIEMPRE responde a Mario en español, con un resumen de qué pasó y qué sigue
- Si una tarea involucra datos clínicos, siempre involucra a security-agent primero
- Si una tarea involucra IA, siempre involucra a qa-agent al final

### Tabla de routing de tareas comunes

| Mario dice                     | Agentes involucrados                                       | Orden      |
| ------------------------------ | ---------------------------------------------------------- | ---------- |
| "Configura el proyecto"        | setup-agent → database-agent → auth-agent → security-agent | Secuencial |
| "Carga los 126 libros"         | book-ingestor-agent → classifier-agent → rag-agent         | Secuencial |
| "El psicólogo sube un PDF"     | book-ingestor-agent → classifier-agent → rag-agent         | Secuencial |
| "Analiza esta sesión"          | rag-agent → clinical-analyst-agent                         | Secuencial |
| "Nueva pantalla de X"          | ui-agent → sessions-agent (si aplica) → qa-agent           | Secuencial |
| "Hay un bug en Y"              | [agente dueño de Y] → qa-agent                             | Secuencial |
| "Agrega campo Z a la DB"       | database-agent → [agente que usa Z]                        | Secuencial |
| "Nuevo feature de privacidad"  | security-agent → database-agent → [agente de UI]           | Secuencial |
| "Genera informe de derivación" | rag-agent → clinical-analyst-agent → reports-agent         | Secuencial |

---

## CAPA 1: INFRAESTRUCTURA

---

### AGENTE 01 — setup-agent

**Archivo:** `.claude/agents/setup-agent.md`
**Activa cuando:** Orquestador detecta tarea de inicialización o configuración de entorno.

#### Responsabilidad

Inicializar el proyecto desde cero con el stack correcto. Solo actúa una vez,
en la fase inicial. Si el proyecto ya existe, verifica integridad del setup.

#### Tareas en orden

```bash
# 1. Crear el proyecto Next.js
pnpm create next-app psyassist --typescript --tailwind --app --use-pnpm

# 2. Instalar dependencias de producción
pnpm add @supabase/supabase-js @supabase/ssr next-auth@5 \
  @anthropic-ai/sdk openai zod pdf-parse \
  @react-pdf/renderer react-email resend \
  @fullcalendar/react @fullcalendar/daygrid \
  framer-motion sonner

# 3. Instalar dependencias de desarrollo
pnpm add -D @types/pdf-parse supabase ts-node

# 4. Instalar shadcn/ui
npx shadcn@latest init

# 5. Inicializar Supabase local
supabase init
supabase start
```

#### Archivos que debe crear

`tailwind.config.ts` — con la paleta Spatial Clinical completa:

```typescript
// Colores PsyAssist (NO modificar, son el ADN del diseño)
colors: {
  psy: {
    cream:       '#F5F2ED',
    paper:       '#FAF8F4',
    ink:         '#1C1B18',
    muted:       '#6B6760',
    border:      'rgba(28,27,24,0.10)',
    blue:        '#3B6FA0',
    'blue-light':'#EAF1F8',
    green:       '#4A7C59',
    'green-light':'#EBF4EE',
    amber:       '#B07D3A',
    'amber-light':'#FBF3E4',
    red:         '#C0392B',
    'red-light': '#FDECEA',
  }
}
// Fuentes: Lora (serif) + DM Sans (sans) + DM Mono (mono)
```

`.env.example`:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### Validaciones obligatorias antes de reportar OK

```bash
pnpm build          # debe terminar sin errores TypeScript
pnpm type-check     # 0 errores
supabase status     # debe mostrar servicios corriendo
```

---

### AGENTE 02 — database-agent

**Archivo:** `.claude/agents/database-agent.md`
**Activa cuando:** Orquestador detecta necesidad de crear/modificar schema, migraciones, RLS o funciones SQL.

#### Responsabilidad

Único responsable del esquema de base de datos. Toda tabla, columna, índice,
función o policy pasa por este agente. Nunca bypasea RLS.

#### Reglas absolutas

```
✗ NUNCA crear tabla sin RLS habilitado
✗ NUNCA crear tabla sin created_at timestamptz DEFAULT now()
✗ NUNCA hacer INSERT/UPDATE directo sin verificar ownership
✗ NUNCA exponer service_role en código frontend
✓ SIEMPRE crear policies SELECT, INSERT, UPDATE, DELETE por separado
✓ SIEMPRE añadir psychologist_id uuid REFERENCES psychologists(id) cuando aplique
✓ SIEMPRE usar supabase migration new [nombre-descriptivo]
✓ SIEMPRE ejecutar supabase db push y verificar 0 errores
✓ SIEMPRE regenerar tipos: supabase gen types typescript --local > types/supabase.ts
```

#### Esquema completo que debe conocer

Ver sección "Modelo de datos" en CLAUDE.md más las tablas adicionales de
KNOWLEDGE_SYSTEM.md:

- `knowledge_groups` — grupos base del sistema
- `personal_knowledge_groups` — grupos personales por psicólogo
- `psychologist_knowledge_groups` — selección de grupos activos
- Columnas nuevas en `knowledge_documents`: `group_id`, `source_type`, `ai_classification`, `personal_label`

#### Funciones pgvector que debe mantener

```sql
-- Búsqueda en grupos base activos
search_knowledge_by_groups(query_embedding, active_group_ids[], match_count)

-- Búsqueda en biblioteca personal
search_personal_knowledge(query_embedding, psychologist_id_filter, match_count)

-- Búsqueda en casos exitosos (existente)
search_cases(query_embedding, psychologist_id_filter, match_count)

-- Contador de libros por grupo
increment_group_book_count(gid uuid)
```

#### Validación después de cada migración

```bash
supabase db push          # 0 errores
supabase db diff          # 0 cambios pendientes
pnpm type-check           # 0 errores en tipos generados
```

---

### AGENTE 03 — auth-agent

**Archivo:** `.claude/agents/auth-agent.md`
**Activa cuando:** Orquestador detecta tareas de login, registro, sesiones, tokens o Google OAuth.

#### Responsabilidad

Implementar y mantener el sistema de autenticación con NextAuth 5 y Supabase.
Gestiona sesiones, tokens JWT, OAuth con Google y el flujo de onboarding.

#### Stack de autenticación

```typescript
// NextAuth 5 (Auth.js) con dos providers:
// 1. Credentials (email + password) — para psicólogos
// 2. Google OAuth — opcional

// Configuración base: lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
```

#### Flujo de autenticación completo

```
1. Psicólogo ingresa email + password
2. NextAuth verifica contra tabla psychologists en Supabase
3. Si válido: JWT con { id, email, name, plan }
4. Middleware de Next.js protege /dashboard/* y /api/*
5. Cada Server Component y API route llama getServerSession()
6. RLS de Supabase valida psychologist_id en cada query
```

#### Archivos que gestiona

- `lib/auth.ts` — configuración NextAuth
- `middleware.ts` — protección de rutas
- `app/(auth)/login/page.tsx` — pantalla de login
- `app/(auth)/register/page.tsx` — pantalla de registro
- `app/api/auth/[...nextauth]/route.ts` — handler de NextAuth

#### Reglas de seguridad

```
✗ NUNCA guardar contraseñas en texto plano — usar bcrypt
✗ NUNCA exponer JWT secrets en variables sin prefijo NEXT_PUBLIC_
✗ NUNCA confiar en datos del token sin verificar en DB
✓ SIEMPRE verificar sesión en API routes antes de cualquier operación
✓ SIEMPRE verificar que psychologist_id del token === psychologist_id del recurso
✓ SIEMPRE usar httpOnly cookies para el token de sesión
```

#### Validaciones

```bash
# Probar login con credenciales válidas → redirección a /dashboard
# Probar login con credenciales inválidas → mensaje de error en español
# Probar acceso a /dashboard sin sesión → redirección a /login
# Probar acceso a /api/sessions sin sesión → 401
```

---

### AGENTE 04 — security-agent

**Archivo:** `.claude/agents/security-agent.md`
**Activa cuando:** Cualquier tarea que involucre datos clínicos, privacidad, Ley 1581, o eliminación de datos.

#### Responsabilidad

Guardián de la privacidad y seguridad. Audita cualquier feature que toque datos
de pacientes. Implementa el derecho al olvido, audit logs, y cumplimiento de Ley 1581.

#### Checklist de seguridad (ejecutar en cada feature que toque datos clínicos)

```
[ ] ¿La tabla tiene RLS habilitado?
[ ] ¿Hay policies para SELECT, INSERT, UPDATE, DELETE?
[ ] ¿Se verifica consent_signed_at antes de crear Session o AIReport?
[ ] ¿El audio está cifrado antes de subir a Storage?
[ ] ¿El AuditLog registra esta acción?
[ ] ¿Los errores al usuario no exponen datos internos?
[ ] ¿Los embeddings están segregados por psychologist_id?
[ ] ¿El endpoint de derecho al olvido elimina en cascada todo lo relacionado?
[ ] ¿El disclaimer clínico está presente en outputs de IA?
```

#### Implementaciones que gestiona

**Audit Log — registrar toda acción sobre datos clínicos:**

```typescript
// lib/audit.ts
export async function logAudit({
  psychologistId,
  action, // 'view_patient' | 'create_session' | 'delete_patient' | ...
  resourceType, // 'patient' | 'session' | 'ai_report' | ...
  resourceId,
  metadata,
}: AuditEntry) {
  // INSERT en audit_logs — nunca falla silenciosamente
}
```

**Derecho al olvido — eliminación total de un paciente:**

```typescript
// app/api/patients/[id]/delete/route.ts
// Elimina en cascada:
// 1. Audio files en Storage
// 2. document_chunks del paciente
// 3. Transcripts
// 4. AIReports
// 5. TherapeuticPlans
// 6. Appointments
// 7. Registro en patients
// 8. Registra en DataDeletionRequest
```

**Verificación de consentimiento:**

```typescript
// lib/consent.ts
export async function requireConsent(
  patientId: string,
  psychologistId: string
) {
  const { data } = await supabase
    .from('patients')
    .select('consent_signed_at')
    .eq('id', patientId)
    .eq('psychologist_id', psychologistId)
    .single()

  if (!data?.consent_signed_at) {
    throw new Error('El paciente no ha firmado el consentimiento informado')
  }
}
```

#### Disclaimer clínico (NUNCA omitir en outputs de IA)

```
⚠️ Este contenido es una herramienta de apoyo al criterio clínico.
El diagnóstico, tratamiento y decisiones clínicas son responsabilidad
exclusiva del profesional de salud mental. PsyAssist no reemplaza la
evaluación clínica profesional.
```

---

## CAPA 2: INTELIGENCIA CLÍNICA

---

### AGENTE 05 — book-ingestor-agent

**Archivo:** `.claude/agents/book-ingestor-agent.md`
**Activa cuando:** Orquestador detecta tareas de carga de PDFs, extracción de texto, o procesamiento de documentos.

#### Responsabilidad

Especialista en ingestión de documentos. Extrae texto de PDFs y documentos,
hace chunking inteligente respetando párrafos, y prepara el contenido para
que classifier-agent y rag-agent lo procesen.

#### Dónde están los libros de Mario

```
/books-to-index/
  /01-cbt/
  /02-psicoanalitico/
  /03-humanista/
  /04-sistemica/
  /05-trauma/
  /06-neuropsico/
  /07-infanto/
  /08-positiva/
  /sin-clasificar/    ← los que Mario no sabe clasificar
```

#### Pipeline de extracción

```typescript
// lib/ingestor/extract.ts

// 1. DETECTAR tipo de documento
type DocType = 'pdf-text' | 'pdf-scanned' | 'txt' | 'docx' | 'unsupported'

// 2. EXTRAER texto según tipo
// pdf-text: usar pdf-parse (rápido, exacto)
// pdf-scanned: reportar error — requiere OCR externo
// txt: leer directo
// docx: usar mammoth

// 3. LIMPIAR texto extraído
function cleanText(raw: string): string {
  return raw
    .replace(/\f/g, '\n') // form feeds → newlines
    .replace(/\r\n/g, '\n') // normalizar saltos de línea
    .replace(/\n{3,}/g, '\n\n') // máx 2 líneas en blanco
    .replace(/[^\S\n]+/g, ' ') // espacios múltiples → uno
    .trim()
}

// 4. CHUNKING que respeta párrafos (NO cortar frases)
function chunkText(text: string, maxChunk = 600, overlap = 80): string[] {
  // Dividir en párrafos primero
  // Acumular hasta maxChunk caracteres
  // Al exceder: guardar chunk, retomar con overlap del anterior
  // Resultado: chunks semánticamente coherentes
}
```

#### Manejo de errores específicos

```
PDF sin texto extraíble → processing_status='error', mensaje al psicólogo
PDF protegido con contraseña → idem
Archivo mayor a 50MB → rechazar antes de subir
Texto menor a 100 chars → considerar PDF escaneado, reportar
Encoding no UTF-8 → intentar conversión, si falla reportar
```

#### Script de carga masiva (solo para los 126 libros de Mario)

Ver implementación completa en `KNOWLEDGE_SYSTEM.md` — Sprint B.

El script `scripts/bulk-load-books.ts` incluye:

- Log de progreso en `scripts/bulk-load-log.json` para poder pausar/retomar
- Rate limiting entre batches de embeddings
- Reintentos con backoff exponencial
- Reporte final de éxitos y errores

**Validar con 3 libros antes de correr con los 126.**

---

### AGENTE 06 — classifier-agent

**Archivo:** `.claude/agents/classifier-agent.md`
**Activa cuando:** Orquestador detecta un documento que necesita ser clasificado en un grupo de conocimiento.

#### Responsabilidad

Usa Claude para leer cada documento y decidir en qué grupo de conocimiento clínico
pertenece. Para documentos personales del psicólogo, también genera una etiqueta
descriptiva si no hay grupo base que aplique.

#### Los 8 grupos que conoce

```typescript
const CLINICAL_GROUPS = [
  {
    slug: 'cbt',
    name: 'Cognitivo-conductual (TCC)',
    keywords:
      'Beck, Burns, distorsiones cognitivas, DBT, ACT, pensamientos automáticos, esquemas, exposición',
  },
  {
    slug: 'psicoanalitico',
    name: 'Psicodinámico / Psicoanalítico',
    keywords:
      'Freud, inconsciente, transferencia, Winnicott, apego, mecanismos de defensa, Kernberg, Lacan',
  },
  {
    slug: 'humanista',
    name: 'Humanista / Existencial',
    keywords:
      'Rogers, autorrealización, Frankl, logoterapia, Yalom, Perls, Gestalt, empatía, sentido de vida',
  },
  {
    slug: 'sistemica',
    name: 'Sistémica / Familiar',
    keywords:
      'Minuchin, Satir, Bowen, triangulación, roles familiares, comunicación, terapia de pareja',
  },
  {
    slug: 'trauma',
    name: 'Trauma / EMDR / Somática',
    keywords:
      'Van der Kolk, trauma, PTSD, EMDR, Shapiro, disociación, teoría polivagal, Levine',
  },
  {
    slug: 'neuropsico',
    name: 'Neuropsicología / Evaluación',
    keywords:
      'DSM, CIE-11, diagnóstico diferencial, tests, baterías, Luria, funciones ejecutivas, memoria',
  },
  {
    slug: 'infanto',
    name: 'Psicología infanto-juvenil',
    keywords:
      'Piaget, Vygotsky, desarrollo infantil, juego terapéutico, adolescencia, crianza',
  },
  {
    slug: 'positiva',
    name: 'Psicología positiva / Mindfulness',
    keywords:
      'Seligman, fortalezas, bienestar, Kabat-Zinn, mindfulness, Neff, autocompasión, MBSR',
  },
]
```

#### Prompt de clasificación

```typescript
// lib/ai/classifier.ts
export async function classifyDocument(
  filename: string,
  folderHint: string,
  textSample: string, // primeros 4000 chars
  availableGroups: Group[]
): Promise<ClassificationResult> {
  const prompt = `Eres un experto en psicología clínica.
Clasifica este documento en UNO de los grupos disponibles.

NOMBRE DEL ARCHIVO: ${filename}
CARPETA DE ORIGEN: ${folderHint}

GRUPOS DISPONIBLES:
${availableGroups.map(g => `- ${g.slug}: ${g.name} | Palabras clave: ${g.keywords}`).join('\n')}

TEXTO DEL DOCUMENTO:
${textSample}

REGLAS:
- Si la carpeta de origen coincide con un grupo, priorízala como hint fuerte
- Si el texto es ambiguo entre dos grupos, elige el más específico
- Si definitivamente no encaja en ningún grupo, group_slug debe ser null
- En ese caso, suggested_personal_label debe describir el tema en 2-4 palabras

Responde SOLO en JSON válido sin markdown:
{
  "group_slug": "slug_o_null",
  "group_name": "nombre completo",
  "confidence": "high|medium|low",
  "reasoning": "máximo 2 frases",
  "suggested_personal_label": "Descripción breve si group_slug es null"
}`

  // Llamar a Claude, parsear JSON, retornar
}
```

#### Flujo de decisión

```
Documento recibido
  │
  ├─ ¿Carpeta de origen es un grupo conocido?
  │     └─ SÍ → usar como hint, confirmar con texto
  │
  ├─ Leer primeros 4000 chars con Claude
  │
  ├─ ¿group_slug retornado tiene confidence >= 'medium'?
  │     ├─ SÍ → asignar a grupo base (group_id en knowledge_documents)
  │     └─ NO → crear o reutilizar grupo personal (personal_knowledge_groups)
  │
  └─ Reportar a book-ingestor-agent el resultado para guardar en DB
```

#### Validaciones

```
✓ JSON resultado siempre parseable (manejo de error con reintento)
✓ group_slug siempre existe en knowledge_groups o es null
✓ Si null, suggested_personal_label NUNCA vacío
✓ Log de clasificación guardado en ai_classification (jsonb)
```

---

### AGENTE 07 — rag-agent

**Archivo:** `.claude/agents/rag-agent.md`
**Activa cuando:** Orquestador detecta necesidad de búsqueda semántica, generación de embeddings, o recuperación de contexto clínico.

#### Responsabilidad

Especialista en RAG (Retrieval-Augmented Generation). Genera embeddings,
ejecuta búsquedas vectoriales en pgvector, y ensambla el contexto clínico
que clinical-analyst-agent necesita para el análisis.

#### Modelo de embeddings

```
Modelo: text-embedding-3-small (OpenAI)
Dimensiones: 1536
Costo: ~$0.02 por millón de tokens
Batch máximo: 100 inputs por llamada
Rate limit: manejar con delay de 500ms entre batches
```

#### Pipeline de búsqueda — dos capas simultáneas

```typescript
// lib/ai/rag.ts

export async function searchAllKnowledge(
  query: string,
  psychologistId: string
): Promise<{ base: KnowledgeChunk[]; personal: KnowledgeChunk[] }> {
  // 1. Generar embedding de la query
  const embedding = await generateEmbedding(query)

  // 2. Obtener grupos base activos del psicólogo
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

#### Formateo del contexto para Claude

```typescript
export function formatKnowledgeForPrompt(
  base: KnowledgeChunk[],
  personal: KnowledgeChunk[]
): string {
  // Biblioteca base: "[Beck (1979), TCC, p.112]: texto..."
  // Biblioteca personal: "[Tu investigación: Duelo migratorio, p.8]: texto..."
  // Si ambas vacías: mensaje de ausencia de contexto
}
```

#### Validaciones

```
✓ Embeddings generados tienen 1536 dimensiones
✓ Búsqueda retorna al menos 1 resultado cuando hay libros indexados
✓ Resultados ordenados por similitud descendente
✓ Chunks de biblioteca personal solo del psychologist_id correcto (RLS)
✓ Contexto formateado es legible por Claude (no excede 8000 tokens)
```

---

### AGENTE 08 — clinical-analyst-agent

**Archivo:** `.claude/agents/clinical-analyst-agent.md`
**Activa cuando:** Orquestador detecta análisis post-sesión, generación de AIReport, plan terapéutico o informe de derivación.

#### Responsabilidad

El cerebro clínico de PsyAssist. Recibe el contexto ensamblado por rag-agent
y genera los outputs clínicos: AIReport, planes terapéuticos e informes de
derivación. SIEMPRE cita fuentes. SIEMPRE incluye disclaimer.

#### Modelo IA

```
Modelo: claude-sonnet-4-20250514
Max tokens respuesta: 4000 (análisis) | 2000 (plan) | 2500 (derivación)
Temperatura: 0 (reproducibilidad clínica)
Idioma output: español colombiano clínico formal
```

#### Pipeline 1 — Análisis post-sesión (AIReport)

```typescript
// lib/ai/analysis.ts
export async function analyzeSession({
  transcript,
  patientContext,
  previousSessionsSummary,
  psychologistId,
}: AnalysisInput): Promise<AIReport> {
  // 1. Verificar consentimiento (security-agent)
  await requireConsent(patientId, psychologistId)

  // 2. Recuperar contexto de rag-agent
  const { base, personal } = await searchAllKnowledge(
    transcript,
    psychologistId
  )
  const knowledgeContext = formatKnowledgeForPrompt(base, personal)

  // 3. Recuperar casos similares
  const similarCases = await searchSimilarCases(
    transcript.slice(0, 2000),
    psychologistId
  )

  // 4. Ensamblar prompt y llamar a Claude
  // 5. Parsear JSON y guardar en ai_reports
  // 6. Registrar en AuditLog
}
```

**Estructura del AIReport (JSON):**

```typescript
interface AIReport {
  summary: string
  patterns: Array<{ pattern: string; evidence: string; source: string }>
  diagnostic_hints: Array<{
    hypothesis: string
    basis: string
    book: string
    page: string
  }>
  risk_signals: Array<{
    signal: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
  similar_cases: Array<{ title: string; similarity: string; outcome: string }>
  evolution_vs_previous: string
  therapeutic_suggestions: Array<{ suggestion: string; basis: string }>
  knowledge_sources_used: Array<{
    title: string
    author: string
    group: string
  }>
  disclaimer: string // SIEMPRE el disclaimer clínico
}
```

#### Pipeline 2 — Informe de derivación

```
Input: patient_id + recipient_specialty + reason_for_referral
  └─► Fetch: ficha del paciente + AIReports + plan activo
      └─► Claude genera carta profesional formal
          └─► Psicólogo revisa y aprueba
              └─► reports-agent genera PDF + envía email
```

#### Pipeline 3 — Plan terapéutico

```
Input: AIReport más reciente + objetivos previos + casos similares
  └─► Claude genera borrador: objetivos + intervenciones + indicadores
      └─► Psicólogo edita y aprueba
          └─► Plan guardado en therapeutic_plans
              └─► Opcional: visible al paciente
```

#### Reglas absolutas

```
✗ NUNCA generar diagnóstico definitivo — solo "hipótesis diagnóstica exploratoria"
✗ NUNCA omitir el disclaimer clínico
✗ NUNCA afirmar sin citar fuente de la biblioteca
✓ SIEMPRE citar libro, autor y página en observaciones clínicas
✓ SIEMPRE guardar el AIReport en DB antes de mostrar al psicólogo
✓ SIEMPRE registrar en AuditLog qué libros se usaron en el análisis
```

---

## CAPA 3: PRODUCTO

---

### AGENTE 09 — ui-agent

**Archivo:** `.claude/agents/ui-agent.md`
**Activa cuando:** Orquestador detecta creación o modificación de componentes de interfaz.

#### Responsabilidad

Implementar el diseño "Spatial Clinical" de PsyAssist en todos los componentes.
Garantizar que ninguna pantalla se vea como un SaaS genérico.

#### Sistema de diseño — NUNCA violar estas reglas

```typescript
// Paleta obligatoria (de CLAUDE.md — versión actualizada)
const DESIGN_TOKENS = {
  // Fondos
  'psy-cream': '#F5F2ED', // fondo principal
  'psy-paper': '#FAF8F4', // superficies, cards
  // Texto
  'psy-ink': '#1C1B18', // texto principal
  'psy-muted': '#6B6760', // texto secundario
  // Acciones
  'psy-blue': '#3B6FA0', // confianza clínica
  'psy-blue-light': '#EAF1F8',
  // Estados
  'psy-green': '#4A7C59', // éxito, progreso
  'psy-amber': '#B07D3A', // advertencia
  'psy-red': '#C0392B', // riesgo alto
} as const

// Tipografía
// 'Lora' → títulos, análisis IA, informes (serif = calidez clínica)
// 'DM Sans' → UI general, formularios, navegación
// 'DM Mono' → timestamps, IDs, datos técnicos

// Prohibiciones absolutas
// ✗ #FFFFFF puro (usar --psy-paper)
// ✗ 'Inter' (usar DM Sans)
// ✗ Header y footer tradicionales
// ✗ Modo oscuro en v1.0
// ✗ Emojis decorativos (usar SVG icons)
```

#### Shell de la aplicación

```typescript
// Estructura obligatoria del layout del dashboard
// app/(dashboard)/layout.tsx

// ┌──────────────────────────────────────────────┐
// │  Topbar contextual (saludo + stats + avatar)  │
// ├────────────┬─────────────────────────────────┤
// │            │                                  │
// │   Panel    │   Contenido principal            │
// │  lateral   │   (cream background)             │
// │  (paper)   │                                  │
// │            │                                  │
// └────────────┴─────────────────────────────────┘
//      ▲ Dock flotante inferior (macOS style)
```

#### Componentes base que debe crear primero

```
components/shell/
  Topbar.tsx          — saludo, stats del día, avatar del psicólogo
  PatientPanel.tsx    — panel lateral con ficha del paciente activo
  FloatingDock.tsx    — navegación inferior flotante (se oculta al scroll)
  SettingsDrawer.tsx  — drawer lateral con ajustes y soporte

components/ui/
  SkeletonCard.tsx    — loader para todos los componentes async
  RiskBadge.tsx       — badge con pulso para señales de riesgo
  ClinicalCard.tsx    — card base con textura paper
  SourceCitation.tsx  — componente para citar libro + autor + página
```

#### Validaciones de diseño

```
✓ Fondo de la app es --psy-cream, no blanco
✓ Cards usan --psy-paper con borde sutil
✓ Títulos en Lora serif
✓ UI en DM Sans
✓ Ninguna pantalla tiene header + nav + footer tradicional
✓ Skeleton loaders en todos los componentes con datos async
✓ Alertas de riesgo "high" tienen animación de pulso
```

---

### AGENTE 10 — patients-agent

**Archivo:** `.claude/agents/patients-agent.md`
**Activa cuando:** Orquestador detecta operaciones sobre pacientes, fichas, consentimientos.

#### Responsabilidad

CRUD completo de pacientes con todas las reglas de privacidad.
Gestiona consentimiento informado, estados del paciente y derecho al olvido.

#### Estados del paciente

```typescript
type PatientStatus = 'active' | 'paused' | 'closed'
// active: en terapia activa
// paused: pausa temporal acordada
// closed: proceso terminado (no eliminar datos automáticamente)
```

#### Flujo de consentimiento

```
1. Crear ficha del paciente (datos básicos)
2. Mostrar formulario de consentimiento digital
3. Paciente firma (checkbox + timestamp)
4. Guardar consent_signed_at + consent_document_url
5. Solo DESPUÉS de este paso se pueden crear sesiones y grabaciones
```

#### Derecho al olvido

```typescript
// app/api/patients/[id]/delete/route.ts
// ORDEN OBLIGATORIO de eliminación:
// 1. Archivos de audio en Storage
// 2. document_chunks del paciente
// 3. embeddings en clinical_cases
// 4. transcripts
// 5. ai_reports
// 6. referral_reports
// 7. therapeutic_plans + plan_objectives
// 8. appointments
// 9. audit_logs (excepto el log de la propia eliminación)
// 10. registro en patients
// 11. INSERT en data_deletion_requests (registro permanente de que se eliminó)
// 12. Confirmación al psicólogo por email
```

#### Validaciones

```
✓ No se puede crear Session sin consent_signed_at
✓ Eliminación requiere confirmación doble del psicólogo
✓ Eliminación registrada en data_deletion_requests
✓ AuditLog registra cada acceso a ficha de paciente
✓ Número de documento cifrado en storage (no en texto plano)
```

---

### AGENTE 11 — sessions-agent

**Archivo:** `.claude/agents/sessions-agent.md`
**Activa cuando:** Orquestador detecta operaciones sobre sesiones — crear, transcribir, analizar, completar.

#### Responsabilidad

Orquesta el ciclo de vida completo de una sesión clínica: desde la grabación o
upload de audio hasta el AIReport final disponible para el psicólogo.

#### Estados de una sesión

```typescript
type SessionStatus =
  | 'scheduled' // agendada, sin audio aún
  | 'recording' // grabando en tiempo real
  | 'uploaded' // audio subido, pendiente de transcribir
  | 'transcribing' // Whisper procesando
  | 'analyzing' // Claude analizando
  | 'complete' // AIReport disponible
  | 'error' // algo falló — ver session.error_message
```

#### Pipeline completo de una sesión

```
[INICIO]
  │
  ├─► Verificar consent_signed_at del paciente (security-agent)
  │
  ├─► Modo presencial: recorder-agent graba audio
  │   Modo virtual: psicólogo sube MP3/WAV/M4A
  │
  ├─► Subir audio a Storage cifrado (AES-256)
  │   status → 'uploaded'
  │
  ├─► Llamar a Whisper API (español, large-v3)
  │   status → 'transcribing'
  │   Guardar transcript en transcripts tabla
  │
  ├─► rag-agent recupera contexto clínico
  │
  ├─► clinical-analyst-agent genera AIReport
  │   status → 'analyzing'
  │
  ├─► Guardar AIReport en ai_reports
  │   status → 'complete'
  │
  ├─► Notificar al psicólogo (toast + email opcional)
  │
  └─► AuditLog: sesión completada
```

#### Manejo de errores por etapa

```typescript
// Cada etapa tiene su error específico con mensaje en español:
'transcription_failed'  → "No se pudo transcribir el audio. ¿El archivo está completo?"
'analysis_failed'       → "Error en el análisis clínico. Puedes reintentarlo."
'storage_failed'        → "Error al guardar el audio. Verifica tu conexión."
'no_knowledge_found'    → "No hay libros indexados para los enfoques activos."
```

---

### AGENTE 12 — dashboard-agent

**Archivo:** `.claude/agents/dashboard-agent.md`
**Activa cuando:** Orquestador detecta trabajo en el panel principal del psicólogo.

#### Responsabilidad

Construir y mantener el dashboard clínico principal: agenda del día,
alertas de riesgo, estadísticas y accesos rápidos.

#### Datos que muestra

```typescript
interface DashboardData {
  // Agenda del día
  todaySessions: Appointment[]

  // Alertas críticas (severity: 'high' en ai_reports recientes)
  riskAlerts: Array<{
    patient: Patient
    signal: string
    severity: 'high'
    from_session: string
  }>

  // Métricas
  stats: {
    activePatients: number
    sessionsThisMonth: number
    pendingAnalysis: number // sesiones sin AIReport
    knowledgeBooks: number // total libros indexados
  }

  // Accesos rápidos
  recentPatients: Patient[]
  nextSession: Appointment | null
}
```

#### Reglas de visualización

```
✓ Alertas "high" siempre visibles con pulso (nunca colapsadas por defecto)
✓ Skeleton loaders mientras cargan datos
✓ Datos del día actualizados en tiempo real (Supabase Realtime)
✓ Nunca mostrar nombre completo del paciente en notificaciones push
✓ Sesiones pendientes de análisis con CTA directo para analizarlas
```

---

## CAPA 4: PLATAFORMA

---

### AGENTE 13 — recorder-agent

**Archivo:** `.claude/agents/recorder-agent.md`
**Activa cuando:** Orquestador detecta componentes de grabación de audio.

#### Responsabilidad

Implementar grabación de audio en el navegador con Web Audio API.
Garantizar calidad óptima para Whisper y verificar consentimiento antes de grabar.

#### Configuración técnica óptima para Whisper

```typescript
const RECORDING_CONSTRAINTS = {
  audio: {
    sampleRate: 16000, // Whisper prefiere 16kHz
    channelCount: 1, // mono es suficiente
    echoCancellation: true, // para sesiones virtuales
    noiseSuppression: true,
    autoGainControl: true,
  },
}

const MIME_TYPE = 'audio/webm;codecs=opus' // mejor compatibilidad
const CHUNK_INTERVAL = 10000 // 10 segundos por chunk
const MAX_DURATION = 3 * 60 * 60 * 1000 // máx 3 horas
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (límite Whisper)
```

#### Flujo de grabación

```
1. Verificar que consent_signed_at existe (security-agent)
2. Solicitar permiso de micrófono al navegador
3. Mostrar indicador visual de grabación activa
4. Grabar en chunks de 10 segundos (por si se cae la conexión)
5. Al detener: combinar chunks en un solo blob
6. Mostrar preview de duración y tamaño
7. Confirmar subida → sessions-agent toma el control
```

#### Modos de sesión

```
Presencial: recorder-agent graba el audio en el dispositivo del psicólogo
Virtual: psicólogo descarga el audio de Meet/Zoom y lo sube manualmente
         Formatos aceptados: MP3, WAV, M4A, WEBM (máx 25MB)
```

---

### AGENTE 14 — reports-agent

**Archivo:** `.claude/agents/reports-agent.md`
**Activa cuando:** Orquestador detecta generación de PDFs clínicos o envío de emails.

#### Responsabilidad

Generar PDFs profesionales de informes clínicos y enviarlos por email.
Gestiona informes de derivación, planes terapéuticos compartidos y
confirmaciones de cita.

#### PDFs que genera

```typescript
// 1. Informe de derivación (ReferralReport)
//    - Carta profesional formal en formato médico colombiano
//    - Firma digital del psicólogo
//    - Códigos CIE-11 si aplica
//    - Logo PsyAssist sutil en pie de página

// 2. Plan terapéutico (para compartir con paciente)
//    - Objetivos en lenguaje accesible (no clínico)
//    - Progreso visual por objetivo
//    - Mensaje personalizado del psicólogo

// 3. Resumen de sesión (para el psicólogo)
//    - AIReport completo con fuentes
//    - Señales de riesgo destacadas
//    - Sugerencias terapéuticas
```

#### Emails que envía (via Resend)

```
ReferralLetter.tsx    → Carta de derivación con PDF adjunto
AppointmentConfirm.tsx → Confirmación de cita al paciente
AppointmentReminder.tsx → Recordatorio 24h antes
PlanShare.tsx         → Plan terapéutico compartido

Paleta de emails: misma que el producto (cream/paper, no blanco corporativo frío)
```

#### Validaciones

```
✓ PDF generado antes de marcar status='sent'
✓ Email enviado solo si pdf_url existe
✓ patient_acknowledged_at actualizado cuando el paciente abre el email
✓ AuditLog registra envío de informe
✓ Nunca enviar datos clínicos en el cuerpo del email (solo en PDF adjunto)
```

---

### AGENTE 15 — saas-agent

**Archivo:** `.claude/agents/saas-agent.md`
**Activa cuando:** Orquestador detecta tareas de suscripciones, pagos o multi-tenancy.

#### ⚠️ INACTIVO HASTA v2.0

Este agente NO debe activarse en v1.0 ni v1.5. Si el orquestador recibe una
tarea de Stripe o suscripciones antes de tiempo, debe responder:
"Esta funcionalidad está planificada para v2.0. Actualmente estamos en v1.0."

#### Planes para cuando se active

```
Starter:      $29 USD/mes — 1 psicólogo, 20 pacientes activos, 50 PDFs biblioteca
Professional: $59 USD/mes — 1 psicólogo, ilimitado, 200 PDFs, exportación PDF
Clinic:       $149 USD/mes — hasta 5 psicólogos, admin central, reportes consolidados
```

---

### AGENTE 16 — qa-agent

**Archivo:** `.claude/agents/qa-agent.md`
**Activa cuando:** El orquestador lo invoca al final de cada sprint o feature antes de considerar algo "listo".

#### Responsabilidad

El último guardián antes de que algo llegue a producción. Verifica que el código
funciona, que la UI se ve bien, que los datos son correctos, y que la seguridad
no fue comprometida.

#### Checklist obligatorio (ejecutar en orden)

```bash
# 1. TypeScript sin errores
pnpm type-check
# Esperado: 0 errors

# 2. Build exitoso
pnpm build
# Esperado: sin errores, warnings mínimos

# 3. Lint sin errores críticos
pnpm lint
# Esperado: 0 errors (warnings son aceptables)

# 4. Variables de entorno completas
# Verificar manualmente que .env.local tiene todas las variables de .env.example
```

#### Checklist de seguridad

```
[ ] Ninguna ruta de /dashboard/* accesible sin sesión
[ ] Ninguna API route retorna datos sin verificar psychologist_id
[ ] RLS activo en todas las tablas nuevas
[ ] No hay service_role_key en código del lado cliente
[ ] Disclaimer clínico presente en todos los outputs de IA
[ ] AuditLog registra la acción que se implementó
```

#### Checklist de UX

```
[ ] Fondo de la app es --psy-cream (no blanco puro)
[ ] Todas las pantallas con datos async tienen skeleton loader
[ ] Mensajes de error están en español
[ ] Alertas "high" tienen indicador visual de pulso
[ ] Formularios tienen validación en frontend Y backend
[ ] Ninguna pantalla tiene header + footer tradicionales
```

#### Checklist de datos

```
[ ] Las queries de Supabase retornan datos correctos (verificar en Studio)
[ ] Los embeddings tienen 1536 dimensiones
[ ] Los grupos de conocimiento tienen libros indexados
[ ] El clasificador IA produce JSON parseable
[ ] El AIReport tiene todos los campos requeridos
[ ] El disclaimer clínico está en el AIReport guardado en DB
```

#### Reporte final al orquestador

```
ESTADO: ✅ LISTO / ⚠️ CON OBSERVACIONES / ❌ BLOQUEADO

Issues encontrados: [lista]
Issues críticos (bloquean deploy): [lista]
Issues menores (aceptables en esta versión): [lista]

Recomendación: DESPLEGAR / CORREGIR PRIMERO / NO DESPLEGAR
```

---

## TABLA MAESTRA DE ROUTING

| Tarea de Mario                 | Orquestador invoca                                                             | Orden      |
| ------------------------------ | ------------------------------------------------------------------------------ | ---------- |
| "Inicializa el proyecto"       | setup-agent → database-agent → auth-agent → security-agent → qa-agent          | Secuencial |
| "Carga los 126 libros"         | book-ingestor-agent → classifier-agent → rag-agent → qa-agent                  | Secuencial |
| "El psicólogo sube un PDF"     | book-ingestor-agent → classifier-agent → rag-agent                             | Secuencial |
| "Analiza la sesión de hoy"     | security-agent (consent) → rag-agent → clinical-analyst-agent → sessions-agent | Secuencial |
| "Transcribe este audio"        | security-agent → recorder-agent → sessions-agent                               | Secuencial |
| "Genera informe de derivación" | rag-agent → clinical-analyst-agent → reports-agent                             | Secuencial |
| "Nueva pantalla de pacientes"  | ui-agent → patients-agent → security-agent → qa-agent                          | Secuencial |
| "Dashboard del psicólogo"      | ui-agent → dashboard-agent → qa-agent                                          | Secuencial |
| "Agrega campo a la DB"         | database-agent → [agente dueño del feature] → qa-agent                         | Secuencial |
| "Hay un bug en X"              | [agente dueño de X] → qa-agent                                                 | Secuencial |
| "Nueva migración de datos"     | security-agent → database-agent → qa-agent                                     | Secuencial |
| "Configurar emails"            | reports-agent → qa-agent                                                       | Secuencial |
| "Configurar autenticación"     | auth-agent → security-agent → qa-agent                                         | Secuencial |

---

## REGLAS GLOBALES DE TODO EL EQUIPO

```
1. Ningún agente implementa algo sin leer CLAUDE.md primero
2. Ningún agente avanza si el paso anterior falló
3. Ningún agente da por hecho que algo funciona sin ejecutar y validar
4. Ningún agente toca datos de pacientes sin pasar por security-agent
5. Ningún agente genera output de IA sin el disclaimer clínico
6. Ningún agente crea tabla sin RLS
7. Ningún agente usa #FFFFFF puro ni fuente Inter (diseño Spatial Clinical)
8. Todo output al usuario en español colombiano clínico
9. Todo log técnico en inglés
10. qa-agent es el último paso de cualquier feature antes de considerarlo listo
```

---

## ESTRUCTURA DE ARCHIVOS DE AGENTES EN EL REPO

```
.claude/
  agents/
    orchestrator-agent.md
    setup-agent.md
    database-agent.md
    auth-agent.md
    security-agent.md
    book-ingestor-agent.md
    classifier-agent.md
    rag-agent.md
    clinical-analyst-agent.md
    ui-agent.md
    patients-agent.md
    sessions-agent.md
    dashboard-agent.md
    recorder-agent.md
    reports-agent.md
    saas-agent.md
    qa-agent.md
  settings.json
```

---

_PsyAssist — Equipo de 16 Agentes Especializados_
_Orquestado por Mario Bas · Cali, Colombia 🇨🇴_
