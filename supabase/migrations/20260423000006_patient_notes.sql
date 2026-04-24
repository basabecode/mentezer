-- Notas clínicas del psicólogo sobre cada paciente
-- Visibles en la ficha del paciente y durante sesiones activas

CREATE TABLE patient_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  content       TEXT NOT NULL CHECK (char_length(content) >= 2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_notes_select_own"
  ON patient_notes FOR SELECT
  USING (
    psychologist_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM patients
      WHERE patients.id = patient_notes.patient_id
        AND patients.psychologist_id = auth.uid()
    )
  );

CREATE POLICY "patient_notes_insert_own"
  ON patient_notes FOR INSERT
  WITH CHECK (
    psychologist_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM patients
      WHERE patients.id = patient_notes.patient_id
        AND patients.psychologist_id = auth.uid()
    )
  );

CREATE POLICY "patient_notes_update_own"
  ON patient_notes FOR UPDATE
  USING (
    psychologist_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM patients
      WHERE patients.id = patient_notes.patient_id
        AND patients.psychologist_id = auth.uid()
    )
  )
  WITH CHECK (
    psychologist_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM patients
      WHERE patients.id = patient_notes.patient_id
        AND patients.psychologist_id = auth.uid()
    )
  );

CREATE POLICY "patient_notes_delete_own"
  ON patient_notes FOR DELETE
  USING (
    psychologist_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM patients
      WHERE patients.id = patient_notes.patient_id
        AND patients.psychologist_id = auth.uid()
    )
  );

CREATE INDEX patient_notes_patient_idx ON patient_notes (patient_id, created_at DESC);
CREATE INDEX patient_notes_psychologist_patient_idx
  ON patient_notes (psychologist_id, patient_id, created_at DESC);
