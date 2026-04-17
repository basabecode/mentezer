import { createClient } from "@/lib/supabase/server";
import { Users, Activity, Wifi, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: activeClients },
    { count: trialClients },
    { data: recentClients },
  ] = await Promise.all([
    supabase.from("psychologists").select("*", { count: "exact", head: true }).neq("is_platform_admin", true),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("account_status", "active").neq("is_platform_admin", true),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("plan", "trial").neq("is_platform_admin", true),
    supabase.from("psychologists")
      .select("id, name, email, plan, account_status, created_at, trial_ends_at")
      .neq("is_platform_admin", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Clientes totales",    value: totalClients  ?? 0, icon: Users,        color: "text-psy-blue" },
    { label: "Cuentas activas",     value: activeClients ?? 0, icon: Activity,     color: "text-psy-green" },
    { label: "En período de trial", value: trialClients  ?? 0, icon: Wifi,         color: "text-psy-amber" },
    { label: "Suspendidos",         value: (totalClients ?? 0) - (activeClients ?? 0), icon: AlertCircle, color: "text-psy-red" },
  ];

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-psy-ink font-semibold">Panel de administración</h1>
        <p className="text-sm text-psy-muted mt-1">Gestión de clientes y estado de la plataforma.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-xs text-psy-muted">{label}</span>
            </div>
            <p className="font-mono text-2xl font-semibold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Clientes recientes */}
      <div className="bg-psy-paper border border-psy-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-sm font-semibold text-psy-ink">Clientes recientes</h2>
          <Link href="/admin/clients" className="text-xs text-psy-blue hover:underline">Ver todos</Link>
        </div>
        <div className="space-y-2">
          {recentClients?.map((c) => {
            const trialLeft = c.trial_ends_at
              ? Math.max(0, Math.ceil((new Date(c.trial_ends_at).getTime() - Date.now()) / 86400000))
              : null;
            return (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-psy-cream transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-psy-blue-light flex items-center justify-center">
                    <span className="text-xs font-bold text-psy-blue">{c.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-psy-ink">{c.name}</p>
                    <p className="text-xs text-psy-muted">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {trialLeft !== null && trialLeft <= 3 && (
                    <span className="text-[10px] px-2 py-0.5 bg-psy-red-light text-psy-red rounded-full">
                      {trialLeft}d trial
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.account_status === "active" ? "bg-psy-green-light text-psy-green" :
                    c.account_status === "pending" ? "bg-psy-amber-light text-psy-amber" :
                    "bg-psy-red-light text-psy-red"
                  }`}>
                    {c.account_status === "active" ? "Activo" : c.account_status === "pending" ? "Pendiente" : "Suspendido"}
                  </span>
                  <span className="text-xs text-psy-muted capitalize">{c.plan}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
