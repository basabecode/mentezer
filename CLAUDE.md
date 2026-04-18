# CLAUDE.md — PsyAssist
> **Plataforma SaaS de IA Clínica para Psicólogos**  
> *La primera herramienta clínica que razona sobre la biblioteca propia del profesional*
>
> **Versión:** 2.0 · **Stack:** Next.js 15 + Supabase + Claude · **Mercado:** LATAM (Colombia primero)

---

## 📍 CONTEXTO INICIAL

Antes de cualquier tarea, Claude debe:
1. Leer este archivo completo
2. Revisar `.claude/AGENTS.md` para identificar qué agente aplica
3. Consultar el skill relevante en `.claude/skills/`
4. Verificar el roadmap antes de proponer features nuevos
5. Responder siempre en español (UI, código, comentarios)

---

## 🎯 VISIÓN DEL PRODUCTO

PsyAssist es la plataforma clínica que convierte al psicólogo en un profesional **10x más informado, más rápido y más fundamentado**. No reemplaza al psicólogo — potencia su criterio clínico con su propia biblioteca, sus propios casos exitosos y su propia forma de trabajar.

**Una frase que define el producto:**
> *"Como tener a todos tus libros clínicos y todos tus casos exitosos leyendo la sesión contigo."*

---

## 💎 LOS 5 DIFERENCIADORES ÚNICOS

Competencia (Mentalyc, Upheal, Yung Sidekick, Supanote) cubre transcripción + notas. PsyAssist rompe el molde en 5 dimensiones:

### 1. RAG sobre la biblioteca propia del psicólogo
La IA razona con los libros que el PROPIO profesional usa y confía. Cita libro, autor y página. Ningún competidor hace esto.

### 2. Memoria de casos exitosos
Cada caso cerrado con éxito se convierte en conocimiento reutilizable. El sistema se vuelve más valioso con cada paciente — genera lock-in positivo.

### 3. Informe de derivación automatizado
Específico para Colombia/LATAM: generar cartas profesionales para otro especialista con un clic. **Nadie lo hace.**

### 4. Primer producto nativo hispanohablante
Whisper optimizado español, prompts en español clínico, cumplimiento Ley 1581, UX pensada en contexto latinoamericano.

### 5. Diseño "Spatial Clinical"
Sin header ni footer tradicionales. Dock flotante + panel clínico + drawer lateral. Sensación de expediente digital, no de SaaS genérico.

---

## 🎨 EL WOW — ADN DE DISEÑO

### Concepto: "Spatial Clinical"
Un producto clínico no necesita animaciones flashy — necesita **calma inteligente**. Cada elemento comunica profesionalismo, confianza y atención al detalle.

### Principios visuales (NUNCA violar)
- **Sin header tradicional** — Topbar contextual con saludo + stats + avatar
- **Sin footer tradicional** — Drawer lateral con legal, ajustes y soporte
- **Dock flotante inferior** — Navegación tipo macOS, se esconde al scroll
- **Textura de papel clínico** — Off-white `#FAF8F4`, NUNCA blanco puro
- **Tipografía editorial** — `Lora` (serif) para títulos, `DM Sans` para UI, `DM Mono` para datos técnicos
- **Alertas con pulso** — Señales de riesgo llaman atención sin ser agresivas
- **Sin emojis decorativos** — SVG custom o íconos minimalistas

### Paleta de colores (única, no genérica)
```css
--psy-cream:        #F5F2ED   /* Fondo principal — cálido */
--psy-paper:        #FAF8F4   /* Superficies — papel clínico */
--psy-ink:          #1C1B18   /* Texto — tinta cálida */
--psy-muted:        #6B6760   /* Texto secundario */
--psy-border:       rgba(28,27,24,0.10)

--psy-blue:         #3B6FA0   /* Confianza clínica */
--psy-blue-light:   #EAF1F8
--psy-green:        #4A7C59   /* Progreso / éxito */
--psy-green-light:  #EBF4EE
--psy-amber:        #B07D3A   /* Advertencia */
--psy-amber-light:  #FBF3E4
--psy-red:          #C0392B   /* Riesgo alto */
--psy-red-light:    #FDECEA
```

