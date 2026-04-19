# STACK.md — Stack Tecnológico

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

## Estructura del proyecto

```
mentezer/
├── CLAUDE.md                        ← Guía principal (referencia a este archivo)
├── ROADMAP.md                       ← Roadmap detallado
├── DESIGN_SYSTEM.md                 ← ADN visual y Tailwind
├── STACK.md                         ← Este archivo
├── COMPLIANCE.md                    ← Privacidad y regulatorio
├── DATA_MODEL.md                    ← Esquema SQL completo
├── CODING_STANDARDS.md              ← Convenciones y reglas
├── SUCCESS_METRICS.md               ← Métricas de éxito
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (patient)/                   # Portal del paciente (Pro, v1.5)
│   ├── (intake)/                    # Cuestionario admisión — público sin login
│   ├── (psychometric)/              # Tests psicométricos — público sin login
│   └── api/
│       ├── auth/
│       ├── sessions/
│       ├── knowledge/
│       ├── patients/
│       ├── intake/
│       ├── psychometric/
│       ├── reports/
│       ├── schedule/
│       └── webhooks/
│
├── components/
│   ├── ui/                          # Primitivos Spatial Clinical
│   ├── shell/
│   ├── knowledge/
│   ├── sessions/
│   ├── analysis/
│   ├── patients/
│   ├── referral/
│   ├── psychometric/
│   ├── schedule/
│   └── plan/
│
├── emails/                          # React Email templates
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── ingestor/
│   ├── whatsapp/
│   ├── audio/
│   ├── pdf/
│   ├── email/
│   ├── calendar/
│   ├── consent.ts
│   ├── audit.ts
│   └── utils/
│
├── types/
│   └── supabase.ts                  # Generado automáticamente
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── public/
│   ├── fonts/
│   └── textures/
│
└── .claude/
    ├── settings.json
    ├── skills/
    │   └── rag-clinico.md
    └── agents/
        └── [16 agentes especializados]
```

## Comandos frecuentes

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

# Calidad
pnpm type-check    # 0 errores
pnpm lint          # 0 errores críticos
pnpm build         # build exitoso
```
