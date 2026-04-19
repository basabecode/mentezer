# CLAUDE.md — PsyAssist

> **Plataforma SaaS de IA Clínica para Psicólogos y Psiquiatras de Habla Hispana**
> _La primera herramienta clínica que razona sobre la biblioteca propia del profesional_
>
> **Versión:** 2.0 · **Stack:** Next.js 15 + Supabase + Claude · **Mercado:** América Latina y España

---

## 📍 CONTEXTO INICIAL — LEER ANTES DE CUALQUIER TAREA

```
[ ] 1. Leer este archivo CLAUDE.md completo
[ ] 2. Leer AGENTS.md → identificar qué agente(s) aplican
[ ] 3. Leer KNOWLEDGE_SYSTEM.md → si la tarea involucra biblioteca clínica
[ ] 4. Consultar el skill relevante en .claude/skills/
[ ] 5. Verificar en qué versión (Lite/Pro) aplica la tarea
[ ] 6. Verificar roadmap antes de proponer features nuevos
[ ] 7. Responder siempre en español (UI, código, comentarios)
```

---

## 🌎 MERCADO OBJETIVO

**PsyAssist está dirigido a psicólogos y psiquiatras de habla hispana.**

### Mercados en orden de ataque

| Prioridad | País         | Razón                                                              |
| --------- | ------------ | ------------------------------------------------------------------ |
| 1         | Colombia     | Mercado de lanzamiento. Mario está aquí, red de contactos directa  |
| 2         | México       | Mayor volumen de profesionales de salud mental en LATAM            |
| 3         | Argentina    | Cultura terapéutica muy arraigada, altísima densidad de psicólogos |
| 4         | Chile / Perú | Mercados emergentes con clase media en crecimiento                 |
| 5         | España       | Poder adquisitivo europeo, mismo idioma                            |

### Por qué habla hispana y no solo Colombia

- Más de 400.000 psicólogos registrados en LATAM hispanohablante
- Ningún competidor global tiene producto nativo en español clínico real
- SEO en español cubre todos los países simultáneamente sin esfuerzo adicional
- La regulación colombiana (Ley 1581) es compatible y más estricta que la mayoría
- Colombia es el laboratorio operativo — LATAM es el mercado real

### Posicionamiento de marca

> _"PsyAssist — Inteligencia clínica para psicólogos y psiquiatras de habla hispana."_

### Lo que NO somos

- No somos una herramienta colombiana (aunque lanzamos ahí)
- No somos una traducción al español de Mentalyc o Upheal
- No somos un marketplace de pacientes — somos B2B, el profesional es el cliente
- No somos software de gestión de consultorio genérico

---

## 🎯 VISIÓN DEL PRODUCTO

PsyAssist convierte al profesional de salud mental en un clínico **10x más informado,
más rápido y más fundamentado**. No reemplaza al profesional — potencia su criterio
clínico con su propia biblioteca, sus propios casos exitosos y su propia forma de trabajar.

**Una frase que define el producto:**

> _"Como tener a todos tus libros clínicos y todos tus casos exitosos leyendo la sesión contigo."_

---

## 💎 LOS 5 DIFERENCIADORES ÚNICOS

La competencia (Mentalyc, Upheal, Yung Sidekick, Supanote) cubre transcripción + notas.
PsyAssist rompe el molde en 5 dimensiones que ningún competidor replica:

**1. RAG sobre la biblioteca propia del profesional**
La IA razona con los libros que el PROPIO profesional usa y confía. Cita libro,
autor y página. Ningún competidor hace esto.

**2. Memoria de casos exitosos**
Cada caso cerrado con éxito se convierte en conocimiento reutilizable. El sistema
se vuelve más valioso con cada paciente — genera lock-in positivo.

**3. Informe de derivación / interconsulta automatizado**
Específico para LATAM: cartas profesionales para otro especialista con un clic.
Nadie lo hace en español clínico.

**4. Primer producto nativo hispanohablante**
Whisper optimizado para español, prompts en español clínico, cumplimiento
regulatorio LATAM, UX pensada en el contexto latinoamericano real.

**5. Diseño "Spatial Clinical"**
Sin header ni footer tradicionales. Dock flotante + panel clínico + drawer lateral.
Sensación de expediente digital, no de SaaS genérico.

---

## 📦 DOS VERSIONES DEL PRODUCTO

PsyAssist existe en dos versiones que comparten el mismo backend pero tienen
interfaces, flujos y propuestas de valor distintas según el perfil del profesional.

---

### 🟦 PSYASSIST LITE — Para Psicólogos en Consulta Privada

**Cliente ideal:**
Psicólogo clínico en consulta privada. 15-30 pacientes activos. Trabaja solo
o en pequeño consultorio. Agenda por WhatsApp, notas en Word o papel. No tiene
cultura de pagar software clínico. Dolor principal: pierde 20-40 minutos después
de cada sesión escribiendo notas desorganizadas.

**Propuesta de valor:**

> _"Escribe tus notas como siempre. PsyAssist las estructura, las analiza,
> y te dice qué dice tu bibliografía sobre lo que observaste — en 30 segundos."_

**Flujo principal sin fricción:**

```
1. Psicólogo escribe o pega notas libres de la sesión (texto libre, sin audio)
2. Selecciona el paciente o escribe contexto básico
3. PsyAssist genera en 30 segundos:
   - Nota SOAP/DAP estructurada
   - Patrones observados con cita bibliográfica
   - Sugerencia para la próxima sesión
4. Psicólogo edita, guarda, listo
```

**Features incluidos en Lite:**

