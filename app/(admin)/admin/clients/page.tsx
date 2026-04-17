import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_MAP = {
  active:    { label: "Activo",     color: "bg-psy-green-light text-psy-green", icon: CheckCircle },
  pending:   { label: "Pendiente",  color: "bg-psy-amber-light text-psy-amber", icon: Clock },
  suspended: { label: "Suspendido", color: "bg-psy-red-light text-psy-red",     icon: XCircle },
} as const;

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("psychologists")
    .select("id, name, email, plan, account_status, specialty, country, created_at, trial_ends_at")
    .neq("is_platform_admin", true)
    .order("created_at", { ascending: false });

  // Obtener integraciones activas por cliente
  const clientIds = clients?.map(c => c.id) ?? [];
  const { data: integrations } = clientIds.length > 0
    ? await supabase
        .from("psychologist_integrations")
        .select("psychologist_id, provider")
        .in("psychologist_id", clientIds)
        .eq("is_active", true)
    : { data: [] };

  const integrationsByClient = (integrations ?? []).reduce<Record<string, string[]>>((acc, i) => {
    if (!acc[i.psychologist_id]) acc[i.psychologist_id] = [];
    acc[i.psychologist_id].push(i.provider);
    return acc;
  }, {});

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Clientes</h1>
          <p className="text-sm text-psy-muted mt-1">
            {clients?.length ?? 0} psicólogos registrados en la plataforma.
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
        >
          <Plus size={14} />
          Nuevo cliente
        </Link>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-psy-paper border border-psy-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-psy-border bg-psy-cream">
                {["Psicólogo", "Plan", "Estado", "Integraciones", "Registro", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-psy-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-psy-border">
              {clients?.map((client) => {
                const status = STATUS_MAP[client.account_status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
                const StatusIcon = status.icon;
                const clientIntegrations = integrationsByClient[client.id] ?? [];
                const trialLeft = client.trial_ends_at
                  ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
                  : null;

                return (
                  <tr key={client.id} className="hover:bg-psy-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-psy-blue-light flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-psy-blue">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-psy-ink">{client.name}</p>
                          <p className="text-xs text-psy-muted">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="capitalize text-psy-ink">{client.plan}</span>
                        {trialLeft !== null && client.plan === "trial" && (
                          <p className={`text-[10px] font-mono mt-0.5 ${trialLeft <= 3 ? "text-psy-red" : "text-psy-muted"}`}>
                            {trialLeft}d restantes
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {clientIntegrations.length === 0 ? (
                          <span className="text-xs text-psy-muted">Sin configurar</span>
                        ) : clientIntegrations.map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 bg-psy-blue-light text-psy-blue rounded font-mono">
                            {p.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-psy-muted font-mono">
                      {new Date(client.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-xs text-psy-blue hover:underline"
                      >
                        Gestionar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!clients || clients.length === 0) && (
            <div className="py-16 text-center">
              <p className="text-sm text-psy-muted">Sin clientes registrados aún.</p>
              <Link href="/admin/clients/new" className="mt-3 inline-block text-sm text-psy-blue hover:underline">
                Crear el primer cliente
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
