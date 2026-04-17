import { createClient } from "@/lib/supabase/server";
import { Calendar, Users, FileText, TrendingUp, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: totalPatients },
    { count: sessionsThisMonth },
    { count: reportsGenerated },
    { data: riskSessions },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .eq("status", "active"),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from("ai_reports")
      .select("*", { count: "exact", head: true })
      .in(
        "session_id",
        (await supabase.from("sessions").select("id").eq("psychologist_id", user!.id)).data?.map((s) => s.id) ?? []
      ),
    supabase
      .from("ai_reports")
      .select("session_id, risk_signals")
      .in(
        "session_id",
        (await supabase.from("sessions").select("id").eq("psychologist_id", user!.id)).data?.map((s) => s.id) ?? []
      )
      .limit(10),
  ]);

  const highRiskCount = (riskSessions ?? []).filter((r) => {
    const signals = r.risk_signals as Array<{ severity: string }>;
    return signals?.some((s) => s.severity === "high");
  }).length;

  return (
    <div className="px-6 py-6 max-w-4xl">
      <h1 className="font-serif text-2xl text-psy-ink font-semibold mb-1">
        Panel clínico
      </h1>
      <p className="text-sm text-psy-muted mb-8">
        Resumen de tu práctica clínica
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Pacientes activos"
          value={totalPatients ?? 0}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="Sesiones este mes"
          value={sessionsThisMonth ?? 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Reportes generados"
          value={reportsGenerated ?? 0}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Señales de riesgo"
          value={highRiskCount}
          color={highRiskCount > 0 ? "red" : "green"}
        />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="font-serif text-base text-psy-ink font-semibold mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction
            href="/sessions/new"
            icon={Calendar}
            title="Nueva sesión"
            description="Graba y analiza una sesión"
            color="blue"
          />
          <QuickAction
            href="/patients/new"
            icon={Users}
            title="Nuevo paciente"
            description="Registra un nuevo paciente"
            color="green"
          />
          <QuickAction
            href="/knowledge"
            icon={TrendingUp}
            title="Subir material clínico"
            description="Agrega libros a tu biblioteca"
            color="blue"
          />
          <QuickAction
            href="/reports"
            icon={FileText}
            title="Informe de derivación"
            description="Genera carta de derivación"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue:  { bg: "bg-psy-blue-light",  text: "text-psy-blue",  icon: "text-psy-blue" },
    green: { bg: "bg-psy-green-light", text: "text-psy-green", icon: "text-psy-green" },
    amber: { bg: "bg-psy-amber-light", text: "text-psy-amber", icon: "text-psy-amber" },
    red:   { bg: "bg-psy-red-light",   text: "text-psy-red",   icon: "text-psy-red" },
  };
  const c = colors[color];

  return (
    <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-card)]">
      <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={15} className={c.icon} />
      </div>
      <p className="font-mono text-2xl font-semibold text-psy-ink">{value}</p>
      <p className="text-xs text-psy-muted mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: "blue" | "green";
}) {
  const colors = {
    blue:  { bg: "bg-psy-blue-light", icon: "text-psy-blue" },
    green: { bg: "bg-psy-green-light", icon: "text-psy-green" },
  };
  const c = colors[color];

  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 bg-psy-paper border border-[var(--border)] rounded-xl hover:border-psy-blue/30 hover:shadow-[var(--shadow-card)] transition-all group"
    >
      <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon size={16} className={c.icon} />
      </div>
      <div>
        <p className="text-sm font-medium text-psy-ink">{title}</p>
        <p className="text-xs text-psy-muted mt-0.5">{description}</p>
      </div>
    </a>
  );
}
