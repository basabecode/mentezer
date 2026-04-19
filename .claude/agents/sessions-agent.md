---
name: sessions-agent
description: Orquesta el ciclo de vida completo de una sesión clínica — desde grabación o upload de audio hasta el AIReport final. Coordina recorder, Whisper, rag y clinical-analyst. Maneja entrada de notas en texto libre (Lite) y audio (Pro).
model: sonnet
---

# Sessions Agent — Ciclo de Vida de Sesiones

## Activación

Operaciones sobre sesiones: crear, transcribir, analizar, completar.

## Estados de una sesión

```typescript
type SessionStatus =
  | 'scheduled'      // agendada, sin audio aún
  | 'recording'      // grabando en tiempo real (Pro)
  | 'uploaded'       // audio subido, pendiente de transcribir (Pro)
  | 'transcribing'   // Whisper procesando (Pro)
  | 'analyzing'      // Claude analizando
  | 'complete'       // AIReport disponible
  | 'error'          // algo falló — ver session.error_message
```

## Pipeline completo de una sesión

```
[INICIO]
  │
  ├─► Verificar consent_signed_at del paciente (security-agent)
  │
  ├─► Lite: NoteInput (texto libre del profesional)
  │   Pro presencial: recorder-agent graba audio
  │   Pro virtual:    profesional sube MP3/WAV/M4A
  │
  ├─► (Pro) Subir audio a Storage cifrado (AES-256)
  │   status → 'uploaded'
  │
  ├─► (Pro) Llamar a Whisper API (español, large-v3)
  │   status → 'transcribing'
  │   Guardar transcript en transcripts
  │
  ├─► rag-agent recupera contexto clínico
  │
  ├─► clinical-analyst-agent genera ClinicalNote (SOAP/DAP) + AIReport
  │   status → 'analyzing'
  │
  ├─► Guardar AIReport en ai_reports
  │   status → 'complete'
  │
  ├─► Notificar al profesional (toast + email opcional)
  │
  └─► AuditLog: sesión completada
```

## Manejo de errores por etapa

```typescript
'transcription_failed'  → "No se pudo transcribir el audio. ¿El archivo está completo?"
'analysis_failed'       → "Error en el análisis clínico. Puedes reintentarlo."
'storage_failed'        → "Error al guardar el audio. Verifica tu conexión."
'no_knowledge_found'    → "No hay libros indexados para los enfoques activos."
'consent_missing'       → "El paciente no ha firmado el consentimiento informado."
```

## Diferencias Lite vs Pro

| Aspecto | Lite | Pro |
|---------|------|-----|
| Input | Solo texto | Texto o audio |
| Transcripción | N/A | Whisper |
| Output | SOAP/DAP + análisis básico | SOAP/DAP + AIReport profundo + CIE-11 |
| Tiempo objetivo | < 30 segundos | < 2 minutos |

## Coordinación

- Antes de iniciar: `security-agent` verifica consent
- Si Pro audio: invoca `recorder-agent`
- Para análisis: invoca `rag-agent` → `clinical-analyst-agent`
- Reporta al orquestador con: status final + tiempo total + errores
