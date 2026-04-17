import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Settings } from "lucide-react";
import { IntegrationForm } from "@/components/admin/IntegrationForm";
import { ClientStatusToggle } from "@/components/admin/ClientStatusToggle";

type FieldType = "text" | "password" | "email";

const PROVIDERS: Array<{
  id: "google_calendar" | "email_resend" | "email_smtp" | "whatsapp_twilio" | "whatsapp_meta" | "telegram";
  label: string;
  description: string;
  fields: Array<{ key: string; label: string; type: FieldType; placeholder: string }>;
}> = [
  {
    id: "google_calendar",
    label: "Google Calendar",
    description: "Sincronización de citas con el calendario del psicólogo",
    fields: [
      { key: "client_id",     label: "Client ID",      type: "text",     placeholder: "xxx.apps.googleusercontent.com" },
      { key: "client_secret", label: "Client Secret",  type: "password", placeholder: "GOCSPX-..." },
      { key: "access_token",  label: "Access Token",   type: "password", placeholder: "ya29.a0..." },
      { key: "refresh_token", label: "Refresh Token",  type: "password", placeholder: "1//0g..." },
      { key: "calendar_id",   label: "Calendar ID",    type: "text",     placeholder: "primary o correo@gmail.com" },
    ],
  },
  {
    id: "email_resend",
    label: "Email (Resend)",
    description: "Envío de confirmaciones y recordatorios desde el dominio del psicólogo",
    fields: [
      { key: "api_key",    label: "Resend API Key",   type: "password", placeholder: "re_..." },
      { key: "from_email", label: "Email remitente",  type: "email",    placeholder: "citas@clinica.com" },
      { key: "from_name",  label: "Nombre remitente", type: "text",     placeholder: "Consultorio Dra. Laura" },
    ],
  },
  {
    id: "whatsapp_twilio",
    label: "WhatsApp (Twilio)",
    description: "Bot de WhatsApp para agendar citas y enviar recordatorios",
    fields: [
      { key: "account_sid",     label: "Account SID",     type: "text",     placeholder: "ACxxxxxxxxxxxxxxxx" },
      { key: "auth_token",      label: "Auth Token",      type: "password", placeholder: "xxxxxxxxxxxxxxxx" },
      { key: "whatsapp_number", label: "Número WhatsApp", type: "text",     placeholder: "whatsapp:+573001234567" },
    ],
  },
  {
    id: "whatsapp_meta",
    label: "WhatsApp (Meta Business API)",
    description: "Integración directa con la API oficial de WhatsApp Business",
    fields: [
      { key: "access_token",        label: "Access Token",           type: "password", placeholder: "EAAxxxxxxx..." },
      { key: "phone_number_id",     label: "Phone Number ID",        type: "text",     placeholder: "1234567890" },
      { key: "business_account_id", label: "Business Account ID",    type: "text",     placeholder: "0987654321" },
      { key: "verify_token",        label: "Verify Token (webhook)", type: "text",     placeholder: "mi_token_secreto" },
    ],
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    description: "Bot de Telegram para agendar citas",
    fields: [
      { key: "bot_token",      label: "Bot Token",        type: "password", placeholder: "1234567890:AAHxxxxxx" },
      { key: "bot_username",   label: "Username del bot", type: "text",     placeholder: "@ClinicaLauraBot" },
      { key: "webhook_secret", label: "Webhook Secret",   type: "password", placeholder: "secreto_para_validar_webhook" },
    ],
  },
];

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("psychologists")
    .select("is_platform_admin")
    .eq("id", user!.id)
    .single();
  if (!admin?.is_platform_admin) notFound();

  const adminSupabase = createAdminClient();

  const [{ data: client }, { data: integrations }, { count: patientCount }] = await Promise.all([
    adminSupabase
      .from("psychologists")
      .select("id, name, email, plan, account_status, specialty, country, professional_license, created_at, trial_ends_at")
      .eq("id", id)
      .single(),
    adminSupabase
      .from("psychologist_integrations")
      .select("provider, display_name, is_active, configured_at, last_verified_at")
      .eq("psychologist_id", id),
    adminSupabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", id),
  ]);

  if (!client) notFound();

  const activeProviders = new Set((integrations ?? []).filter(i => i.is_active).map(i => i.provider));
  const trialLeft = client.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clients" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-xl text-psy-ink font-semibold">{client.name}</h1>
          <p className="text-xs text-psy-muted mt-0.5">{client.email} · {client.specialty ?? "Sin especialidad"}</p>
        </div>
        <ClientStatusToggle
          psychologistId={id}
          currentStatus={client.account_status as "active" | "suspended" | "pending"}
        />
      </div>

      {/* Info del cliente */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Plan", value: client.plan },
          { label: "Estado", value: client.account_status },
          { label: "Pacientes", value: patientCount ?? 0 },
          { label: "Trial restante", value: trialLeft !== null ? `${trialLeft}d` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-xl p-3">
            <p className="text-xs text-psy-muted mb-1">{label}</p>
            <p className="text-sm font-semibold text-psy-ink capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Integraciones */}
      <div className="space-y-3">
        <h2 className="font-serif text-sm font-semibold text-psy-ink">Integraciones</h2>
        <p className="text-xs text-psy-muted">
          Las credenciales se cifran con AES-256 y solo se usan en el servidor. Nunca se exponen al cliente.
        </p>

        {PROVIDERS.map((provider) => {
          const isConfigured = activeProviders.has(provider.id);
          const integration = integrations?.find(i => i.provider === provider.id);

          return (
            <div key={provider.id} className="bg-psy-paper border border-psy-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-psy-border">
                <div className="flex items-center gap-3">
                  {isConfigured
                    ? <CheckCircle size={14} className="text-psy-green" />
                    : <XCircle size={14} className="text-psy-muted" />
                  }
                  <div>
                    <p className="text-sm font-medium text-psy-ink">{provider.label}</p>
                    <p className="text-xs text-psy-muted">{provider.description}</p>
                  </div>
                </div>
                {isConfigured && (
                  <span className="text-[10px] text-psy-muted font-mono">
                    Configurado {integration?.configured_at
                      ? new Date(integration.configured_at).toLocaleDateString("es-CO")
                      : ""}
                  </span>
                )}
              </div>

              {/* Formulario colapsable */}
              <div className="px-4 py-4">
                <IntegrationForm
                  psychologistId={id}
                  provider={provider.id}
                  fields={provider.fields}
                  isConfigured={isConfigured}
                  displayName={integration?.display_name ?? ""}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