```
✅ Entrada de notas en texto libre (no requiere grabación de audio)
✅ Nota SOAP/DAP generada por IA
✅ Análisis clínico con citas de biblioteca base (enfoques activos)
✅ Gestión básica de pacientes (ficha + historial de notas)
✅ Hasta 3 enfoques clínicos activos simultáneamente
✅ Biblioteca base PsyAssist (126 libros indexados)
✅ Hasta 3 PDFs personales propios
✅ Cuestionario de admisión por link (antes de primera sesión)
✅ Notas privadas del terapeuta (nunca visibles al paciente)
✅ Recordatorios por WhatsApp (24h antes de cita)
✅ Panel financiero básico (registro de pagos)
✅ Dashboard simple (pacientes del día, últimas notas)
✅ Cumplimiento regulatorio (Ley 1581 y equivalentes LATAM)

❌ Grabación y transcripción de audio
❌ AIReport profundo con CIE-11
❌ Informes de derivación con PDF firmado
❌ Portal del paciente
❌ Integración Google Calendar
❌ Casos exitosos indexados
❌ Knowledge Profiles completos (solo 3 enfoques fijos)
❌ Biblioteca personal ilimitada
❌ Tests psicométricos digitales
❌ Timeline de evolución del paciente
❌ Plantillas por enfoque terapéutico
```

**Precio:**

```
Lite Mensual:  $19 USD/mes
Lite Anual:    $190 USD/año  (equivale a 2 meses gratis)
Trial:         14 días gratis — sin tarjeta de crédito
```

**Onboarding objetivo:** Menos de 10 minutos.
Cuenta → seleccionar 3 enfoques → primer paciente → primera nota → análisis.

---

### 🟣 PSYASSIST PRO — Para Psiquiatras y Psicólogos Clínicos Avanzados

**Cliente ideal:**
Psiquiatra en consulta privada o institución. 20-40 pacientes activos. Necesita
documentación CIE-11 para EPS, clínicas o seguros. Escribe interconsultas y
cartas de derivación frecuentemente. Tiene presupuesto para herramientas que
le ahorren tiempo real. Dolor principal: la documentación clínica consume
el 30-50% de su tiempo.

También aplica para: psicólogo clínico con práctica establecida, psicólogo
en institución, profesional que hace peritajes o informes forenses.

**Propuesta de valor:**

> _"Todo el poder clínico de tu biblioteca, tus casos y tu criterio — automatizado.
> Interconsultas en 1 clic. CIE-11 integrado. Grabación o texto, tú decides."_

**Features incluidos en Pro (todo Lite más):**

```
✅ TODO lo incluido en Lite
✅ Grabación de sesiones presenciales (Web Audio API)
✅ Upload de audio (MP3, WAV, M4A) de sesiones virtuales
✅ Transcripción con Whisper (español clínico optimizado)
✅ AIReport completo con CIE-11 integrado
✅ Todos los 8 enfoques clínicos activos simultáneamente
✅ Knowledge Profiles (activar/desactivar enfoques por paciente)
✅ Biblioteca personal ilimitada (PDFs, investigaciones, protocolos)
✅ Clasificación automática de documentos con IA
✅ Informes de derivación / interconsulta (PDF profesional + email)
✅ Tests psicométricos digitales (PHQ-9, GAD-7, DASS-21, PCL-5, Rosenberg)
✅ Planes terapéuticos generados con IA
✅ Portal básico del paciente
✅ Integración Google Calendar
✅ Casos exitosos indexados (memoria clínica acumulativa)
✅ Evolución visual del paciente — timeline de progreso
✅ Plantillas de historia clínica por enfoque terapéutico
✅ Alertas de riesgo avanzadas con pulso visual
✅ Audit log completo (requerido por instituciones)
✅ Exportación avanzada de reportes PDF
```

**Precio:**

```
Pro Mensual:   $49 USD/mes
Pro Anual:     $490 USD/año  (equivale a 2 meses gratis)
Trial:         14 días gratis — sin tarjeta de crédito

Plan Clinic (v2.0):
Clinic:        $149 USD/mes — hasta 5 profesionales, admin central
```

---

### Comparativa Lite vs Pro

| Feature                         |    Lite     |     Pro     |
| ------------------------------- | :---------: | :---------: |
| Notas texto libre + SOAP/DAP IA |     ✅      |     ✅      |
| Análisis clínico con biblioteca |     ✅      |     ✅      |
| Gestión de pacientes            |     ✅      |     ✅      |
| WhatsApp recordatorios          |     ✅      |     ✅      |
| Cuestionario de admisión        |     ✅      |     ✅      |
| Notas privadas del terapeuta    |     ✅      |     ✅      |
| Panel financiero básico         |     ✅      |     ✅      |
| Enfoques clínicos activos       |      3      |      8      |
| PDFs personales                 |      3      | Ilimitados  |
| Grabación / Transcripción audio |     ❌      |     ✅      |
| AIReport profundo con CIE-11    |     ❌      |     ✅      |
| Informes de derivación PDF      |     ❌      |     ✅      |
| Knowledge Profiles              |     ❌      |     ✅      |
| Clasificación IA de documentos  |     ❌      |     ✅      |
| Tests psicométricos digitales   |     ❌      |     ✅      |
| Portal del paciente             |     ❌      |     ✅      |
| Google Calendar                 |     ❌      |     ✅      |
| Memoria de casos exitosos       |     ❌      |     ✅      |
| Timeline de evolución           |     ❌      |     ✅      |
| Plantillas por enfoque          |     ❌      |     ✅      |
| **Precio mensual**              | **$19 USD** | **$49 USD** |

---

## 🎨 ADN DE DISEÑO — "Spatial Clinical"

Un producto clínico no necesita animaciones flashy — necesita **calma inteligente**.
Cada elemento comunica profesionalismo, confianza y atención al detalle.

### Principios visuales — NUNCA violar

- **Sin header tradicional** — Topbar contextual: saludo + stats del día + avatar
- **Sin footer tradicional** — Drawer lateral con legal, ajustes y soporte
- **Dock flotante inferior** — Navegación tipo macOS, se esconde al scroll
- **Textura de papel clínico** — `#FAF8F4`, NUNCA blanco puro `#FFFFFF`
- **Tipografía editorial** — `Lora` para títulos, `DM Sans` para UI, `DM Mono` para datos
- **Alertas con pulso** — señales de riesgo "high" tienen animación de pulso
- **Sin emojis decorativos** — SVG custom o íconos minimalistas

