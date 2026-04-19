-- ============================================================
-- Mentezer — Sistema de grupos de conocimiento clínico
-- Fecha: 2026-04-18
-- Sprint A del KNOWLEDGE_SYSTEM.md
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. GRUPOS DE CONOCIMIENTO BASE (sistema)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS knowledge_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  color       text NOT NULL DEFAULT '#3B6FA0',
  book_count  int DEFAULT 0,
  is_system   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE knowledge_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_groups_select_all"
  ON knowledge_groups FOR SELECT
  USING (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. GRUPOS PERSONALES (creados por IA cuando no hay match)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS personal_knowledge_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  label           text NOT NULL,
  description     text,
  document_count  int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE personal_knowledge_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_groups_own"
  ON personal_knowledge_groups FOR ALL
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. SELECCIÓN DE GRUPOS POR PSICÓLOGO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS psychologist_knowledge_groups (
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  group_id        uuid REFERENCES knowledge_groups(id) ON DELETE CASCADE,
  is_active       boolean DEFAULT true,
  activated_at    timestamptz DEFAULT now(),
  PRIMARY KEY (psychologist_id, group_id)
);

ALTER TABLE psychologist_knowledge_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psychologist_knowledge_groups_own"
  ON psychologist_knowledge_groups FOR ALL
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. COLUMNAS NUEVAS EN knowledge_documents
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS group_id          uuid REFERENCES knowledge_groups(id),
  ADD COLUMN IF NOT EXISTS personal_group_id uuid REFERENCES personal_knowledge_groups(id),
  ADD COLUMN IF NOT EXISTS source_type       text NOT NULL DEFAULT 'personal'
    CHECK (source_type IN ('system', 'personal')),
  ADD COLUMN IF NOT EXISTS ai_classification jsonb,
  ADD COLUMN IF NOT EXISTS personal_label    text;

-- Los documentos del sistema tienen psychologist_id NULL
ALTER TABLE knowledge_documents
  ALTER COLUMN psychologist_id DROP NOT NULL;

-- Índices para búsquedas por grupo
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_group    ON knowledge_documents(group_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source   ON knowledge_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_psych_src ON knowledge_documents(psychologist_id, source_type);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. ACTUALIZAR POLICY DE knowledge_documents
--    Documentos sistema (psychologist_id IS NULL) son legibles por todos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROP POLICY IF EXISTS "documents_by_psychologist" ON knowledge_documents;

CREATE POLICY "documents_select"
  ON knowledge_documents FOR SELECT
  USING (
    psychologist_id IS NULL
    OR auth.uid() = psychologist_id
  );

CREATE POLICY "documents_insert"
  ON knowledge_documents FOR INSERT
  WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "documents_update"
  ON knowledge_documents FOR UPDATE
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE POLICY "documents_delete"
  ON knowledge_documents FOR DELETE
  USING (auth.uid() = psychologist_id);

-- Igual para document_chunks: chunks del sistema son legibles
DROP POLICY IF EXISTS "chunks_by_psychologist" ON document_chunks;

CREATE POLICY "chunks_select"
  ON document_chunks FOR SELECT
  USING (
    psychologist_id IS NULL
    OR auth.uid() = psychologist_id
  );

CREATE POLICY "chunks_insert"
  ON document_chunks FOR INSERT
  WITH CHECK (
    psychologist_id IS NULL
    OR auth.uid() = psychologist_id
  );

CREATE POLICY "chunks_delete"
  ON document_chunks FOR DELETE
  USING (auth.uid() = psychologist_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. FUNCIONES PGVECTOR PARA BÚSQUEDA EN DOS CAPAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Busca en grupos BASE activos del psicólogo
CREATE OR REPLACE FUNCTION search_knowledge_by_groups(
  query_embedding vector(1536),
  active_group_ids uuid[],
  match_count int DEFAULT 5
)
RETURNS TABLE (
  content        text,
  page_number    int,
  document_title text,
  author         text,
  group_name     text,
  source_type    text,
  similarity     float
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.content,
    dc.page_number,
    kd.title        AS document_title,
    kd.author,
    kg.name         AS group_name,
    kd.source_type,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  JOIN knowledge_groups    kg ON kg.id = kd.group_id
  WHERE kd.group_id = ANY(active_group_ids)
    AND kd.processing_status = 'ready'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Busca en BIBLIOTECA PERSONAL de un psicólogo
CREATE OR REPLACE FUNCTION search_personal_knowledge(
  query_embedding        vector(1536),
  psychologist_id_filter uuid,
  match_count            int DEFAULT 3
)
RETURNS TABLE (
  content        text,
  page_number    int,
  document_title text,
  personal_label text,
  source_type    text,
  similarity     float
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.content,
    dc.page_number,
    kd.title        AS document_title,
    kd.personal_label,
    kd.source_type,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  WHERE kd.psychologist_id = psychologist_id_filter
    AND kd.source_type      = 'personal'
    AND kd.processing_status = 'ready'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Incrementa el contador de libros de un grupo
CREATE OR REPLACE FUNCTION increment_group_book_count(gid uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE knowledge_groups SET book_count = book_count + 1 WHERE id = gid;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. SEED — 8 GRUPOS BASE DEL SISTEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO knowledge_groups (slug, name, description, color, is_system)
VALUES
  ('cbt',           'Cognitivo-conductual (TCC)',       'Beck, Burns, Ellis, Linehan. Protocolos basados en evidencia para ansiedad, depresión, trastornos de personalidad. Incluye DBT, ACT y terapias de tercera ola.',                  '#3B6FA0', true),
  ('psicoanalitico','Psicodinámico / Psicoanalítico',   'Freud, Winnicott, Kernberg, Bowlby, Lacan. Inconsciente, mecanismos de defensa, apego, relaciones objetales, transferencia.',                                                      '#534AB7', true),
  ('humanista',     'Humanista / Existencial',          'Rogers, Maslow, Frankl, Yalom, Perls. Autorrealización, sentido de vida, Gestalt, relación terapéutica centrada en la persona.',                                                   '#4A7C59', true),
  ('sistemica',     'Sistémica / Familiar',             'Minuchin, Satir, Haley, Bowen. Dinámicas familiares, comunicación, roles sistémicos, terapia de pareja y familia.',                                                                '#0F6E56', true),
  ('trauma',        'Trauma / EMDR / Somática',         'Van der Kolk, Shapiro, Levine. Trauma complejo, PTSD, EMDR, procesamiento somático, teoría polivagal, regulación del sistema nervioso.',                                           '#B07D3A', true),
  ('neuropsico',    'Neuropsicología / Evaluación',     'Luria, Baddeley, DSM-5, CIE-11. Evaluación cognitiva, neuropsicología clínica, diagnóstico diferencial, pruebas psicométricas.',                                                   '#993C1D', true),
  ('infanto',       'Psicología infanto-juvenil',       'Piaget, Vygotsky, Winnicott. Desarrollo infantil, psicopatología del desarrollo, terapia de juego, adolescencia.',                                                                  '#3B6D11', true),
  ('positiva',      'Psicología positiva / Mindfulness','Seligman, Kabat-Zinn, Neff. Bienestar, fortalezas, autocompasión, atención plena basada en evidencia (MBSR, MBCT).',                                                               '#185FA5', true)
ON CONFLICT (slug) DO NOTHING;
