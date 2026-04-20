# MENTEZER

Plataforma SaaS de apoyo clínico para psicólogos y psiquiatras de habla hispana.  
Combina gestión operativa, transcripción, análisis asistido por IA y recuperación de conocimiento sobre la biblioteca clínica del profesional.

## Resumen

MENTEZER está construido como una aplicación `Next.js + Supabase` con enfoque en:

- documentación clínica más rápida y estructurada
- análisis asistido por IA con contexto bibliográfico
- gestión de pacientes, sesiones, reportes y agenda
- privacidad, consentimiento y trazabilidad para entornos clínicos

El producto está orientado a LATAM y España, con copy, flujos y terminología pensados para práctica clínica en español.

## Qué resuelve

El proyecto busca reducir la carga operativa posterior a cada sesión y mejorar la calidad del contexto clínico disponible para el profesional.

Capacidades principales implementadas en el repositorio:

- portal de autenticación y onboarding
- portal clínico para psicólogo
- portal administrativo
- gestión de pacientes y consentimiento
- registro de sesiones y transcripción de audio
- generación de reportes clínicos asistidos por IA
- biblioteca clínica con RAG sobre documentos base y personales
- informes de derivación en PDF y envío por email
- base de agenda, finanzas y recordatorios

## Estado del proyecto

Estado actual: `v1.0` en progreso, con buena parte del núcleo funcional ya implementado y despliegue en Vercel.

Hoy existe en código:

- landing pública
- login y registro
- dashboard del psicólogo
- dashboard de administración
- módulos de pacientes, sesiones, casos clínicos, reportes, biblioteca, agenda y finanzas
- integraciones base con Supabase, Anthropic, OpenAI, Resend y Stripe

Pendientes relevantes del roadmap:

- integración completa con Google Calendar
- cierre de onboarding guiado
- mayor cobertura de QA end-to-end
- features v1.5 como portal del paciente y tests psicométricos

Para detalle fino del roadmap: [ROADMAP.md](ROADMAP.md)

## Stack

Tecnologías principales usadas actualmente en el proyecto:

- `Next.js 16` con App Router
- `React 19`
- `TypeScript` en modo estricto
- `Tailwind CSS 4`
- `Supabase` para PostgreSQL, Auth, Storage y RLS
- `NextAuth 5 beta` para autenticación
- `Anthropic SDK` para análisis clínico con Claude
- `OpenAI` para embeddings y transcripción
- `Resend` para email
- `@react-pdf/renderer` para PDFs
- `Playwright` para pruebas E2E

## Arquitectura funcional

El repositorio está organizado alrededor de tres capas principales:

1. `app/`
   Contiene las rutas públicas, privadas y APIs del sistema.
2. `components/`
   Contiene la UI reusable y el shell del producto.
3. `lib/`
   Contiene la lógica de negocio, integraciones, IA, seguridad y acceso a datos.

Portales relevantes:

- `app/(auth)` autenticación y legales
- `app/(dashboard)` portal principal del psicólogo
- `app/(admin)` portal administrativo
- `app/api` endpoints para sesiones, reportes, knowledge, pagos y webhooks

## Estructura del repositorio

```text
.
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (admin)/
│   └── api/
├── components/
│   ├── ui/
│   ├── shell/
│   ├── analysis/
│   ├── knowledge/
│   ├── finance/
│   └── referral/
├── lib/
│   ├── ai/
│   ├── auth/
│   ├── supabase/
│   ├── email/
│   ├── pdf/
│   ├── integrations/
│   └── cases/
├── supabase/
│   └── migrations/
├── e2e/
├── docs/
├── scripts/
└── types/
```

## Primer arranque local

### 1. Requisitos

- `Node.js 20+`
- `pnpm`
- proyecto/configuración de `Supabase`
- claves de proveedores si quieres probar IA, email o pagos

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Usa `.env.example` como base:

```bash
cp .env.example .env.local
```

Variables principales:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`

Variables opcionales según módulo:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `E2E_PSY_EMAIL`
- `E2E_PSY_PASSWORD`
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Aplicación local:

- `http://localhost:3000`

## Scripts útiles

```bash
pnpm dev
pnpm build
pnpm start
pnpm type-check
pnpm lint
```

Comandos frecuentes de Supabase:

```bash
supabase start
supabase db push
supabase migration new nombre_descriptivo
supabase gen types typescript --local > types/supabase.ts
```

## Calidad y validación

Antes de merge o deploy, el flujo esperado es:

```bash
pnpm type-check
pnpm build
```

En este proyecto se usan además:

- pruebas E2E con `Playwright`
- revisión manual del portal clínico y admin
- verificación de deploy en `Vercel`

## Seguridad y compliance

Este repositorio toca flujos de datos clínicos. Por eso hay varias reglas no negociables:

- RLS en tablas de datos clínicos
- consentimiento informado antes de análisis de sesión
- disclaimers clínicos en outputs de IA
- no hardcodear credenciales ni cuentas de prueba
- no subir archivos locales sensibles ni artefactos generados
- tratamiento cuidadoso de datos de pacientes y logs

Documentos relacionados:

- [COMPLIANCE.md](COMPLIANCE.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [CODING_STANDARDS.md](CODING_STANDARDS.md)

## Diseño del producto

El sistema usa una línea visual propia llamada `Spatial Clinical`, con énfasis en:

- fondo clínico cálido, no SaaS genérico
- navegación contextual
- paneles y módulos orientados a trabajo diario de consulta
- lenguaje visual serio y profesional

Referencia:

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

## IA y biblioteca clínica

Uno de los diferenciales del proyecto es el uso de RAG sobre la biblioteca del profesional y sobre documentos base del sistema.

Esto incluye:

- carga y clasificación de documentos
- embeddings vectoriales
- recuperación de fragmentos relevantes
- análisis de sesiones con referencias bibliográficas
- reutilización de casos clínicos cerrados como memoria de apoyo

Referencia:

- [KNOWLEDGE_SYSTEM.md](KNOWLEDGE_SYSTEM.md)

## Documentación clave del repositorio

- [ROADMAP.md](ROADMAP.md) estado y próximos pasos
- [STACK.md](STACK.md) stack técnico
- [DATA_MODEL.md](DATA_MODEL.md) modelo de datos
- [COMPLIANCE.md](COMPLIANCE.md) privacidad y regulación
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) sistema de diseño
- [FEATURES_COMPARISON.md](FEATURES_COMPARISON.md) módulos Lite vs Pro
- [SUCCESS_METRICS.md](SUCCESS_METRICS.md) métricas objetivo
- [AGENTS.md](AGENTS.md) flujo de trabajo con agentes internos

## Deploy

El proyecto se despliega en `Vercel`.

Flujo típico:

```bash
pnpm build
vercel
vercel --prod
```

Si trabajas con GitHub + Vercel, valida:

- rama conectada al proyecto correcto
- variables de entorno cargadas en Vercel
- consistencia de `.vercel/project.json`

## Notas para contribuidores

Si vas a revisar o extender el proyecto:

- prioriza cambios compatibles con el lenguaje clínico en español
- evita introducir UI genérica o dependencias innecesarias
- preserva el enfoque en seguridad y trazabilidad
- valida con `type-check` y `build`
- revisa primero la documentación de dominio antes de tocar módulos sensibles

## Licencia

Pendiente de definición pública.

Si este repositorio va a abrirse más formalmente, conviene añadir un archivo `LICENSE` y definir si será código propietario, source-available o una licencia open source.
