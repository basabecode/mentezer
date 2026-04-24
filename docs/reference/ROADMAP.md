# ROADMAP.md - Mentezer

## Estado Actual

Fase: v1.0, Sprint 4.

Implementado en codigo:

- Auth, login, registro y onboarding base.
- Dashboard clinico y dashboard admin.
- Pacientes, consentimiento, notas de paciente y derecho al olvido base.
- Sesiones, grabacion, transcripcion y analisis.
- Biblioteca clinica/RAG con documentos base y personales.
- Reportes e informes de derivacion.
- Agenda base, finanzas y recordatorios.
- WhatsApp/Telegram webhooks base.

## v1.0 - Pendientes Reales

- Onboarding Lite/Pro completo y medible.
- QA end-to-end de flujos criticos.
- Validacion RLS multiusuario en Supabase real.
- Google Calendar OAuth completo.
- Piloto con usuarios reales y feedback loop.
- Ajustar lint a Next 16.

## v1.5 - Retencion y Diferenciacion

- Tests psicometricos digitales.
- Memoria de casos exitosos con busqueda semantica.
- Planes terapeuticos generados con IA.
- Portal del paciente.
- Timeline de evolucion del paciente.
- Plantillas clinicas por enfoque.
- Agenda propia con reservas.

## v2.0 - SaaS Escalable

- Stripe suscripciones.
- Onboarding self-service.
- Plan Clinic multi-profesional.
- App movil.
- Integraciones Meet/Zoom.
- SEO por pais.

## Modulos Lite vs Pro

Fuente comercial: `docs/reference/FEATURES_COMPARISON.md`.

Regla: no implementar ni exponer features Pro sin validacion de plan en backend y UI.
