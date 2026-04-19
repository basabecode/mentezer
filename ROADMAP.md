# ROADMAP — MENTEZER v1.0 a v2.0

## v1.0 — MVP con Lite y Pro (8-12 semanas)

### Sprint 1 — Fundación (semanas 1-2)
- [x] Setup Next.js 15 + Supabase + NextAuth 5
- [x] Shell Spatial Clinical (topbar + panel + dock + drawer)
- [x] CRUD Professional (type: psychologist | psychiatrist)
- [x] CRUD Patient con consentimiento digital
- [x] Derecho al olvido (eliminación en cascada completa)
- [x] Migración DB completa con RLS en todas las tablas
- [x] Seed de los 8 grupos de conocimiento base

### Sprint 2 — IA Core Lite (semanas 3-4) ✅ COMPLETADO
- [x] NoteInput — entrada de notas en texto libre
- [x] Generación de nota SOAP/DAP con Claude
- [x] Notas privadas del terapeuta
- [x] Cuestionario de admisión (link público + token 72h)
- [x] Upload PDFs personales + clasificación IA
- [x] Script bulk-load: indexar los 126 libros
- [x] RAG unificado: dos capas (base + personal)
- [x] Análisis clínico básico con citas bibliográficas
- [x] Grabación Web Audio API
- [x] Upload de audio + Transcripción Whisper

### Sprint 3 — Features Pro + Adopción (semanas 5-7) ✅ 100% COMPLETADO
- [x] AIReport profundo con CIE-11
- [x] Informe de derivación PDF + email
- [x] Knowledge Profiles (activar/desactivar enfoques)
- [x] WhatsApp Business API — cliente
- [x] WhatsApp webhook
- [x] WhatsApp recordatorios automáticos 24h y 1h
- [x] Panel financiero básico (USD)
- [ ] Google Calendar integración OAuth ← **PENDIENTE**
- [x] Dashboard con alertas de riesgo
- [x] Audit logs (schema)

### Sprint 4 — Pulido y piloto (semanas 8-12) 🔄 EN PROGRESO
- [ ] Onboarding Lite (< 10 min)
- [ ] Onboarding Pro (< 30 min, guiado)
- [x] Landing page con diferenciación Lite vs Pro
- [ ] qa-agent: testing completo (TypeScript, build, RLS, UX)
- [ ] 5-10 psicólogos piloto con Lite (Colombia, México)
- [ ] 2-3 psiquiatras piloto con Pro (Colombia)
- [ ] Métricas de uso y feedback loop

## v1.5 — Retención y diferenciación (mes 4-6)
- [ ] Tests psicométricos digitales (PHQ-9, GAD-7, DASS-21, PCL-5, Rosenberg)
- [ ] Memoria de casos exitosos (búsqueda semántica acumulativa)
- [ ] Planes terapéuticos generados con IA
- [ ] Portal del paciente
- [ ] Timeline de evolución visual del paciente
- [ ] Plantillas de historia clínica por enfoque terapéutico
- [ ] Agenda propia con widget de reservas

## v2.0 — SaaS escalable (mes 7-12)
- [ ] Stripe suscripciones (Lite $19 / Pro $49 / Clinic $149)
- [ ] Onboarding self-service automatizado
- [ ] Plan Clinic — hasta 5 profesionales, admin central
- [ ] App móvil (grabación desde celular)
- [ ] Meet/Zoom SDK integración directa
- [ ] SEO por país: landing pages México, Argentina, España

## Módulos por versión

| Módulo                                    | Lite | Pro | Versión |
| ----------------------------------------- | :--: | :-: | ------- |
| Auth + gestión de cuenta                  | ✅  | ✅  | v1.0    |
| Gestión de pacientes + consentimiento     | ✅  | ✅  | v1.0    |
| Notas texto libre + SOAP/DAP IA           | ✅  | ✅  | v1.0    |
| Análisis clínico con biblioteca base      | ✅  | ✅  | v1.0    |
| Notas privadas del terapeuta              | ✅  | ✅  | v1.0    |
| Cuestionario de admisión                  | ✅  | ✅  | v1.0    |
| WhatsApp cliente                          | ✅  | ✅  | v1.0    |
| WhatsApp recordatorios automáticos        | ✅  | ✅  | v1.0    |
| Panel financiero básico (USD)             | ✅  | ✅  | v1.0    |
| Dashboard + alertas de riesgo             | ✅  | ✅  | v1.0    |
| Biblioteca base                           | 3   | 8   | v1.0    |
| PDFs personales                           | 3   | ∞   | v1.0    |
| Derecho al olvido                         | ✅  | ✅  | v1.0    |
| Grabación + transcripción Whisper         | ❌  | ✅  | v1.0    |
| AIReport profundo                         | ❌  | ✅  | v1.0    |
| AIReport con CIE-11                       | ❌  | 🔄  | v1.0    |
| Knowledge Profiles                        | ❌  | ✅  | v1.0    |
| Clasificación IA de documentos            | ❌  | ✅  | v1.0    |
| Informes de derivación PDF + email        | ❌  | ✅  | v1.0    |
| Google Calendar integración               | ❌  | 🔄  | v1.0    |
| Tests psicométricos digitales             | ❌  | ❌  | v1.5    |
| Memoria de casos exitosos                 | ❌  | ❌  | v1.5    |
| Planes terapéuticos IA                    | ❌  | ❌  | v1.5    |
| Portal del paciente                       | ❌  | ❌  | v1.5    |
| Timeline de evolución                     | ❌  | ❌  | v1.5    |
| Plantillas por enfoque                    | ❌  | ❌  | v1.5    |
| Agenda propia + reservas                  | ❌  | ❌  | v1.5    |
| Multi-tenant SaaS (Stripe)                | ❌  | ❌  | v2.0    |
| App móvil                                 | ❌  | ❌  | v2.0    |
| Meet/Zoom SDK                             | ❌  | ❌  | v2.0    |
