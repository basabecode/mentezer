-- ============================================================
-- PsyAssist — Multi-tenant & Integraciones por psicólogo
-- Fecha: 2026-04-17
-- Incluye: is_platform_admin, psychologist_integrations,
--          messaging_logs, booking_requests actualizada
-- ============================================================

-- ============================================================
-- 1. AGREGAR CAMPO ADMIN A PSYCHOLOGISTS
-- ============================================================
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES psychologists(id),
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active','suspended','pending'));

-- ============================================================
-- 2. INTEGRACIONES POR PSICÓLOGO (credenciales cifradas)
-- ============================================================
-- Las credenciales se almacenan cifradas con AES-256-GCM
-- La clave de cifrado viene de ENCRYPTION_SECRET (env var de plataforma)
-- Nunca se exponen en logs ni en respuestas de API

CREATE TABLE IF NOT EXISTS psychologist_integrations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id  UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL CHECK (provider IN (
                     'google_calendar',
                     'email_resend',
                     'email_smtp',
                     'whatsapp_twilio',
                     'whatsapp_meta',
                     'telegram'
                   )),
  -- Credenciales cifradas (AES-256-GCM) como JSON
  credentials_enc  TEXT NOT NULL DEFAULT '',
  -- Metadatos no sensibles (para mostrar estado)
  display_name     TEXT,         -- ej: "calendario@clinica.com"
  webhook_url      TEXT,         -- URL del webhook de entrada (Telegram, WA)
  is_active        BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,
  configured_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(psychologist_id, provider)
);

ALTER TABLE psychologist_integrations ENABLE ROW LEVEL SECURITY;

-- Solo el psicólogo ve sus propias integraciones
CREATE POLICY "psychologist_integrations_select"
  ON psychologist_integrations FOR SELECT
  USING (auth.uid() = psychologist_id);

-- Solo admins de plataforma pueden insertar/actualizar
CREATE POLICY "psychologist_integrations_insert_admin"
  ON psychologist_integrations FOR INSERT
  WITH CHECK (
    auth.uid() = psychologist_id
    OR EXISTS (
      SELECT 1 FROM psychologists
      WHERE id = auth.uid() AND is_platform_admin = TRUE
    )
  );

CREATE POLICY "psychologist_integrations_update"
  ON psychologist_integrations FOR UPDATE
  USING (
    auth.uid() = psychologist_id
    OR EXISTS (
      SELECT 1 FROM psychologists
      WHERE id = auth.uid() AND is_platform_admin = TRUE
    )
  );

-- ============================================================
-- 3. LOGS DE MENSAJERÍA (WhatsApp / Telegram / Email entrante)
-- ============================================================
CREATE TABLE IF NOT EXISTS messaging_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id  UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  channel          TEXT NOT NULL CHECK (channel IN ('whatsapp','telegram','email')),
  direction        TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  sender_id        TEXT,         -- phone number, telegram user_id, or email
  sender_name      TEXT,
  message_text     TEXT,
  raw_payload      JSONB,        -- payload completo del webhook
  intent           TEXT,         -- 'book_appointment' | 'cancel' | 'info' | 'unknown'
  appointment_id   UUID REFERENCES appointments(id),
  processed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messaging_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messaging_logs_select"
  ON messaging_logs FOR SELECT
  USING (auth.uid() = psychologist_id);

CREATE POLICY "messaging_logs_insert"
  ON messaging_logs FOR INSERT
  WITH CHECK (TRUE); -- los webhooks usan service_role

CREATE INDEX IF NOT EXISTS idx_messaging_logs_psychologist
  ON messaging_logs(psychologist_id, created_at DESC);

-- ============================================================
-- 4. PLANTILLAS DE MENSAJE POR CANAL Y PSICÓLOGO
-- ============================================================
CREATE TABLE IF NOT EXISTS message_templates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychologist_id  UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  channel          TEXT NOT NULL CHECK (channel IN ('whatsapp','telegram','email','all')),
  trigger          TEXT NOT NULL CHECK (trigger IN (
                     'appointment_confirmed',
                     'appointment_reminder_24h',
                     'appointment_cancelled',
                     'booking_received',
                     'booking_rejected',
                     'welcome'
                   )),
  subject          TEXT,         -- solo para email
  body_template    TEXT NOT NULL, -- con variables: {{patient_name}}, {{date}}, {{time}}, {{link}}
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(psychologist_id, channel, trigger)
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_templates_all"
  ON message_templates FOR ALL
  USING (auth.uid() = psychologist_id);

-- ============================================================
-- 5. PLANTILLAS DEFAULT (se insertan al crear el psicólogo)
-- ============================================================
-- Las funciones de trigger crearán plantillas al registrar un psicólogo nuevo

CREATE OR REPLACE FUNCTION create_default_templates()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO message_templates (psychologist_id, channel, trigger, subject, body_template)
  VALUES
    (NEW.id, 'all', 'appointment_confirmed', 'Cita confirmada',
     'Hola {{patient_name}}, tu cita con {{psychologist_name}} está confirmada para el {{date}} a las {{time}}. Si necesitas cambiarla, responde a este mensaje.'),
    (NEW.id, 'all', 'appointment_reminder_24h', 'Recordatorio de cita',
     'Hola {{patient_name}}, te recordamos tu cita mañana {{date}} a las {{time}} con {{psychologist_name}}.'),
    (NEW.id, 'all', 'appointment_cancelled', 'Cita cancelada',
     'Hola {{patient_name}}, tu cita del {{date}} ha sido cancelada. Para reagendar, responde a este mensaje.'),
    (NEW.id, 'all', 'booking_received', NULL,
     'Hola {{patient_name}}, recibimos tu solicitud de cita. Te confirmaremos en las próximas horas.'),
    (NEW.id, 'all', 'welcome', NULL,
     'Bienvenido/a {{patient_name}} al consultorio de {{psychologist_name}}. Estamos aquí para acompañarte.')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_psychologist_created ON psychologists;
CREATE TRIGGER on_psychologist_created
  AFTER INSERT ON psychologists
  FOR EACH ROW EXECUTE FUNCTION create_default_templates();

-- ============================================================
-- 6. ÍNDICES ADICIONALES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_psychologist_integrations_provider
  ON psychologist_integrations(psychologist_id, provider) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_message_templates_lookup
  ON message_templates(psychologist_id, channel, trigger) WHERE is_active = TRUE;
