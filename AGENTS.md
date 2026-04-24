# AGENTS.md - MENTEZER

Guia compacta para trabajar en este repo sin cargar documentacion redundante.

## Orquestacion

- Mario da instrucciones al agente principal.
- No se invocan subagentes automaticamente salvo que la tarea lo pida de forma explicita.
- Para cada tarea: identificar modulo, leer solo la referencia necesaria en `docs/reference/`, implementar, validar y reportar en espanol.

## Routing Por Tipo De Tarea

| Tarea | Referencia | Validacion minima |
| --- | --- | --- |
| Base de datos, migraciones, RLS | `docs/reference/DATA_MODEL.md` y `docs/reference/COMPLIANCE.md` | `supabase db push`, regenerar tipos, `pnpm type-check` |
| Auth, sesiones, permisos | `docs/reference/COMPLIANCE.md` | acceso sin sesion bloqueado, ownership validado |
| Pacientes, notas, consentimiento | `docs/reference/DATA_MODEL.md` y `docs/reference/COMPLIANCE.md` | RLS, audit log, `pnpm type-check` |
| Grabacion/transcripcion | `components/recorder/`, `lib/audio/`, `app/api/sessions/*` | consentimiento, build, prueba manual si hay UI |
| Biblioteca clinica/RAG | `docs/reference/KNOWLEDGE_SYSTEM.md` | embeddings 1536, RLS, resultados por `psychologist_id` |
| Analisis IA/reportes | `lib/ai/`, `lib/referrals/`, `components/referral/` | disclaimer, citas, audit log, build |
| UI/dashboard | `docs/reference/DESIGN_SYSTEM.md` | responsive, tokens, sin UI generica |
| Roadmap/versiones | `docs/reference/ROADMAP.md` y `docs/reference/FEATURES_COMPARISON.md` | no adelantar features fuera de version |

## Reglas Globales

1. Validar antes de reportar terminado.
2. No tocar datos clinicos sin sesion y ownership.
3. No crear tablas sin RLS ni policies por operacion.
4. No exponer secretos ni datos clinicos en logs.
5. Mantener outputs y mensajes de usuario en espanol.
6. En IA clinica: disclaimer obligatorio.
7. En UI: usar tokens `psy-*`, fondo calmo y componentes acordes al producto.

## Estado De Rutas Importante

- Pacientes usa `/patients/[slug]`.
- `parsePatientSlug` mantiene compatibilidad con URLs antiguas que solo tienen ID.
- No recrear `app/(dashboard)/patients/[id]`; entra en conflicto con `[slug]`.

## Documentacion

La documentacion extensa vive en `docs/reference/`. Si una tarea deja una bitacora temporal o checklist ya completado, eliminarlo o integrarlo en la referencia correspondiente.