### Paleta de colores

```css
/* Fondos de sección — alternar para crear ritmo visual */
--psy-cream: #c8e6f2;        /* Secciones teal (hero, para quién encaja) */
--psy-paper: #dff3f8;        /* Superficies internas */
--psy-purple-light: #edeaf8; /* Secciones lavanda (deliverables, pricing, FAQ) */
/* Secciones blancas: bg-white (pain points, trial steps, FAQ) */

/* Texto */
--psy-ink:    #0d2232; /* Texto principal — navy */
--psy-muted:  #456b7e; /* Texto secundario */
--psy-border: rgba(13, 34, 50, 0.10);

/* Primario — teal clínico */
--psy-blue:        #1586a0;
--psy-blue-light:  #d4eff5;

/* Acento secundario — lavanda/salud mental */
--psy-purple:       #7060b0;
--psy-purple-light: #edeaf8;

/* Estados */
--psy-green:        #27895e; /* Progreso, éxito */
--psy-green-light:  #d4efe4;
--psy-amber:        #c07a18; /* Advertencia */
--psy-amber-light:  #fef0d2;
--psy-red:          #c0392b; /* Riesgo alto */
--psy-red-light:    #fdecea;
```

### Regla de secciones (landing page)

```
Hero              → bg-[var(--psy-cream)]    teal
Pain points       → bg-white
Deliverables      → bg-[var(--psy-purple-light)] lavanda
Trial steps       → bg-white
Para quién encaja → bg-[var(--psy-cream)]    teal
Pricing           → bg-[var(--psy-purple-light)] lavanda
FAQ               → bg-white
Final CTA         → bg-[var(--psy-ink)]      navy oscuro
```

### Regla de tarjetas

- **Tarjeta sobre fondo teal o lavanda:** `bg-white` siempre — nunca bg-tintado
- **Hover de tarjeta:** eleva 5px, sombra 64px, borde teal visible, fondo blanco puro

### Tipografía

```css
--psy-serif: 'Lora', Georgia, serif; /* Títulos, análisis IA, informes */
--psy-sans: 'DM Sans', system-ui; /* UI general, formularios */
--psy-mono: 'DM Mono', monospace; /* Timestamps, IDs, datos técnicos */
```

### Shell del dashboard — estructura obligatoria

```
┌─────────────────────────────────────────────────────┐
│  Topbar: saludo + stats del día + avatar             │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  Panel       │   Contenido principal                 │
│  lateral     │   (fondo --psy-cream)                 │
│  (--psy-     │                                       │
│   paper)     │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
        ▲ Dock flotante inferior (se oculta al scroll)
```

### Regla de oro de UX

> _"Si se siente como un SaaS genérico, lo rehacemos."_

### Inspiración de diseño

Linear, Arc Browser, Things 3, Craft Docs, Raycast.
**NO inspirarse en:** Notion genérico, dashboards con 15 gráficas, purple gradients.

---

## 🏗️ STACK TECNOLÓGICO

```
Frontend:        Next.js 15 (App Router, RSC) + Tailwind CSS 3
Auth:            NextAuth 5 (Credentials + Google OAuth)
Database:        Supabase (PostgreSQL 16 + RLS)
Vector/RAG:      Supabase pgvector (1536 dimensiones)
Embeddings:      OpenAI text-embedding-3-small
Transcripción:   OpenAI Whisper API (large-v3, idioma: es) — Solo Pro
IA análisis:     Anthropic Claude claude-sonnet-4-20250514
Storage:         Supabase Storage (audio cifrado AES-256 + PDFs + informes)
Email:           Resend + React Email
PDF:             @react-pdf/renderer
Agenda:          FullCalendar + Google Calendar API
Mensajería:      WhatsApp Business API (Meta Cloud API)
Deploy:          Vercel (CI/CD)
Pagos:           Stripe — activo en v2.0
Lenguaje:        TypeScript strict
Package mgr:     pnpm
Validación:      Zod
UI Components:   Radix UI (headless) + componentes custom
Animaciones:     Framer Motion (selectivo, nunca decorativo)
Fonts:           next/font (Lora, DM Sans, DM Mono)
```

**Regla:** No agregar dependencias sin justificar. Cada paquete tiene costo de mantenimiento.

---

## 📁 ESTRUCTURA DEL PROYECTO