### Tipografía
```css
--psy-serif: 'Lora', Georgia, serif;       /* Títulos, análisis IA, informes */
--psy-sans:  'DM Sans', system-ui;         /* UI general */
--psy-mono:  'DM Mono', monospace;         /* Timestamps, códigos, IDs */
```

### Regla de oro UX
> *"Si se siente como un SaaS genérico, lo rehacemos."*

---

## 🏗️ STACK TECNOLÓGICO

```
Frontend:        Next.js 15 (App Router, RSC) + Tailwind CSS 3
Auth:            NextAuth 5 (Credentials + Google)
Database:        Supabase (PostgreSQL 16 + RLS)
Vector/RAG:      Supabase pgvector (1536 dims)
Embeddings:      OpenAI text-embedding-3-small
Transcripción:   OpenAI Whisper API (large-v3, idioma español)
IA análisis:     Claude claude-sonnet-4-20250514 (Anthropic SDK)
Storage:         Supabase Storage (audio cifrado + PDFs + informes)
Email:           Resend (plantillas React Email)
PDF:             @react-pdf/renderer (informes clínicos)
Agenda:          FullCalendar + Google Calendar API
Deploy:          Vercel (CI/CD)
Pagos:           Stripe (suscripciones)
Lenguaje:        TypeScript strict
Package mgr:     pnpm
Validación:      Zod
UI Components:   Radix UI (headless) + componentes custom
Animaciones:     Framer Motion (selectivo, no decorativo)
Fonts:           next/font (Lora, DM Sans, DM Mono)
```

**Regla:** No agregar dependencias sin justificar. Cada paquete tiene costo de mantenimiento.

---

## 📁 ESTRUCTURA DEL PROYECTO

```
psyassist/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shell con panel + dock + drawer
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Ficha completa
│   │   │       ├── sessions/
│   │   │       ├── plan/
│   │   │       ├── reports/        # Informes de derivación
│   │   │       └── timeline/
│   │   ├── sessions/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── knowledge/
│   │   ├── cases/
│   │   ├── reports/
│   │   ├── schedule/
│   │   └── settings/
│   ├── (patient)/                  # Portal del paciente (v1.5+)
│   │   ├── book/
│   │   ├── my-reports/
│   │   └── my-plan/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── sessions/
│   │   │   ├── transcribe/
│   │   │   └── analyze/
│   │   ├── knowledge/
│   │   │   ├── upload/
│   │   │   └── search/
│   │   ├── cases/similar/
│   │   ├── patients/
│   │   │   └── [id]/
│   │   │       ├── delete/         # Derecho al olvido
│   │   │       └── referral/       # Generar informe
│   │   ├── reports/
│   │   │   ├── generate/
│   │   │   └── send/
│   │   ├── schedule/
│   │   │   ├── availability/
│   │   │   ├── book/
│   │   │   └── confirm/
│   │   └── webhooks/
│   │       ├── stripe/
│   │       └── google-calendar/
│   └── layout.tsx
├── components/
│   ├── ui/                         # Primitivos
│   ├── shell/
│   │   ├── PatientPanel.tsx
│   │   ├── Topbar.tsx
│   │   ├── FloatingDock.tsx
│   │   └── SettingsDrawer.tsx
│   ├── recorder/
│   ├── transcript/
│   ├── analysis/
│   ├── referral/                   # NUEVO
│   │   ├── ReferralGenerator.tsx
│   │   ├── ReferralPreview.tsx
│   │   └── ReferralPDF.tsx
│   ├── schedule/                   # NUEVO
│   │   ├── AvailabilityEditor.tsx
│   │   ├── BookingWidget.tsx
│   │   └── WeekView.tsx
│   ├── patient/
│   └── plan/
├── emails/                         # React Email templates
│   ├── ReferralLetter.tsx
│   ├── AppointmentConfirm.tsx
│   ├── AppointmentReminder.tsx
│   └── PlanShare.tsx
├── lib/
│   ├── supabase/
│   ├── ai/
│   │   ├── whisper.ts
│   │   ├── embeddings.ts
│   │   ├── rag.ts
│   │   ├── analysis.ts
│   │   └── referral.ts             # NUEVO
│   ├── audio/
│   ├── pdf/
│   │   └── generate.ts
│   ├── email/
│   │   └── send.ts
│   ├── calendar/
│   │   └── google.ts
│   └── utils/
├── supabase/migrations/
├── public/
│   ├── fonts/
│   └── textures/
│       └── paper-noise.svg
├── .claude/
│   ├── settings.json
│   ├── hooks/
│   ├── skills/
│   └── AGENTS.md
└── CLAUDE.md
```

