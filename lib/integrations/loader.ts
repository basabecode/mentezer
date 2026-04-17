import { createClient } from "@/lib/supabase/server";
import { decryptJSON } from "./crypto";

export type IntegrationProvider =
  | "google_calendar"
  | "email_resend"
  | "email_smtp"
  | "whatsapp_twilio"
  | "whatsapp_meta"
  | "telegram";

// Shapes de credenciales por proveedor
export interface GoogleCalendarCreds {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  calendar_id?: string;
}

export interface EmailResendCreds {
  api_key: string;
  from_email: string;
  from_name: string;
}

export interface EmailSmtpCreds {
  host: string;
  port: number;
  user: string;
  password: string;
  from_email: string;
  from_name: string;
}

export interface WhatsAppTwilioCreds {
  account_sid: string;
  auth_token: string;
  whatsapp_number: string; // formato: whatsapp:+57300...
}

export interface WhatsAppMetaCreds {
  access_token: string;
  phone_number_id: string;
  business_account_id: string;
  verify_token: string;
}

export interface TelegramCreds {
  bot_token: string;
  bot_username: string;
  webhook_secret?: string;
}

type CredsByProvider = {
  google_calendar: GoogleCalendarCreds;
  email_resend: EmailResendCreds;
  email_smtp: EmailSmtpCreds;
  whatsapp_twilio: WhatsAppTwilioCreds;
  whatsapp_meta: WhatsAppMetaCreds;
  telegram: TelegramCreds;
};

export async function getIntegration<P extends IntegrationProvider>(
  psychologistId: string,
  provider: P
): Promise<CredsByProvider[P] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("psychologist_integrations")
    .select("credentials_enc, is_active")
    .eq("psychologist_id", psychologistId)
    .eq("provider", provider)
    .eq("is_active", true)
    .single();

  if (error || !data?.credentials_enc) return null;

  try {
    return decryptJSON<CredsByProvider[P]>(data.credentials_enc);
  } catch {
    console.error(`Error descifrando credenciales de ${provider} para ${psychologistId}`);
    return null;
  }
}

export async function getActiveIntegrations(psychologistId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("psychologist_integrations")
    .select("provider, display_name, is_active, last_verified_at, configured_at")
    .eq("psychologist_id", psychologistId)
    .order("provider");

  return data ?? [];
}