```
psyassist/
├── CLAUDE.md                        ← Este archivo
├── AGENTS.md                        ← Equipo de 16 agentes especializados
├── KNOWLEDGE_SYSTEM.md              ← Sistema de biblioteca clínica (126 libros)
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Shell: panel + topbar + dock + drawer
│   │   ├── page.tsx                 # Dashboard principal
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # Ficha completa del paciente
│   │   │       ├── sessions/
│   │   │       ├── plan/            # Plan terapéutico (Pro)
│   │   │       ├── reports/         # Informes de derivación (Pro)
│   │   │       ├── tests/           # Tests psicométricos (Pro)
│   │   │       └── timeline/        # Evolución visual (Pro)
│   │   ├── sessions/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── knowledge/               # Biblioteca clínica
│   │   ├── cases/                   # Casos exitosos (Pro)
│   │   ├── reports/                 # Informes de derivación (Pro)
│   │   ├── schedule/
│   │   └── settings/
│   │       ├── practice/
│   │       └── billing/
│   ├── (patient)/                   # Portal del paciente (Pro, v1.5)
│   ├── (intake)/                    # Cuestionario admisión — público sin login
│   │   └── [token]/
│   ├── (psychometric)/              # Tests psicométricos — público sin login
│   │   └── [token]/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── sessions/
│       │   ├── transcribe/          # Whisper (Pro)
│       │   └── analyze/
│       ├── knowledge/
│       │   ├── upload/
│       │   ├── [id]/status/         # Polling de procesamiento
│       │   └── search/
│       ├── patients/
│       │   └── [id]/
│       │       ├── delete/          # Derecho al olvido
│       │       └── referral/        # Informe derivación (Pro)
│       ├── intake/[token]/
│       ├── psychometric/[token]/
│       ├── reports/
│       ├── schedule/
│       └── webhooks/
│           ├── stripe/
│           └── google-calendar/
│
├── components/
│   ├── ui/                          # Primitivos Spatial Clinical
│   ├── shell/
│   │   ├── Topbar.tsx
│   │   ├── PatientPanel.tsx
│   │   ├── FloatingDock.tsx
│   │   └── SettingsDrawer.tsx
│   ├── knowledge/
│   │   ├── KnowledgeGroupCard.tsx
│   │   ├── PersonalLibrary.tsx
│   │   └── UploadZone.tsx
│   ├── sessions/
│   │   ├── NoteInput.tsx            # Entrada texto libre (Lite + Pro)
│   │   ├── AudioRecorder.tsx        # Grabación (Pro)
│   │   └── SOAPViewer.tsx
│   ├── analysis/
│   │   ├── AIReport.tsx
│   │   ├── RiskBadge.tsx
│   │   └── SourceCitation.tsx
│   ├── patients/
│   │   ├── PatientCard.tsx
│   │   ├── IntakeForm.tsx
│   │   └── PatientTimeline.tsx      # Pro
│   ├── referral/                    # Pro
│   ├── psychometric/                # Pro
│   ├── schedule/
│   └── plan/                        # Pro
│
├── emails/
│   ├── ReferralLetter.tsx
│   ├── AppointmentConfirm.tsx
│   ├── AppointmentReminder.tsx
│   └── PlanShare.tsx
│
├── lib/
│   ├── supabase/
│   ├── ai/
│   │   ├── whisper.ts               # Pro
│   │   ├── embeddings.ts
│   │   ├── rag.ts                   # RAG unificado: base + personal
│   │   ├── classifier.ts            # Clasificador de documentos
│   │   ├── analysis.ts              # AIReport + SOAP/DAP
│   │   └── referral.ts              # Pro
│   ├── ingestor/
│   │   └── extract.ts
│   ├── whatsapp/
│   │   └── send.ts
│   ├── audio/
│   ├── pdf/
│   ├── email/
│   ├── calendar/
│   ├── consent.ts
│   ├── audit.ts
│   └── utils/
│
├── scripts/
│   ├── bulk-load-books.ts           # Carga masiva 126 libros
│   ├── extract-pdf-text.ts
│   ├── classify-document.ts
│   └── bulk-load-log.json           # NO commitear
│
├── books-to-index/                  # Carpeta local — NO commitear
│   ├── 01-cbt/
│   ├── 02-psicoanalitico/
│   ├── 03-humanista/
│   ├── 04-sistemica/
│   ├── 05-trauma/
│   ├── 06-neuropsico/
│   ├── 07-infanto/
│   ├── 08-positiva/
│   └── sin-clasificar/
│
├── types/
│   └── supabase.ts                  # Generado automáticamente
│
├── supabase/
│   ├── migrations/
│   └── seed/
│       └── knowledge_groups.sql
│
├── public/
│   ├── fonts/
│   └── textures/
│       └── paper-noise.svg
│
└── .claude/
    ├── settings.json
    ├── skills/
    │   └── rag-clinico.md
    └── agents/
        ├── orchestrator-agent.md
        ├── setup-agent.md
        ├── database-agent.md
        ├── auth-agent.md
        ├── security-agent.md
        ├── book-ingestor-agent.md
        ├── classifier-agent.md
        ├── rag-agent.md
        ├── clinical-analyst-agent.md
        ├── ui-agent.md
        ├── patients-agent.md
        ├── sessions-agent.md
        ├── dashboard-agent.md
        ├── recorder-agent.md
        ├── reports-agent.md
        ├── saas-agent.md
        └── qa-agent.md
```

---

## 🗄️ MODELO DE DATOS COMPLETO

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PROFESIONALES (psicólogos y psiquiatras)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Professional
  id, email, name, professional_license
  profession_type (psychologist | psychiatrist)
  specialty, country, timezone
  plan (lite | pro | clinic)
  trial_ends_at, stripe_customer_id
  signature_image_url, digital_signature_key
  preferred_note_format (SOAP | DAP)
  preferred_template_id
  google_calendar_connected, google_calendar_id
  whatsapp_business_phone_id
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PACIENTES Y CONSENTIMIENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient
  id, psychologist_id, name, document_id
  age, gender, contact_email, contact_phone
  address, emergency_contact
  reason, referred_by
  status (active | paused | closed)
  consent_signed_at, consent_document_url
  intake_data JSONB
  patient_portal_token
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CUESTIONARIO DE ADMISIÓN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IntakeForm
  id, patient_id, psychologist_id
  token VARCHAR UNIQUE
  custom_questions JSONB
  responses JSONB
  completed_at
  expires_at                         -- 72 horas
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SESIONES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session
  id, patient_id, psychologist_id
  mode (presential | virtual)
  input_type (text | audio)          -- Lite=text, Pro=text|audio
  scheduled_at, duration_minutes
  audio_url, audio_deleted_at
  status (scheduled|recording|uploaded|transcribing|analyzing|complete|error)
  error_message TEXT
  payment_amount INT                 -- en moneda local
  payment_currency VARCHAR           -- COP|MXN|ARS|PEN|CLP|EUR
  payment_method VARCHAR             -- efectivo|transferencia|nequi|daviplata|tarjeta|exento
  payment_status VARCHAR DEFAULT 'pending'
  payment_date TIMESTAMPTZ
  created_at

