# CLAUDE.md - MENTEZER

Plataforma SaaS de apoyo clinico con IA para psicologos y psiquiatras de habla hispana.

## Estado Actual

- Stack real: Next.js 16.2, React 19.2, TypeScript strict, Tailwind CSS 4, Supabase, NextAuth 5 beta.
- Fase: v1.0 en progreso, Sprint 4.
- Modulos implementados: auth, dashboard clinico, admin, pacientes, sesiones, grabacion/transcripcion, biblioteca/RAG, reportes, agenda base, finanzas, WhatsApp reminders, notas de paciente.
- Ultima actualizacion relevante: `patient_notes` aplicado en Supabase y ruta de paciente consolidada en `/patients/[slug]`.

## Reglas Operativas

1. Responder y escribir UI/copy en espanol neutro.
2. Leer solo la documentacion necesaria para la tarea; evitar cargar docs largos sin razon.
3. Validar con codigo real antes de dar algo por terminado.
4. Editar lo minimo necesario y respetar cambios existentes del usuario.
5. No agregar dependencias sin justificar.
6. En datos clinicos: verificar sesion, ownership por `psychologist_id`, RLS y audit log.
7. En outputs de IA: disclaimer clinico obligatorio y diagnosticos solo como hipotesis exploratoria.
8. En UI: mantener el lenguaje visual "Calma Profesional"; si se siente generico, ajustar.

## Documentacion Viva

La raiz queda deliberadamente pequena. Las referencias largas estan en `docs/reference/`:

- `docs/reference/ROADMAP.md` - roadmap y modulos por version.
- `docs/reference/STACK.md` - stack y estructura del repo.
- `docs/reference/DATA_MODEL.md` - modelo de datos.
- `docs/reference/COMPLIANCE.md` - privacidad, Ley 1581 y seguridad clinica.
- `docs/reference/DESIGN_SYSTEM.md` - tokens y reglas visuales.
- `docs/reference/CODING_STANDARDS.md` - convenciones de codigo.
- `docs/reference/FEATURES_COMPARISON.md` - Lite vs Pro.
- `docs/reference/KNOWLEDGE_SYSTEM.md` - biblioteca clinica/RAG.
- `docs/reference/SUCCESS_METRICS.md` - metricas de producto y negocio.

## Comandos

```bash
pnpm dev
pnpm type-check
pnpm build
supabase db push
supabase gen types typescript --local > types/supabase.ts
```

Nota: en Next 16 el script actual `pnpm lint` usa `next lint`, que ya no es valido en este proyecto hasta actualizar la configuracion de lint.

## Reglas Clinicas Absolutas

- RLS en toda tabla clinica.
- Nunca exponer `service_role` en frontend.
- Consentimiento antes de grabar, transcribir, analizar o generar informes.
- Derecho al olvido con eliminacion en cascada.
- Notas privadas nunca en exportaciones ni portal del paciente.
- WhatsApp solo para logistica, no datos clinicos.
- Logs sin datos sensibles de pacientes.