---

## 🗄️ MODELO DE DATOS COMPLETO

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- USUARIOS DEL SISTEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Psychologist
  id, email, name, professional_license
  specialty, country, timezone
  stripe_customer_id, plan, trial_ends_at
  signature_image_url, digital_signature_key
  google_calendar_connected, google_calendar_id
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PACIENTES Y CONSENTIMIENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient
  id, psychologist_id, name, document_id
  age, gender, contact_email, contact_phone
  address, emergency_contact
  reason, referred_by
  status (active|paused|closed)
  consent_signed_at, consent_document_url
  patient_portal_token
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SESIONES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session
  id, patient_id, psychologist_id
  mode (presential|virtual)
  scheduled_at, duration_minutes
  audio_url, audio_deleted_at
  status (scheduled|recording|transcribing|analyzing|complete)
  created_at

Transcript
  id, session_id, content JSONB, edited_at

AIReport
  id, session_id
  summary TEXT
  patterns JSONB
  diagnostic_hints JSONB
  risk_signals JSONB
  similar_cases JSONB
  evolution_vs_previous TEXT
  therapeutic_suggestions JSONB
  disclaimer TEXT
  generated_at, model_used

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PLANES TERAPÉUTICOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TherapeuticPlan
  id, patient_id, psychologist_id
  status (draft|active|completed)
  ai_draft JSONB, approved_plan JSONB
  shared_with_patient_at
  created_at, updated_at

PlanObjective
  id, plan_id, description
  interventions, frequency, indicators
  progress INT (0-100)
  sessions_tracked JSONB

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INFORMES DE DERIVACIÓN (NUEVO - Colombia)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ReferralReport
  id, patient_id, psychologist_id
  recipient_specialist_name
  recipient_specialty
  recipient_email
  reason_for_referral TEXT
  ai_draft TEXT
  approved_content TEXT
  diagnosis_codes JSONB       -- CIE-11
  interventions_summary TEXT
  evolution_summary TEXT
  recommendations TEXT
  pdf_url, email_sent_at
  patient_acknowledged_at
  status (draft|approved|sent|acknowledged)
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AGENDA Y CITAS (NUEVO)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Availability
  id, psychologist_id
  day_of_week (0-6), start_time, end_time
  session_duration_minutes
  buffer_minutes
  is_active

Appointment
  id, psychologist_id, patient_id
  scheduled_at, duration_minutes
  mode (presential|virtual)
  meeting_url
  status (requested|confirmed|completed|cancelled|no_show)
  requested_by (patient|psychologist)
  confirmation_token
  cancellation_reason
  google_calendar_event_id
  created_at

BookingRequest
  id, psychologist_id
  name, email, phone
  preferred_date, alternate_dates JSONB
  reason TEXT
  status (pending|approved|rejected)
  approved_appointment_id
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BASE DE CONOCIMIENTO (RAG)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KnowledgeDocument
  id, psychologist_id
  title, author, category
  file_url, file_size_bytes
  processing_status (pending|processing|ready|error)
  chunk_count, uploaded_at

DocumentChunk
  id, document_id, psychologist_id
  content TEXT
  page_number INT
  embedding vector(1536)

ClinicalCase
  id, psychologist_id, patient_id (anonimizable)
  title, description
  diagnosis_explored, interventions_used
  outcome (successful|partial|failed)
  sessions_count INT
  embedding vector(1536)
  is_indexed BOOLEAN
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUDITORÍA (Ley 1581)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AuditLog
  id, psychologist_id, action
  resource_type, resource_id
  ip_address, user_agent
  metadata JSONB, created_at

DataDeletionRequest
  id, patient_id, psychologist_id
  requested_at, completed_at
  items_deleted JSONB
