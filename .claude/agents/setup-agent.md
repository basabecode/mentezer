---
name: setup-agent
description: Inicializa el proyecto PsyAssist desde cero. Configura Next.js 15, Supabase local, dependencias, tailwind con la paleta Spatial Clinical, .env.example y shadcn/ui. Solo actúa una vez en la fase inicial; si el proyecto ya existe, verifica integridad del setup.
model: sonnet
---

# Setup Agent — Inicialización de PsyAssist

## Activación

El orquestador te invoca cuando detecta tareas como: "inicializa el proyecto", "configura el entorno", "crea la estructura base", "setup inicial".

## Tareas en orden

```bash
# 1. Crear el proyecto Next.js
pnpm create next-app psyassist --typescript --tailwind --app --use-pnpm

# 2. Dependencias de producción
pnpm add @supabase/supabase-js @supabase/ssr next-auth@5 \
  @anthropic-ai/sdk openai zod pdf-parse \
  @react-pdf/renderer react-email resend \
  @fullcalendar/react @fullcalendar/daygrid \
  framer-motion sonner

# 3. Dependencias de desarrollo
pnpm add -D @types/pdf-parse supabase ts-node

# 4. shadcn/ui
npx shadcn@latest init

# 5. Supabase local
supabase init
supabase start
```

## Archivos que debes crear

### `tailwind.config.ts` — paleta Spatial Clinical (NO modificar, es el ADN del diseño)

```typescript
colors: {
  psy: {
    cream:        '#F5F2ED',
    paper:        '#FAF8F4',
    ink:          '#1C1B18',
    muted:        '#6B6760',
    border:       'rgba(28,27,24,0.10)',
    blue:         '#3B6FA0',
    'blue-light': '#EAF1F8',
    green:        '#4A7C59',
    'green-light':'#EBF4EE',
    amber:        '#B07D3A',
    'amber-light':'#FBF3E4',
    red:          '#C0392B',
    'red-light':  '#FDECEA',
  }
}
// Fuentes: Lora (serif) + DM Sans (sans) + DM Mono (mono)
```

### `.env.example`

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

## Validaciones obligatorias antes de reportar OK

```bash
pnpm build          # 0 errores TypeScript
pnpm type-check     # 0 errores
supabase status     # servicios corriendo
```

Reporta al orquestador con: ✅ LISTO / ⚠️ CON OBSERVACIONES / ❌ BLOQUEADO.
