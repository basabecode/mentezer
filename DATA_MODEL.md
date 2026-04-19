# DATA_MODEL.md — Modelo de Datos SQL Completo

## Profesionales (psicólogos y psiquiatras)

```sql
Professional
  id, email, name, professional_license
  profession_type (psychologist | psychiatrist)
  specialty, country, timezone
  plan (lite | pro | clinic)
  trial_ends_at, stripe_customer_id
  signature_image_url, digital_signature_key
  preferred_note_format (SOAP | DAP)
  preferred_template_id
  google_calendar_connected, google_calendar_id
  whatsapp_business_phone_id
  created_at
```

## Pacientes y Consentimiento

```sql
Patient
  id, psychologist_id, name, document_id
  age, gender, contact_email, contact_phone
  address, emergency_contact
  reason, referred_by
  status (active | paused | closed)
  consent_signed_at, consent_document_url
  intake_data JSONB
  patient_portal_token
  created_at

IntakeForm
  id, patient_id, psychologist_id
  token VARCHAR UNIQUE
  custom_questions JSONB
  responses JSONB
  completed_at
  expires_at                         -- 72 horas
  created_at
```

## Sesiones y Análisis

```sql
Session
  id, patient_id, psychologist_id
  mode (presential | virtual)
  input_type (text | audio)          -- Lite=text, Pro=text|audio
  scheduled_at, duration_minutes
  audio_url, audio_deleted_at
  status (scheduled|recording|uploaded|transcribing|analyzing|complete|error)
  error_message TEXT
  payment_amount INT                 -- en moneda local
  payment_currency VARCHAR           -- COP|MXN|ARS|PEN|CLP|EUR
  payment_method VARCHAR             -- efectivo|transferencia|nequi|daviplata|tarjeta|exento
  payment_status VARCHAR DEFAULT 'pending'
  payment_date TIMESTAMPTZ
  created_at

Transcript
  id, session_id
  content JSONB                      -- texto con timestamps
  edited_at

ClinicalNote
  id, session_id, psychologist_id, patient_id
  format (SOAP | DAP)
  content JSONB                      -- {S,O,A,P} o {D,A,P}
  is_signed BOOLEAN DEFAULT false
  signed_at TIMESTAMPTZ
  pdf_url TEXT
  created_at

AIReport
  id, session_id
  summary TEXT
  patterns JSONB
  diagnostic_hints JSONB             -- hipótesis, NUNCA diagnóstico definitivo
  cie11_codes JSONB                  -- Solo Pro
  risk_signals JSONB                 -- [{signal, severity: low|medium|high, description}]
  similar_cases JSONB
  evolution_vs_previous TEXT
  therapeutic_suggestions JSONB
  knowledge_sources_used JSONB       -- libros citados
  disclaimer TEXT                    -- SIEMPRE incluido
  generated_at, model_used

PrivateNote
  id, session_id, psychologist_id, patient_id
  content TEXT
  created_at, updated_at
```

## Planes y Documentos (Pro)

```sql
TherapeuticPlan
  id, patient_id, psychologist_id
  status (draft | active | completed)
  ai_draft JSONB, approved_plan JSONB
  shared_with_patient_at
  created_at, updated_at

PlanObjective
  id, plan_id, description
  interventions, frequency, indicators
  progress INT (0-100)
  sessions_tracked JSONB

ReferralReport
  id, patient_id, psychologist_id
  recipient_specialist_name, recipient_specialty, recipient_email
  reason_for_referral TEXT
  ai_draft TEXT, approved_content TEXT
  diagnosis_codes JSONB              -- CIE-11
  interventions_summary TEXT
  evolution_summary TEXT
  recommendations TEXT
  pdf_url, email_sent_at
  patient_acknowledged_at
  status (draft | approved | sent | acknowledged)
  created_at
```

## Tests Psicométricos (Pro)

```sql
PsychometricTest
  id, name, short_name, description
  items JSONB, scoring_rules JSONB, interpretation JSONB
  is_active BOOLEAN

PatientTestResult
  id, patient_id, psychologist_id
  test_id, session_id (nullable)
  token VARCHAR UNIQUE               -- link público sin login
  responses JSONB
  total_score INT
  interpretation VARCHAR             -- leve | moderado | severo
  completed_at, expires_at, created_at
```

## Biblioteca Clínica

```sql
KnowledgeGroup                       -- 8 grupos base del sistema
PersonalKnowledgeGroup               -- grupos creados por IA (documentos personales)
PsychologistKnowledgeGroup           -- enfoques activos por profesional

KnowledgeDocument
  id, psychologist_id (null = sistema)
  title, author, category
  file_url, file_size_bytes
  processing_status (pending|processing|ready|error)
  source_type (system | personal)
  group_id, personal_group_id
  ai_classification JSONB, personal_label TEXT
  chunk_count, uploaded_at

DocumentChunk
  id, document_id, psychologist_id
  content TEXT, page_number INT
  embedding vector(1536)

ClinicalCase
  id, psychologist_id, patient_id (anonimizable)
  title, description
  diagnosis_explored, interventions_used
  outcome (successful | partial | failed)
  sessions_count INT
  embedding vector(1536)
  is_indexed BOOLEAN, created_at
```

## Agenda y Citas

```sql
Availability
  id, psychologist_id
  day_of_week (0-6), start_time, end_time
  session_duration_minutes, buffer_minutes, is_active

Appointment
  id, psychologist_id, patient_id
  scheduled_at, duration_minutes
  mode (presential | virtual), meeting_url
  status (requested|confirmed|completed|cancelled|no_show)
  requested_by (patient | psychologist)
  confirmation_token, cancellation_reason
  google_calendar_event_id, created_at
```

## WhatsApp y Mensajería

```sql
WhatsAppMessage
  id, session_id, patient_id, psychologist_id
  message_type (reminder_24h | reminder_1h | confirmation | cancellation)
  status (sent | delivered | read | failed)
  wa_message_id
  sent_at, delivered_at, read_at
```

## Auditoría

```sql
AuditLog
  id, psychologist_id, action
  resource_type, resource_id
  ip_address, user_agent
  metadata JSONB, created_at

DataDeletionRequest
  id, patient_id, psychologist_id
  requested_at, completed_at, items_deleted JSONB
```

## Regla fundamental

**RLS habilitado SIEMPRE. `psychologist_id` presente en casi todas.**
Policies específicas para SELECT, INSERT, UPDATE y DELETE por separado.