Transcript
  id, session_id
  content JSONB                      -- texto con timestamps
  edited_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- NOTAS CLÍNICAS FORMALES (SOAP / DAP)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ClinicalNote
  id, session_id, psychologist_id, patient_id
  format (SOAP | DAP)
  content JSONB                      -- {S,O,A,P} o {D,A,P}
  is_signed BOOLEAN DEFAULT false
  signed_at TIMESTAMPTZ
  pdf_url TEXT
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ANÁLISIS IA — PROFUNDO (Pro)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIReport
  id, session_id
  summary TEXT
  patterns JSONB
  diagnostic_hints JSONB             -- hipótesis, NUNCA diagnóstico definitivo
  cie11_codes JSONB                  -- Solo Pro / psiquiatras
  risk_signals JSONB                 -- [{signal, severity: low|medium|high, description}]
  similar_cases JSONB
  evolution_vs_previous TEXT
  therapeutic_suggestions JSONB
  knowledge_sources_used JSONB       -- libros citados
  disclaimer TEXT                    -- SIEMPRE incluido
  generated_at, model_used

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- NOTAS PRIVADAS DEL TERAPEUTA
-- NUNCA visible al paciente. NUNCA en informes ni exportaciones.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PrivateNote
  id, session_id, psychologist_id, patient_id
  content TEXT
  created_at, updated_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PLANES TERAPÉUTICOS (Pro)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TherapeuticPlan
  id, patient_id, psychologist_id
  status (draft | active | completed)
  ai_draft JSONB, approved_plan JSONB
  shared_with_patient_at
  created_at, updated_at

PlanObjective
  id, plan_id, description
  interventions, frequency, indicators
  progress INT (0-100)
  sessions_tracked JSONB

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INFORMES DE DERIVACIÓN / INTERCONSULTA (Pro)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ReferralReport
  id, patient_id, psychologist_id
  recipient_specialist_name, recipient_specialty, recipient_email
  reason_for_referral TEXT
  ai_draft TEXT, approved_content TEXT
  diagnosis_codes JSONB              -- CIE-11
  interventions_summary TEXT
  evolution_summary TEXT
  recommendations TEXT
  pdf_url, email_sent_at
  patient_acknowledged_at
  status (draft | approved | sent | acknowledged)
  created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TESTS PSICOMÉTRICOS (Pro)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PsychometricTest
  id, name, short_name, description
  items JSONB, scoring_rules JSONB, interpretation JSONB
  is_active BOOLEAN

PatientTestResult
  id, patient_id, psychologist_id
  test_id, session_id (nullable)
  token VARCHAR UNIQUE               -- link público sin login
  responses JSONB
  total_score INT
  interpretation VARCHAR             -- leve | moderado | severo
  completed_at, expires_at, created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PLANTILLAS CLÍNICAS POR ENFOQUE (Pro)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ClinicalTemplate
  id, psychologist_id (null = sistema)
  name, approach_type
  fields JSONB, soap_prompts JSONB
  is_default BOOLEAN, created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AGENDA Y CITAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Availability
  id, psychologist_id
  day_of_week (0-6), start_time, end_time
  session_duration_minutes, buffer_minutes, is_active

Appointment
  id, psychologist_id, patient_id
  scheduled_at, duration_minutes
  mode (presential | virtual), meeting_url
  status (requested|confirmed|completed|cancelled|no_show)
  requested_by (patient | psychologist)
  confirmation_token, cancellation_reason
  google_calendar_event_id, created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- WHATSAPP
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WhatsAppMessage
  id, session_id, patient_id, psychologist_id
  message_type (reminder_24h | reminder_1h | confirmation | cancellation)
  status (sent | delivered | read | failed)
  wa_message_id
  sent_at, delivered_at, read_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BIBLIOTECA CLÍNICA — DOS CAPAS (ver KNOWLEDGE_SYSTEM.md)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KnowledgeGroup                       -- 8 grupos base del sistema
PersonalKnowledgeGroup               -- grupos creados por IA (documentos personales)
PsychologistKnowledgeGroup           -- enfoques activos por profesional

KnowledgeDocument
  id, psychologist_id (null = sistema)
  title, author, category
  file_url, file_size_bytes
  processing_status (pending|processing|ready|error)
  source_type (system | personal)
  group_id, personal_group_id
  ai_classification JSONB, personal_label TEXT
  chunk_count, uploaded_at

DocumentChunk
  id, document_id, psychologist_id
  content TEXT, page_number INT
  embedding vector(1536)

ClinicalCase
  id, psychologist_id, patient_id (anonimizable)
  title, description
  diagnosis_explored, interventions_used
  outcome (successful | partial | failed)
  sessions_count INT
  embedding vector(1536)
  is_indexed BOOLEAN, created_at

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUDITORÍA Y PRIVACIDAD
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AuditLog
  id, psychologist_id, action
  resource_type, resource_id
  ip_address, user_agent
  metadata JSONB, created_at

DataDeletionRequest
  id, patient_id, psychologist_id
  requested_at, completed_at, items_deleted JSONB
```

**Reglas absolutas:** RLS habilitado SIEMPRE. `psychologist_id` presente en casi todas.
Policies específicas para SELECT, INSERT, UPDATE y DELETE por separado.

---

## 🔒 PRIVACIDAD Y CUMPLIMIENTO REGULATORIO

### Marco legal — LATAM hispanohablante

| País      | Ley              | Compatibilidad con Ley 1581       |
| --------- | ---------------- | --------------------------------- |
| Colombia  | Ley 1581 de 2012 | Marco principal de implementación |
| México    | LFPDPPP          | Compatible                        |
| Argentina | Ley 25.326       | Compatible                        |
| Chile     | Ley 19.628       | Compatible                        |
| España    | GDPR + LOPDGDD   | Compatible (más estricto)         |

La Ley 1581 es el mínimo común que satisface todos los mercados.

### Reglas que NUNCA se rompen

```
1.  RLS en toda tabla — sin excepciones
2.  Audio cifrado AES-256 antes de subir a Storage
3.  consent_signed_at obligatorio antes de crear Session, AIReport o ReferralReport
4.  Derecho al olvido: cascada completa — audio, transcripts, notas, reports,
    embeddings, planes, citas, ficha del paciente
