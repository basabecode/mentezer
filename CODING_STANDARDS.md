# CODING_STANDARDS.md — Convenciones y Reglas

## TypeScript

- Strict mode siempre
- Interfaces en `/types/*.ts`
- Server Actions para mutaciones
- RSC por defecto, `'use client'` solo cuando necesario
- Zod para validación en frontend Y backend
- Nunca `any` — usar `unknown` + type guards

## API Routes

- Validar SIEMPRE con Zod
- Verificar sesión con `getServerSession` antes de cualquier operación
- Verificar ownership: `psychologist_id === session.user.id`
- Verificar plan antes de features Pro: `if (session.user.plan !== 'pro') return 403`
- Respuestas: `{ data } | { error: string }`

## Supabase

- Cliente server: `createServerClient()` con cookies
- Cliente browser: `createBrowserClient()`
- NUNCA service_role_key en código frontend
- NUNCA bypassear RLS en rutas de usuario
- SIEMPRE regenerar tipos después de migraciones

## Componentes

- Server Components para data fetching
- Skeleton loaders en TODOS los datos async
- Error boundaries en secciones críticas
- Toast (sonner) para feedback de IA
- Verificar plan del usuario antes de renderizar features Pro

## Naming

- Componentes: `PascalCase`
- Funciones/variables: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Archivos componentes: `PascalCase.tsx`
- Archivos utils/lib: `kebab-case.ts`

## Reglas de arquitectura

```
1.  Leer CLAUDE.md + AGENTS.md antes de cualquier tarea
2.  Nunca crear tabla sin RLS habilitado
3.  Nunca procesar datos clínicos sin consent_signed_at verificado
4.  Nunca dar por implementado algo sin ejecutar y validar
5.  Respetar el roadmap — no implementar features de v1.5 en v1.0
6.  Verificar a qué versión (Lite/Pro) pertenece cada feature
7.  Bloquear features Pro con verificación de plan en API y UI
8.  Siempre incluir disclaimer clínico en outputs de IA
9.  Siempre citar libro, autor y página en observaciones clínicas
10. Diagnósticos solo como "hipótesis exploratoria" — nunca definitivos
11. Cada output de IA guardado en DB antes de mostrarse al profesional
12. Prompts en español neutro — válido en todo LATAM y España
```

## Reglas de diseño

```
13. Color #FFFFFF prohibido — usar --psy-paper (#FAF8F4)
14. Fuente Inter prohibida — usar DM Sans + Lora
15. Sin header ni footer tradicionales
16. Skeleton loaders en todos los componentes con datos async
17. Alertas "high" siempre visibles con animación de pulso
18. Si se siente como SaaS genérico, rehacer
19. Tailwind con tokens semánticos; evitar `bg-[var(--psy-xxx)]`, `text-[var(--psy-xxx)]`, `rounded-[xxx]`
20. Notas privadas: NUNCA en exportaciones, portales ni vistas del paciente
21. WhatsApp: NUNCA incluir datos clínicos — solo logística de cita
22. Embeddings: segregados por psychologist_id, nunca cruce entre cuentas
23. AuditLog: registrar toda acción sobre datos clínicos
```

## Comentarios

- Defecto: sin comentarios
- Solo si el WHY es no-obvio (constraint oculta, invariante sutil, workaround)
- Máximo 1 línea corta
- NUNCA multi-línea docstrings o comentarios de bloque

## Estructura de commits

Seguir convención:
- `feat(módulo): descripción`
- `fix(módulo): descripción`
- `refactor(módulo): descripción`
- `docs: descripción`

Incluir contexto en el body si es no-obvio.
