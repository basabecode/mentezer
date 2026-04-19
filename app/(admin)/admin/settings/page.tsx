import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("psychologists")
    .select("is_platform_admin")
    .eq("id", user?.id!)
    .single();

  if (!admin?.is_platform_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-psy-ink mb-2">Configuración de Plataforma</h1>
      <p className="text-psy-muted mb-8">Gestiona la configuración global de MENTEZER</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <h2 className="font-semibold text-lg text-psy-ink mb-2">Email</h2>
          <p className="text-sm text-psy-muted mb-4">Configuración de notificaciones por email</p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue/10 text-psy-blue text-sm font-medium border border-psy-blue/20 cursor-not-allowed opacity-60">
            En desarrollo
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <h2 className="font-semibold text-lg text-psy-ink mb-2">Auditoría</h2>
          <p className="text-sm text-psy-muted mb-4">Logs de actividad del sistema</p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue/10 text-psy-blue text-sm font-medium border border-psy-blue/20 cursor-not-allowed opacity-60">
            En desarrollo
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <h2 className="font-semibold text-lg text-psy-ink mb-2">APIs</h2>
          <p className="text-sm text-psy-muted mb-4">Gestión de integraciones externas</p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue/10 text-psy-blue text-sm font-medium border border-psy-blue/20 cursor-not-allowed opacity-60">
            En desarrollo
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <h2 className="font-semibold text-lg text-psy-ink mb-2">Seguridad</h2>
          <p className="text-sm text-psy-muted mb-4">Políticas de seguridad y compliance</p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue/10 text-psy-blue text-sm font-medium border border-psy-blue/20 cursor-not-allowed opacity-60">
            En desarrollo
          </button>
        </div>
      </div>
    </div>
  );
}