```

**Reglas absolutas para todas las tablas:**
- RLS habilitado SIEMPRE
- `psychologist_id` presente en casi todas
- Policies específicas SELECT/INSERT/UPDATE/DELETE

---

## 🔒 PRIVACIDAD Y LEY 1581 — NO NEGOCIABLE

### Reglas que NUNCA se rompen
1. **RLS en toda tabla** — sin excepciones
2. **Audio cifrado AES-256** antes de subir a Storage
3. **consent_signed_at obligatorio** antes de crear Session, AIReport o ReferralReport
4. **Endpoint de derecho al olvido** borra en cascada: audio, transcripts, reports, embeddings, plans, appointments, ficha
5. **AuditLog** registra TODO acceso a datos clínicos
6. **Embeddings segregados por psychologist_id** — nunca cruce entre cuentas
7. **Disclaimer clínico** en TODO output de IA
8. **Nunca exponer patient data en logs** de error

### Disclaimer clínico (copiar literal en cada output IA)
```
⚠️ Este contenido es una herramienta de apoyo al criterio clínico.
El diagnóstico, tratamiento y decisiones clínicas son responsabilidad
exclusiva del profesional de salud mental. PsyAssist no reemplaza la
evaluación clínica profesional.
```

---

## 🤖 SISTEMA DE IA — PIPELINES

### Pipeline 1: Análisis Post-Sesión

```
Audio (presencial o virtual)
  └─> Whisper API (es) → Transcript con timestamps
      └─> Contexto del paciente (historial + sesiones + plan)
          └─> RAG search:
              ├─ Top 5 chunks biblioteca (pgvector)
              └─ Top 3 casos similares (pgvector)
                  └─> Claude Sonnet 4 → AIReport JSON
                      └─> Guardar + notificar + alertas
```

### Pipeline 2: Generación de Informe de Derivación

```
Input: patient_id + recipient_specialty + reason
  └─> Fetch:
      ├─ Ficha del paciente
      ├─ AIReports del paciente
      ├─ Plan terapéutico activo
      └─ Sesiones (resumen)
          └─> Claude → Carta profesional formal
              └─> Psicólogo revisa y aprueba
                  └─> Generar PDF firmado
                      └─> Email con React Email
                          └─> Paciente reenvía al especialista
```

### Pipeline 3: Plan Terapéutico con IA

```
AIReport + Casos similares + Objetivos previos
  └─> Claude → Borrador (objetivos + intervenciones + indicadores)
      └─> Psicólogo edita y aprueba
          └─> Plan visible al paciente (opcional)
```

### Prompt base análisis clínico

```
Eres un asistente clínico de apoyo para psicólogos en Colombia.

Analiza la sesión basándote ÚNICAMENTE en:
1. La transcripción proporcionada
2. Fragmentos de libros clínicos del psicólogo (con fuente)
3. Casos similares exitosos del psicólogo

REGLAS ABSOLUTAS:
- NUNCA afirmes sin respaldo en los documentos
- SIEMPRE cita libro, autor y página
- SIEMPRE incluye el disclaimer clínico
- Responde en español clínico formal
- SOLO JSON válido, sin markdown
```

### Prompt base informe de derivación

```
Eres un asistente que redacta informes clínicos profesionales en Colombia.

Genera una carta de derivación formal para [ESPECIALIDAD] sobre el paciente.
Tono: profesional médico, respetuoso, técnico apropiado.
Idioma: español colombiano clínico.

Estructura obligatoria:
1. Encabezado con fecha y destinatario
2. Saludo formal
3. Motivo de la derivación
4. Datos clínicos relevantes
5. Diagnóstico explorado (CIE-11 si aplica)
6. Intervenciones realizadas
7. Evolución observada
8. Recomendaciones al especialista
9. Disponibilidad para intercambio
10. Firma del psicólogo + tarjeta profesional

