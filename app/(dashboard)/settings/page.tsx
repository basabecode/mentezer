import { createClient } from "@/lib/supabase/server";
import { User, Shield, Bell, CreditCard } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: psychologist } = await supabase
    .from("psychologists")
    .select("name, professional_license, specialty, country, plan, trial_ends_at")
    .eq("id", user!.id)
    .single();

  const trialDaysLeft = psychologist?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(psychologist.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="px-6 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-psy-ink font-semibold">Configuración</h1>
        <p className="text-sm text-psy-muted mt-1">Perfil profesional y preferencias de la cuenta.</p>
      </div>

      {/* Plan actual */}
      {trialDaysLeft !== null && (
        <div className={`mb-6 p-4 rounded-xl border ${trialDaysLeft > 5 ? "bg-psy-blue-light border-psy-blue/20" : "bg-psy-amber-light border-psy-amber/20"}`}>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className={trialDaysLeft > 5 ? "text-psy-blue" : "text-psy-amber"} />
            <p className={`text-sm font-medium ${trialDaysLeft > 5 ? "text-psy-blue" : "text-psy-amber"}`}>
              Plan {psychologist?.plan ?? "trial"} — {trialDaysLeft} días restantes
            </p>
          </div>
          <p className="text-xs text-psy-ink/70 mt-1">
            Planes de suscripción disponibles a partir de v2.0 (Starter $29 / Pro $59 / Clinic $149 USD/mes).
          </p>
        </div>
      )}

      {/* Secciones */}
      <div className="space-y-3">
        {/* Perfil profesional */}
        <div className="bg-psy-paper border border-psy-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-psy-muted" />
            <h2 className="text-sm font-semibold text-psy-ink">Perfil profesional</h2>
          </div>
          <dl className="space-y-3">
            {[
              { label: "Nombre completo",    value: psychologist?.name },
              { label: "Tarjeta profesional", value: psychologist?.professional_license },
              { label: "Especialidad",        value: psychologist?.specialty },
              { label: "País",               value: psychologist?.country },
              { label: "Email",              value: user?.email },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex gap-4">
                <dt className="text-xs text-psy-muted w-36 shrink-0">{label}</dt>
                <dd className="text-xs text-psy-ink">{value}</dd>
              </div>
            ) : null)}
          </dl>
          <p className="text-xs text-psy-muted mt-4">
            Edición de perfil disponible en v1.5.
          </p>
        </div>

        {/* Privacidad */}
        <div className="bg-psy-paper border border-psy-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-psy-muted" />
            <h2 className="text-sm font-semibold text-psy-ink">Privacidad y datos</h2>
          </div>
          <p className="text-xs text-psy-muted leading-relaxed mb-3">
            <span className="font-bold text-psy-blue italic">MENTEZER</span> cumple con la Ley 1581 de Colombia. Todos los datos clínicos están cifrados y aislados por profesional mediante Row Level Security (RLS).
          </p>
          <div className="flex gap-4 text-xs">
            <a href="/legal/terms" className="text-psy-blue hover:underline">Términos de uso</a>
            <a href="/legal/privacy" className="text-psy-blue hover:underline">Política de privacidad</a>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-psy-paper border border-psy-border rounded-xl p-5 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-psy-muted" />
            <h2 className="text-sm font-semibold text-psy-ink">Notificaciones — v1.5</h2>
          </div>
          <p className="text-xs text-psy-muted">
            Alertas de riesgo alto, recordatorios de citas y reportes pendientes.
          </p>
        </div>
      </div>
    </div>
  );
}
