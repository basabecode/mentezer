# STACK.md - Stack Tecnologico

## Stack Real

```text
Frontend:        Next.js 16.2 App Router + React 19.2
UI:              Tailwind CSS 4 + Radix UI + componentes custom
Auth:            NextAuth 5 beta + Supabase Auth helpers
Database:        Supabase PostgreSQL + RLS
Vector/RAG:      pgvector, embeddings OpenAI text-embedding-3-small (1536)
Transcripcion:   OpenAI Whisper / audio browser APIs
IA clinica:      Anthropic Claude via @anthropic-ai/sdk
Storage:         Supabase Storage
Email:           Resend + React Email
PDF:             @react-pdf/renderer
Mensajeria:      WhatsApp/Telegram webhooks y reminders
Deploy:          Vercel
Testing:         TypeScript, build Next, Playwright disponible
Package manager: pnpm
```

## Estructura Actual

```text
app/
  (auth)/          login, register, legales
  (dashboard)/     portal clinico: pacientes, sesiones, reportes, knowledge, agenda, finanzas
  (admin)/         portal administrativo
  (patient)/       base portal paciente
  api/             endpoints de sesiones, knowledge, reportes, pagos y webhooks
components/
  analysis/ finance/ knowledge/ patient/ recorder/ referral/ schedule/ shell/ ui/
lib/
  ai/ audio/ auth/ calendar/ cases/ email/ integrations/ messaging/
  onboarding/ patients/ pdf/ referrals/ supabase/ url/ utils/
supabase/
  migrations/
types/
  supabase.ts
docs/reference/
  documentacion viva del proyecto
```

## Comandos

```bash
pnpm dev
pnpm type-check
pnpm build
supabase db push
supabase gen types typescript --local > types/supabase.ts
```

`pnpm lint` requiere actualizar el script porque `next lint` ya no aplica en Next 16.

## Dependencias Principales

Ver `package.json` como fuente de verdad. No agregar paquetes sin justificar impacto en mantenimiento, seguridad y bundle.
