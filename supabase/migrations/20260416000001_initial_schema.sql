-- ============================================================
-- Mentezer — Migración inicial
-- Fecha: 2026-04-16
-- Incluye: todas las tablas, RLS, índices pgvector
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PSICÓLOGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS psychologists (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                     TEXT UNIQUE NOT NULL,
  name                      TEXT NOT NULL,
  professional_license      TEXT,
  specialty                 TEXT,
  country                   TEXT NOT NULL DEFAULT 'CO',
  timezone                  TEXT NOT NULL DEFAULT 'America/Bogota',
  stripe_customer_id        TEXT,
  plan                      TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','professional','clinic')),
  trial_ends_at             TIMESTAMPTZ,
  signature_image_url       TEXT,
  digital_signature_key     TEXT,
  google_calendar_connected BOOLEAN NOT NULL DEFAULT FALSE,
  google_calendar_id        TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psychologists_own_data"
  ON psychologists FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- PACIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id       UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  document_id           TEXT,
  age                   INT,
  gender                TEXT,
  contact_email         TEXT,
  contact_phone         TEXT,
  address               TEXT,
  emergency_contact     TEXT,
  reason                TEXT,
  referred_by           TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
  consent_signed_at     TIMESTAMPTZ,
  consent_document_url  TEXT,
  patient_portal_token  TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_by_psychologist"
  ON patients FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(psychologist_id, status);

-- ============================================================
-- SESIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id  UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  mode             TEXT NOT NULL DEFAULT 'presential' CHECK (mode IN ('presential','virtual')),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  audio_url        TEXT,
  audio_deleted_at TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','recording','transcribing','analyzing','complete')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_by_psychologist"
  ON sessions FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_sessions_psychologist ON sessions(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(psychologist_id, status);

-- ============================================================
-- TRANSCRIPCIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS transcripts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  content     JSONB NOT NULL DEFAULT '[]',
  edited_at   TIMESTAMPTZ
);

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transcripts_via_session"
  ON transcripts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.psychologist_id = auth.uid()
    )
  );

-- ============================================================
-- REPORTES IA
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id              UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  summary                 TEXT NOT NULL,
  patterns                JSONB NOT NULL DEFAULT '[]',
  diagnostic_hints        JSONB NOT NULL DEFAULT '[]',
  risk_signals            JSONB NOT NULL DEFAULT '[]',
  similar_cases           JSONB NOT NULL DEFAULT '[]',
  evolution_vs_previous   TEXT,
  therapeutic_suggestions JSONB NOT NULL DEFAULT '[]',
  disclaimer              TEXT NOT NULL,
  generated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  model_used              TEXT NOT NULL
);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_reports_via_session"
  ON ai_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.psychologist_id = auth.uid()
    )
  );

