-- ============================================================
-- Sprint 3: Pagos y Recordatorios WhatsApp
-- Fecha: 2026-04-19
-- Incluye: tabla payments, reminder_logs, procedimiento de recordatorios
-- ============================================================

-- ============================================================
-- PAGOS (Panel financiero básico)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id       UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  session_id            UUID REFERENCES sessions(id) ON DELETE SET NULL,
  patient_id            UUID REFERENCES patients(id) ON DELETE SET NULL,
  amount_usd            DECIMAL(10, 2) NOT NULL,
  payment_method        TEXT NOT NULL CHECK (payment_method IN ('cash','transfer','nequi','daviplata','card','waived')),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  notes                 TEXT,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_by_psychologist"
  ON payments FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_payments_psychologist ON payments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(psychologist_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(psychologist_id, created_at DESC);

-- ============================================================
-- REGISTRO DE RECORDATORIOS (para evitar duplicados)
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_reminder_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id       UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  appointment_id        UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reminder_type         TEXT NOT NULL CHECK (reminder_type IN ('24h','1h')),
  sent_at               TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_logs_by_psychologist"
  ON whatsapp_reminder_logs FOR ALL
  USING (auth.uid() = psychologist_id)
  WITH CHECK (auth.uid() = psychologist_id);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_appointment ON whatsapp_reminder_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON whatsapp_reminder_logs(psychologist_id, status);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_created ON whatsapp_reminder_logs(created_at DESC);

-- Índice para detectar si ya existe recordatorio enviado (evitar duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminder_logs_unique
  ON whatsapp_reminder_logs(appointment_id, reminder_type)
  WHERE status = 'sent';

-- ============================================================
-- FUNCIÓN: Obtener próximos recordatorios a enviar
-- ============================================================
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
  reminder_id UUID,
  psychologist_id UUID,
  appointment_id UUID,
  patient_id UUID,
  patient_phone TEXT,
  appointment_time TIMESTAMPTZ,
  reminder_type TEXT,
  patient_name TEXT,
  psychologist_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Recordatorios de 24h
  SELECT
    rl.id,
    rl.psychologist_id,
    rl.appointment_id,
    rl.patient_id,
    p.contact_phone,
    a.scheduled_at,
    rl.reminder_type,
    p.name,
    ps.name
  FROM whatsapp_reminder_logs rl
  JOIN appointments a ON rl.appointment_id = a.id
  JOIN patients p ON rl.patient_id = p.id
  JOIN psychologists ps ON rl.psychologist_id = ps.id
  WHERE rl.status = 'pending'
    AND rl.reminder_type = '24h'
    AND a.scheduled_at > now()
    AND a.scheduled_at <= now() + interval '24 hours 30 minutes'
    AND a.scheduled_at >= now() + interval '23 hours 30 minutes'
    AND a.status = 'confirmed'
    AND p.contact_phone IS NOT NULL

  UNION ALL

  -- Recordatorios de 1h
  SELECT
    rl.id,
    rl.psychologist_id,
    rl.appointment_id,
    rl.patient_id,
    p.contact_phone,
    a.scheduled_at,
    rl.reminder_type,
    p.name,
    ps.name
  FROM whatsapp_reminder_logs rl
  JOIN appointments a ON rl.appointment_id = a.id
  JOIN patients p ON rl.patient_id = p.id
  JOIN psychologists ps ON rl.psychologist_id = ps.id
  WHERE rl.status = 'pending'
    AND rl.reminder_type = '1h'
    AND a.scheduled_at > now()
    AND a.scheduled_at <= now() + interval '1 hour 30 minutes'
    AND a.scheduled_at >= now() + interval '30 minutes'
    AND a.status = 'confirmed'
    AND p.contact_phone IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- FUNCIÓN: Crear logs de recordatorios para próximas 48h
-- Se ejecuta al crear/confirmar appointment
-- ============================================================
CREATE OR REPLACE FUNCTION create_reminder_logs_for_appointment(
  p_appointment_id UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO whatsapp_reminder_logs (
    psychologist_id, appointment_id, patient_id, reminder_type, status
  )
  SELECT
    a.psychologist_id,
    a.id,
    a.patient_id,
    reminder_type,
    'pending'
  FROM appointments a
  CROSS JOIN (SELECT '24h'::TEXT AS reminder_type UNION SELECT '1h') AS reminders
  WHERE a.id = p_appointment_id
    AND a.status = 'confirmed'
    AND a.scheduled_at > now()
  ON CONFLICT (appointment_id, reminder_type) WHERE (status = 'sent') DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Al confirmar appointment, crear logs de recordatorios
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_create_reminders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    PERFORM create_reminder_logs_for_appointment(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_reminders ON appointments;
CREATE TRIGGER trg_create_reminders
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_reminders();
