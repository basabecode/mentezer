import { FileText, AlertTriangle, TrendingUp, Brain, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener sesiones del psicólogo y luego sus reportes
  const { data: sessionIds } = await supabase
    .from("sessions")
    .select("id, patient_id, patients(name)")
    .eq("psychologist_id", user!.id);

  const ids = sessionIds?.map(s => s.id) ?? [];

  const { data: rawReports } = ids.length > 0 ? await supabase
    .from("ai_reports")
    .select("id, summary, risk_signals, generated_at, session_id")
    .in("session_id", ids)
    .order("generated_at", { ascending: false })
    .limit(50) : { data: [] };

  // Combinar con nombres de pacientes
  const patientBySession = Object.fromEntries(
    (sessionIds ?? []).map(s => [s.id, (s.patients as unknown as { name: string } | null)?.name ?? "Paciente"])
  );

  const reports = (rawReports ?? []).map(r => ({
    ...r,
    patientName: patientBySession[r.session_id] ?? "Paciente",
  }));

  const highRiskCount = reports?.filter(r =>
    Array.isArray(r.risk_signals) &&
    (r.risk_signals as Array<{ severity: string }>).some(s => s.severity === "high")
  ).length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="mt-6">
          <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Informes de IA</h1>
          <p className="text-base text-psy-ink/60 mt-2">
            Análisis generados automáticamente para facilitar el seguimiento clínico.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total informes", value: reports?.length ?? 0, icon: FileText, color: "text-psy-blue", bg: "bg-psy-blue/5" },
          { label: "Alertas graves", value: highRiskCount, icon: AlertTriangle, color: "text-psy-red", bg: "bg-psy-red/5" },
          { label: "Siete días", value: reports?.filter(r => {
              const d = new Date(r.generated_at);
              const now = new Date();
              const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              return diff <= 7;
            }).length ?? 0, icon: TrendingUp, color: "text-psy-green", bg: "bg-psy-green/5" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-psy-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bg, color)}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-psy-muted">{label}</span>
            </div>
            <p className="font-sora text-3xl font-bold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de informes */}
      {reports && reports.length > 0 ? (
      <div className="grid gap-3">
        {reports.map((report) => {
          const riskSignals = Array.isArray(report.risk_signals) ? (report.risk_signals as Array<{ severity: string }>) : [];
          const hasHighRisk = riskSignals.some(s => s.severity === "high");
          
          return (
            <Link
              key={report.id}
              href={`/sessions/${report.session_id}`}
              className="group flex items-center gap-5 p-5 bg-white border border-psy-border rounded-[1.5rem] hover:border-psy-blue/30 shadow-sm hover:shadow-xl transition-all"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                hasHighRisk ? "bg-psy-red/5 text-psy-red shadow-sm" : "bg-psy-blue/5 text-psy-blue shadow-sm"
              )}>
                <Brain size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="text-base font-bold text-psy-ink truncate">{report.patientName}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-psy-muted bg-psy-cream px-3 py-1 rounded-full">
                    <Calendar size={12} />
                    {new Date(report.generated_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <p className="text-xs text-psy-ink/50 line-clamp-1 italic">"{report.summary}"</p>
                {hasHighRisk && (
                  <div className="mt-2 flex">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-psy-red text-white">Alerta de Riesgo détectada</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-psy-blue-light flex items-center justify-center mb-4">
            <Brain size={24} className="text-psy-blue" />
          </div>
          <h2 className="font-serif text-lg text-psy-ink font-semibold mb-2">Sin informes aún</h2>
          <p className="text-sm text-psy-muted max-w-sm leading-relaxed mb-6">
            Los informes IA se generan tras analizar una sesión transcrita. Ve a una sesión y presiona Analizar.
          </p>
          <Link
            href="/sessions/new"
            className="px-5 py-2.5 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
          >
            Nueva sesión
          </Link>
        </div>
      )}
    </div>
  );
}