-- ============================================================
-- PLANES TERAPÉUTICOS
-- ============================================================
CREATE TABLE IF NOT EXISTS therapeutic_plans (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id             UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id        UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  status                 TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed')),
  ai_draft               JSONB,
  approved_plan          JSONB,
  shared_with_patient_at TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE therapeutic_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_by_psychologist"
  ON therapeutic_plans FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- ============================================================
-- INFORMES DE DERIVACIÓN
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_reports (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id           UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  recipient_specialist_name TEXT NOT NULL,
  recipient_specialty       TEXT NOT NULL,
  recipient_email           TEXT,
  reason_for_referral       TEXT NOT NULL,
  ai_draft                  TEXT,
  approved_content          TEXT,
  diagnosis_codes           JSONB NOT NULL DEFAULT '[]',
  interventions_summary     TEXT,
  evolution_summary         TEXT,
  recommendations           TEXT,
  pdf_url                   TEXT,
  email_sent_at             TIMESTAMPTZ,
  patient_acknowledged_at   TIMESTAMPTZ,
  status                    TEXT NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','approved','sent','acknowledged')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE referral_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_by_psychologist"
  ON referral_reports FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- ============================================================
-- BASE DE CONOCIMIENTO — DOCUMENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id   UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  author            TEXT,
  category          TEXT,
  file_url          TEXT NOT NULL,
  file_size_bytes   BIGINT,
  processing_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (processing_status IN ('pending','processing','ready','error')),
  chunk_count       INT DEFAULT 0,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_by_psychologist"
  ON knowledge_documents FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- ============================================================
-- BASE DE CONOCIMIENTO — CHUNKS + EMBEDDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  page_number     INT,
  embedding       vector(1536)
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chunks_by_psychologist"
  ON document_chunks FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_chunks_psychologist ON document_chunks(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- CASOS CLÍNICOS
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_cases (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id      UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id           UUID REFERENCES patients(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  diagnosis_explored   JSONB NOT NULL DEFAULT '[]',
  interventions_used   JSONB NOT NULL DEFAULT '[]',
  outcome              TEXT NOT NULL CHECK (outcome IN ('successful','partial','failed')),
  sessions_count       INT DEFAULT 0,
  embedding            vector(1536),
  is_indexed           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_by_psychologist"
  ON clinical_cases FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_cases_psychologist ON clinical_cases(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_cases_embedding
  ON clinical_cases USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ============================================================
-- AGENDA — DISPONIBILIDAD
-- ============================================================
CREATE TABLE IF NOT EXISTS availability (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id          UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  day_of_week              INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time               TIME NOT NULL,
  end_time                 TIME NOT NULL,
  session_duration_minutes INT NOT NULL DEFAULT 50,
  buffer_minutes           INT NOT NULL DEFAULT 10,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_by_psychologist"
  ON availability FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- ============================================================
-- AGENDA — CITAS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id          UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id               UUID REFERENCES patients(id) ON DELETE SET NULL,
  scheduled_at             TIMESTAMPTZ NOT NULL,
  duration_minutes         INT NOT NULL DEFAULT 50,
  mode                     TEXT NOT NULL DEFAULT 'presential' CHECK (mode IN ('presential','virtual')),
  meeting_url              TEXT,
  status                   TEXT NOT NULL DEFAULT 'requested'
                           CHECK (status IN ('requested','confirmed','completed','cancelled','no_show')),
  requested_by             TEXT NOT NULL DEFAULT 'psychologist' CHECK (requested_by IN ('patient','psychologist')),
  confirmation_token       TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  cancellation_reason      TEXT,
  google_calendar_event_id TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_by_psychologist"
  ON appointments FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(psychologist_id, scheduled_at);

-- ============================================================
-- AUDITORÍA (Ley 1581)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo el psicólogo puede leer sus propios logs, nunca modificar
CREATE POLICY "audit_select_own"
  ON audit_logs FOR SELECT
  USING (auth.uid() = psychologist_id);

CREATE POLICY "audit_insert_own"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_audit_psychologist ON audit_logs(psychologist_id, created_at DESC);

-- ============================================================
-- SOLICITUDES DE ELIMINACIÓN (Derecho al olvido)
-- ============================================================
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  items_deleted   JSONB DEFAULT '{}'
);

ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletions_by_psychologist"
  ON data_deletion_requests FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

-- ============================================================
-- FUNCIÓN: Búsqueda semántica en biblioteca
-- ============================================================
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  psychologist_uuid UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  page_number INT,
  similarity FLOAT,
  document_title TEXT,
  document_author TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.page_number,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    kd.title AS document_title,
    kd.author AS document_author
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  WHERE dc.psychologist_id = psychologist_uuid
    AND kd.processing_status = 'ready'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- FUNCIÓN: Búsqueda semántica en casos exitosos
-- ============================================================
CREATE OR REPLACE FUNCTION search_cases(
  query_embedding vector(1536),
  psychologist_uuid UUID,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  outcome TEXT,
  interventions_used JSONB,
  sessions_count INT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.title,
    cc.description,
    cc.outcome,
    cc.interventions_used,
    cc.sessions_count,
    1 - (cc.embedding <=> query_embedding) AS similarity
  FROM clinical_cases cc
  WHERE cc.psychologist_id = psychologist_uuid
    AND cc.is_indexed = TRUE
    AND cc.outcome IN ('successful', 'partial')
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