5.  AuditLog registra TODO acceso a datos clínicos
6.  Embeddings segregados por psychologist_id — nunca cruce entre cuentas
7.  Disclaimer clínico en TODO output de IA — sin excepción
8.  Notas privadas del terapeuta NUNCA en exportaciones ni vistas del paciente
9.  WhatsApp NUNCA lleva datos clínicos — solo logística de cita
10. Nunca exponer patient data en logs de error
```

### Disclaimer clínico — copiar literal en cada output de IA

```
⚠️ Este contenido es una herramienta de apoyo al criterio clínico.
El diagnóstico, tratamiento y decisiones clínicas son responsabilidad
exclusiva del profesional de salud mental. PsyAssist no reemplaza la
evaluación clínica profesional.
```

---

## 🤖 SISTEMA DE IA — PIPELINES

### Pipeline 1 — Análisis desde texto (Lite + Pro)

```
Notas de texto libre del profesional
  └─► Contexto del paciente (ficha + historial + intake_data)
      └─► Tests psicométricos recientes si existen (Pro)
          └─► RAG search — dos capas paralelas:
              ├─ Top 5 chunks biblioteca base (grupos activos)
              └─ Top 3 chunks biblioteca personal del profesional
                  └─► Claude → ClinicalNote SOAP/DAP
                      └─► Claude → AIReport (Pro: más profundo + CIE-11)
                          └─► Guardar + notificar + alertas
```

### Pipeline 2 — Análisis desde audio (Solo Pro)

```
Audio grabado o subido
  └─► Whisper API (español) → Transcript con timestamps
      └─► [mismo flujo que Pipeline 1 desde transcript]
```

### Pipeline 3 — Informe de derivación (Solo Pro)

```
patient_id + recipient_specialty + reason
  └─► Fetch: ficha + AIReports + plan activo + tests
      └─► Claude → carta formal en español clínico neutro
          └─► Profesional revisa y aprueba
              └─► PDF firmado + email
```

### Pipeline 4 — Carga y clasificación de documentos

```
PDF/TXT subido por profesional
  └─► book-ingestor-agent: extrae texto, chunking inteligente
      └─► classifier-agent: Claude decide grupo (8 base + personal)
          └─► rag-agent: genera embeddings, guarda chunks en pgvector
              └─► Disponible en próxima sesión de análisis
```

### Prompts base

**Análisis clínico (Lite y Pro):**

```
Eres un asistente clínico de apoyo para profesionales de salud mental
de habla hispana.

Analiza basándote ÚNICAMENTE en:
1. Las notas o transcripción proporcionadas
2. Fragmentos de libros clínicos del profesional (con fuente)
3. Casos similares exitosos del profesional

REGLAS ABSOLUTAS:
- NUNCA afirmes sin respaldo en los documentos proporcionados
- SIEMPRE cita libro, autor y página en observaciones clínicas
- SIEMPRE incluye el disclaimer clínico
- Responde en español clínico formal neutro (válido en todo LATAM y España)
- Diagnósticos SOLO como "hipótesis exploratoria" — nunca definitivos
- SOLO JSON válido, sin markdown
```

**Informe de derivación (Pro):**

```
Eres un asistente que redacta informes clínicos profesionales para
profesionales de salud mental de habla hispana.