Longitud: 400-600 palabras. Formal pero humano.
```

---

## 📧 PLANTILLAS DE EMAIL (React Email)

### 1. Informe de Derivación
- Diseño profesional tipo carta médica
- Logo PsyAssist sutil en pie
- PDF adjunto con firma digital
- CTA: "Reenviar al especialista"

### 2. Confirmación de Cita
- Datos de la cita claros
- Botón añadir a Google/Apple Calendar
- Link al portal del paciente
- Instrucciones si es virtual (link Meet)

### 3. Recordatorio de Cita (24h antes)
- Diseño minimalista
- Reprogramar / cancelar con un clic
- Recordatorio de consentimiento para grabación

### 4. Plan Terapéutico Compartido
- Objetivos visualizados
- Progreso visible
- Mensaje motivador del psicólogo

**Regla estética:** Los emails siguen la misma paleta cream/paper del producto. Nunca blancos corporativos fríos.

---

## 📋 MÓDULOS DEL PRODUCTO

| Módulo | Descripción | Versión |
|---|---|---|
| Auth y multi-tenancy | Login, registro, RLS | v1.0 |
| Gestión de pacientes | CRUD, consentimiento, derecho al olvido | v1.0 |
| Grabación presencial | Web Audio API | v1.0 |
| Upload audio virtual | MP3/WAV/M4A | v1.0 |
| Transcripción IA | Whisper español | v1.0 |
| Base de conocimiento | Upload PDFs + embeddings | v1.0 |
| Análisis post-sesión | Claude + RAG | v1.0 |
| Informe de derivación | IA + PDF + Email | v1.0 |
| Dashboard | Agenda + alertas + stats | v1.0 |
| Integración Google Calendar | Sincronización citas | v1.0 |
| Base de casos exitosos | Búsqueda semántica | v1.5 |
| Planes terapéuticos | IA + seguimiento | v1.5 |
| Agenda propia + reservas | Widget booking | v1.5 |
| Portal del paciente | Citas, plan, informes | v1.5 |
| Alertas de riesgo avanzadas | Notificaciones | v1.5 |
| Multi-tenant SaaS | Stripe | v2.0 |
| App móvil | Grabación celular | v2.0 |
| Meet/Zoom SDK | Integración directa | v2.0 |

---

## 🚀 ROADMAP DETALLADO

### v1.0 — MVP Piloto (8-12 semanas)

**Sprint 1 — Fundación (semanas 1-2)**
- [ ] Setup Next.js + Supabase + Auth
- [ ] Diseño shell (panel + topbar + dock + drawer)
- [ ] CRUD Psychologist + Patient
- [ ] Consentimiento digital
- [ ] Derecho al olvido

**Sprint 2 — IA Clínica (semanas 3-5)**
- [ ] Grabación Web Audio API
- [ ] Upload audio
- [ ] Transcripción Whisper
- [ ] Upload PDFs + embeddings
- [ ] Análisis post-sesión (Claude + RAG)

**Sprint 3 — Valor diferenciador (semanas 6-8)**
- [ ] Informe de derivación (IA + PDF + Email)
- [ ] Integración Google Calendar
- [ ] Dashboard con alertas
- [ ] Audit logs completos

**Sprint 4 — Pulido y piloto (semanas 9-12)**
- [ ] Testing completo
- [ ] Onboarding psicóloga piloto
- [ ] Métricas de uso
- [ ] Feedback loop

### v1.5 — Funciones clínicas completas (3 meses después)
- [ ] Base de casos exitosos
- [ ] Planes terapéuticos IA
- [ ] Agenda propia con reservas
- [ ] Portal del paciente
- [ ] Exportación reportes PDF avanzada

### v2.0 — SaaS Multi-tenant (6 meses después)
- [ ] Onboarding automatizado
- [ ] Stripe suscripciones (Starter $29 / Pro $59 / Clinic $149)
- [ ] App móvil
- [ ] Integración directa Meet/Zoom
- [ ] Multi-idioma

---

## 📏 CONVENCIONES DE CÓDIGO

### TypeScript
- Strict mode siempre
- Interfaces en `/types/*.ts`
- Server Actions para mutaciones
- RSC por defecto, `'use client'` solo cuando necesario
- Zod para validación
- Nunca `any` — usar `unknown` + type guards

### API Routes
- Validar SIEMPRE con Zod
- Verificar sesión con `getServerSession`
- Verificar ownership del recurso
- Respuestas: `{ data } | { error }`

### Supabase
- Cliente server: `createServerClient()` con cookies
- Cliente browser: `createBrowserClient()`
- NUNCA service_role en frontend
- NUNCA bypassear RLS en rutas de usuario

### Componentes
- Server Components para data fetching
- Skeleton loaders en datos async
- Error boundaries en secciones críticas
- Toast notifications (sonner) para feedback IA

### Naming
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Archivos componentes: `PascalCase.tsx`
- Archivos utils: `kebab-case.ts`

### Comentarios
- Español para código de negocio
- Inglés para código técnico
- JSDoc en funciones públicas

---

## ⚡ COMANDOS FRECUENTES

```bash
# Desarrollo
pnpm dev                              # localhost:3000
pnpm build && pnpm start

# Supabase
supabase start
supabase db push
supabase migration new nombre
supabase gen types typescript --local > types/supabase.ts

# Deploy
vercel                                # preview
vercel --prod

# Calidad
pnpm lint
pnpm format
pnpm type-check
pnpm test
```

---

## 🧠 REGLAS PARA TODOS LOS AGENTES

1. **Leer CLAUDE.md completo** antes de cualquier tarea
2. **Nunca crear tabla sin RLS**
3. **Nunca procesar datos clínicos** sin `consent_signed_at`
4. **Siempre incluir el disclaimer clínico** en outputs de IA
5. **Siempre citar fuente** en observaciones clínicas
6. **Idioma: español colombiano clínico**
7. **Respetar el roadmap** — no saltarse versiones
8. **Toda feature nueva** → entrada en AuditLog
9. **Antes de eliminar** → verificar ownership
10. **Diseño: Spatial Clinical** — sin header, sin footer, dock flotante
11. **Color `#FFFFFF` puro prohibido** — usar `--psy-paper`
12. **Fuente `Inter` prohibida** — usar `DM Sans` + `Lora`
13. **Cada output de IA** → guardar en DB
14. **Errores al usuario en español**, logs técnicos en inglés
15. **Antes de integrar libs** → justificar valor vs mantenimiento

---

## 🎯 MÉTRICAS DE ÉXITO

### Técnicas (v1.0)
- Análisis post-sesión: < 2 minutos
- Precisión transcripción español: > 90%
- Generación de informe de derivación: < 30 segundos
- Uptime: > 99.5%

### Producto (v1.0 con piloto)
- Satisfacción psicóloga piloto: ≥ 8/10
- Tiempo ahorrado por sesión: ≥ 15 minutos
- Informes de derivación generados/mes: ≥ 5
- Tasa de adopción de planes IA: ≥ 60%

### Negocio (v2.0)
- MRR objetivo: $5,000 USD a 6 meses
- CAC < $50 USD
- Churn mensual < 5%
- NPS > 50

---

## 🎨 REFERENCIAS DE DISEÑO

**Inspiración:**
- **Linear** — densidad sin abrumar
- **Arc Browser** — reducción del chrome
- **Things 3** — tipografía y spacing cálido
- **Craft Docs** — papel digital con serif
- **Raycast** — dock flotante

**NO inspirarse en:**
- Notion genérico
- Herramientas SaaS B2B frías
- UIs con purple gradients
- Dashboards con 15 gráficas

---

## 📞 CONTEXTO DEL DESARROLLADOR

- **Mario Bas** — developer y entrepreneur en Cali, Colombia
- Stack: Next.js + Supabase (experto, de Sumitronic/SomosTécnicos)
- Windows con CMD
- Production-ready code, no conceptual
- Valida con bash antes de continuar
- GitHub: `basabecode`

---

## 🔗 LINKS ÚTILES

- Supabase docs: https://supabase.com/docs
- Anthropic SDK: https://docs.anthropic.com
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- React Email: https://react.email
- Ley 1581 Colombia: https://www.sic.gov.co/tema/proteccion-de-datos-personales
- CIE-11: https://icd.who.int/browse11

---

## ✅ CHECKLIST DE INICIO DE SESIÓN

Cuando Mario inicia una conversación, Claude debe:

```
[ ] Confirmar que leyó CLAUDE.md
[ ] Identificar fase del roadmap
[ ] Identificar agente(s) aplicables
[ ] Cargar skill relevante
[ ] Confirmar idioma: español
[ ] Proponer siguiente paso según roadmap
```

---

*PsyAssist — La primera herramienta clínica que razona con los libros y casos del propio profesional.*  
*Diseñada con cuidado en Cali, Colombia 🇨🇴 para psicólogos de LATAM.*