Genera una carta de derivación/interconsulta formal para [ESPECIALIDAD].
Tono: profesional médico, respetuoso, técnico apropiado.
Idioma: español clínico formal neutro — válido en todo LATAM y España.
Longitud: 400-600 palabras. Formal pero humano.
```

---

## 📋 MÓDULOS POR VERSIÓN

| Módulo                                    | Estado | Lite | Pro | Versión |
| ----------------------------------------- | :----: | :--: | :-: | ------- |
| Auth + gestión de cuenta                  | ✅ | ✅  | ✅  | v1.0    |
| Gestión de pacientes + consentimiento     | ✅ | ✅  | ✅  | v1.0    |
| Notas texto libre + SOAP/DAP IA           | ✅ | ✅  | ✅  | v1.0    |
| Análisis clínico con biblioteca base      | ✅ | ✅  | ✅  | v1.0    |
| Notas privadas del terapeuta              | ✅ | ✅  | ✅  | v1.0    |
| Cuestionario de admisión                  | ✅ | ✅  | ✅  | v1.0    |
| WhatsApp cliente                          | ✅ | ✅  | ✅  | v1.0    |
| WhatsApp recordatorios automáticos        | ❌ | ❌  | ❌  | v1.0    |
| Panel financiero básico                   | ❌ | ❌  | ❌  | v1.0    |
| Dashboard + alertas de riesgo             | ✅ | ✅  | ✅  | v1.0    |
| Biblioteca base (3 enfoques / 8 enfoques) | ✅ | 3   | 8   | v1.0    |
| PDFs personales (3 / ilimitados)          | ✅ | 3   | ∞   | v1.0    |
| Derecho al olvido (eliminación cascada)   | ✅ | ✅  | ✅  | v1.0    |
| Grabación + transcripción Whisper         | ✅ | ❌  | ✅  | v1.0    |
| AIReport profundo                         | ✅ | ❌  | ✅  | v1.0    |
| AIReport con CIE-11                       | 🔄 | ❌  | 🔄  | v1.0    |
| Knowledge Profiles                        | ✅ | ❌  | ✅  | v1.0    |
| Clasificación IA de documentos            | ✅ | ❌  | ✅  | v1.0    |
| Informes de derivación PDF + email        | ✅ | ❌  | ✅  | v1.0    |
| Google Calendar integración               | 🔄 | ❌  | 🔄  | v1.0    |
| Tests psicométricos digitales             | ❌ | ❌  | ❌  | v1.5    |
| Memoria de casos exitosos                 | ❌ | ❌  | ❌  | v1.5    |
| Planes terapéuticos IA                    | ❌ | ❌  | ❌  | v1.5    |
| Portal del paciente                       | ❌ | ❌  | ❌  | v1.5    |
| Timeline de evolución                     | ❌ | ❌  | ❌  | v1.5    |
| Plantillas por enfoque                    | ❌ | ❌  | ❌  | v1.5    |
| Agenda propia + reservas                  | ❌ | ❌  | ❌  | v1.5    |
| Multi-tenant SaaS (Stripe)                | ❌ | ❌  | ❌  | v2.0    |
| App móvil                                 | ❌ | ❌  | ❌  | v2.0    |
| Meet/Zoom SDK                             | ❌ | ❌  | ❌  | v2.0    |

---

## 🚀 ROADMAP DETALLADO

### v1.0 — MVP con Lite y Pro (8-12 semanas)

**Sprint 1 — Fundación (semanas 1-2)**

- [x] Setup Next.js 15 + Supabase + NextAuth 5
- [x] Shell Spatial Clinical (topbar + panel + dock + drawer)
- [x] CRUD Professional (type: psychologist | psychiatrist)
- [x] CRUD Patient con consentimiento digital
- [x] Derecho al olvido (eliminación en cascada completa)
- [x] Migración DB completa con RLS en todas las tablas
- [x] Seed de los 8 grupos de conocimiento base ← migración 20260418000004

**Sprint 2 — IA Core Lite (semanas 3-4)** ✅ COMPLETADO

- [x] NoteInput — entrada de notas en texto libre ← components/sessions/ (parcial en flujo)
- [x] Generación de nota SOAP/DAP con Claude ← lib/ai/analysis.ts + app/api/sessions/analyze
- [x] Notas privadas del terapeuta ← schema DB (PrivateNote table)
- [x] Cuestionario de admisión (link público + token 72h) ← schema DB (IntakeForm table)
- [x] Upload PDFs personales + clasificación IA ← app/api/knowledge/upload
- [x] Script bulk-load: indexar los 126 libros ← scripts/bulk-load-books.ts (pendiente: ejecutar)
- [x] RAG unificado: dos capas (base + personal) ← lib/ai/rag.ts con searchAllKnowledge
- [x] Análisis clínico básico con citas bibliográficas ← lib/ai/analysis.ts usa RAG dos capas
- [x] Grabación Web Audio API ← components/recorder/SessionRecorder.tsx (movido de Sprint 3)
- [x] Upload de audio + Transcripción Whisper ← lib/ai/whisper.ts + app/api/sessions/transcribe

**Sprint 3 — Features Pro + Adopción (semanas 5-7)** ✅ COMPLETADO (Parcial)

- [x] AIReport profundo con CIE-11 ← lib/ai/analysis.ts + app/api/sessions/analyze (CIE-11 partial)
- [x] Informe de derivación PDF + email ← components/referral/ReferralGenerator.tsx + lib/referrals/actions.ts
- [x] Knowledge Profiles (activar/desactivar enfoques) ← API /api/knowledge/groups + UI KnowledgeGroupCard
- [x] WhatsApp Business API — cliente ← lib/messaging/whatsapp.ts (Meta + Twilio adapters)
- [x] WhatsApp webhook ← app/api/webhooks/whatsapp (inbound messages)
- [ ] WhatsApp recordatorios automáticos 24h y 1h ← **PENDIENTE: job/scheduler**
- [ ] Panel financiero básico (multi-moneda: COP, MXN, ARS, etc.) ← **PENDIENTE: tabla + UI**
- [ ] Google Calendar (Pro) ← **PARCIAL: schema existe, integración pendiente**
- [x] Dashboard con alertas de riesgo ← app/(dashboard)/page.tsx + risk_signals en AIReport
- [x] Audit logs completos ← schema DB (AuditLog table) + implementación pendiente en rutas

**Sprint 4 — Pulido y piloto (semanas 8-12)** 🔄 EN PROGRESO

- [ ] Onboarding Lite (< 10 min) ← **PENDIENTE: UX flow**
- [ ] Onboarding Pro (< 30 min, guiado) ← **PENDIENTE: UX flow**
- [x] Landing page con diferenciación Lite vs Pro ← app/page.tsx (completada)
- [ ] qa-agent: testing completo (TypeScript, build, RLS, UX) ← **PENDIENTE: suite de tests**
- [ ] 5-10 psicólogos piloto con Lite (Colombia, México) ← **PENDIENTE: recruitment**
- [ ] 2-3 psiquiatras piloto con Pro (Colombia) ← **PENDIENTE: recruitment**
- [ ] Métricas de uso y feedback loop ← **PENDIENTE: analytics + survey**

### v1.5 — Retención y diferenciación (mes 4-6)

- [ ] Tests psicométricos digitales (PHQ-9, GAD-7, DASS-21, PCL-5, Rosenberg)
- [ ] Memoria de casos exitosos (búsqueda semántica acumulativa)
- [ ] Planes terapéuticos generados con IA
- [ ] Portal del paciente
- [ ] Timeline de evolución visual del paciente
- [ ] Plantillas de historia clínica por enfoque terapéutico (TCC, sistémica, psicodinámico, humanista, integrativo)
- [ ] Agenda propia con widget de reservas

### v2.0 — SaaS escalable (mes 7-12)

- [ ] Stripe suscripciones (Lite $19 / Pro $49 / Clinic $149)
- [ ] Onboarding self-service automatizado
- [ ] Plan Clinic — hasta 5 profesionales, admin central
- [ ] App móvil (grabación desde celular)
- [ ] Meet/Zoom SDK integración directa
- [ ] SEO por país: landing pages México, Argentina, España

---

## 📏 CONVENCIONES DE CÓDIGO

### TypeScript

- Strict mode siempre
- Interfaces en `/types/*.ts`
- Server Actions para mutaciones
- RSC por defecto, `'use client'` solo cuando necesario
- Zod para validación en frontend Y backend
- Nunca `any` — usar `unknown` + type guards

### API Routes

- Validar SIEMPRE con Zod
- Verificar sesión con `getServerSession` antes de cualquier operación
- Verificar ownership: `psychologist_id === session.user.id`
- Verificar plan antes de features Pro: `if (session.user.plan !== 'pro') return 403`
- Respuestas: `{ data } | { error: string }`

### Supabase

- Cliente server: `createServerClient()` con cookies
- Cliente browser: `createBrowserClient()`
- NUNCA service_role_key en código frontend
- NUNCA bypassear RLS en rutas de usuario
- SIEMPRE regenerar tipos después de migraciones

### Componentes

- Server Components para data fetching
- Skeleton loaders en TODOS los datos async
- Error boundaries en secciones críticas
- Toast (sonner) para feedback de IA
- Verificar plan del usuario antes de renderizar features Pro

### Naming

- Componentes: `PascalCase`
- Funciones/variables: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Archivos componentes: `PascalCase.tsx`
- Archivos utils/lib: `kebab-case.ts`

---

## ⚡ COMANDOS FRECUENTES

```bash
# Desarrollo
pnpm dev
pnpm build && pnpm start

# Supabase
supabase start
supabase db push
supabase migration new [nombre-descriptivo]
supabase gen types typescript --local > types/supabase.ts

# Carga de libros (solo una vez)
npx ts-node scripts/bulk-load-books.ts

# Deploy
vercel
vercel --prod

# Calidad — ejecutar antes de cualquier deploy
pnpm type-check    # 0 errores
pnpm lint          # 0 errores críticos
pnpm build         # build exitoso
```

---

## 🧠 REGLAS PARA TODOS LOS AGENTES

### Arquitectura y código

```
1.  Leer CLAUDE.md + AGENTS.md completos antes de cualquier tarea
2.  Nunca crear tabla sin RLS habilitado
3.  Nunca procesar datos clínicos sin consent_signed_at verificado
4.  Nunca dar por implementado algo sin ejecutar y validar el resultado
5.  Respetar el roadmap — no implementar features de v1.5 en v1.0
6.  Verificar a qué versión (Lite/Pro) pertenece cada feature
7.  Bloquear features Pro con verificación de plan en API y UI
```

### IA clínica

```
8.  Siempre incluir disclaimer clínico en outputs de IA
9.  Siempre citar libro, autor y página en observaciones clínicas
10. Diagnósticos solo como "hipótesis exploratoria" — nunca definitivos
11. Cada output de IA guardado en DB antes de mostrarse al profesional
12. Tests psicométricos: inyectar resultados como contexto en el AIReport
13. Prompts en español neutro — válido en todo LATAM y España
```

### Privacidad y seguridad

```
14. Notas privadas: NUNCA en exportaciones, portales ni vistas del paciente
15. WhatsApp: NUNCA incluir datos clínicos — solo logística de cita
16. Embeddings: segregados por psychologist_id, nunca cruce entre cuentas
17. AuditLog: registrar toda acción sobre datos clínicos
18. Montos financieros en moneda local del profesional (no convertir a USD en UI)
```

### Diseño

```
19. Color #FFFFFF prohibido — usar --psy-paper (#FAF8F4)
20. Fuente Inter prohibida — usar DM Sans + Lora
21. Sin header ni footer tradicionales
22. Skeleton loaders en todos los componentes con datos async
23. Alertas "high" siempre visibles con animación de pulso
24. Si se siente como SaaS genérico, rehacer
```

---

## 🎯 MÉTRICAS DE ÉXITO

### Técnicas (v1.0)

- Análisis desde texto: < 30 segundos
- Análisis desde audio (Pro): < 2 minutos
- Precisión transcripción español: > 90%
- Generación informe de derivación: < 30 segundos
- Uptime: > 99.5%

### Producto — Lite (piloto semana 12)

- Onboarding en < 10 min: 80% de nuevos usuarios
- Primera nota analizada en < 24h del registro: 70%
- Satisfacción del psicólogo piloto: ≥ 8/10
- Tiempo ahorrado por sesión: ≥ 15 minutos

### Producto — Pro (piloto semana 12)

- Satisfacción del psiquiatra piloto: ≥ 8/10
- AIReports generados/mes por usuario: ≥ 20
- Informes de derivación/mes por usuario: ≥ 5
- Adopción de notas SOAP automáticas: ≥ 70%

### Negocio (v2.0 — mes 12)

- MRR objetivo: $8.000 USD
- Ejemplo: 200 Lite × $19 + 50 Pro × $49 = $6.250 + clínicas
- CAC < $40 USD
- Churn mensual < 5%
- NPS > 50
- Países activos: mínimo 3 (Colombia, México, Argentina)

---

## 🔗 LINKS ÚTILES

- Supabase: https://supabase.com/docs
- Anthropic SDK: https://docs.anthropic.com
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- React Email: https://react.email
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- CIE-11: https://icd.who.int/browse11
- Ley 1581 Colombia: https://www.sic.gov.co/tema/proteccion-de-datos-personales

---

## 📞 CONTEXTO DEL DESARROLLADOR

- **Mario Bas** — developer y entrepreneur, Cali, Colombia
- Stack: Next.js + Supabase (experto — Sumitronic/SomosTécnicos)
- Sistema: Windows, CMD
- Estilo: production-ready, no conceptual — valida con bash antes de continuar
- GitHub: `basabecode`

---

## ✅ CHECKLIST DE INICIO DE SESIÓN

```
[ ] Leer CLAUDE.md completo
[ ] Identificar versión afectada: Lite, Pro, o ambas
[ ] Identificar fase del roadmap: v1.0 / v1.5 / v2.0
[ ] Identificar agente(s) aplicables según AGENTS.md
[ ] Verificar si la tarea involucra biblioteca clínica → leer KNOWLEDGE_SYSTEM.md
[ ] Confirmar idioma: español neutro (válido en todo LATAM y España)
[ ] Proponer siguiente paso concreto según roadmap
```

---

_PsyAssist — La primera plataforma de IA clínica nativa en español_
_para psicólogos y psiquiatras de América Latina y España._
_Construida en Cali, Colombia 🇨🇴 para toda la región._
