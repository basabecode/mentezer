import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, AlertTriangle, TrendingUp, Brain } from "lucide-react";

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
    <div className="px-6 py-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Informes IA</h1>
          <p className="text-sm text-psy-muted mt-1">
            Análisis clínicos generados por IA para cada sesión.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total informes", value: reports?.length ?? 0, icon: FileText, color: "text-psy-blue" },
          { label: "Con riesgo alto", value: highRiskCount, icon: AlertTriangle, color: "text-psy-red" },
          { label: "Esta semana", value: reports?.filter(r => {
              const d = new Date(r.generated_at);
              const now = new Date();
              const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              return diff <= 7;
            }).length ?? 0, icon: TrendingUp, color: "text-psy-green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-xs text-psy-muted">{label}</span>
            </div>
            <p className="font-mono text-xl font-semibold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de informes */}
      {reports && reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((report) => {
            const riskSignals = Array.isArray(report.risk_signals)
              ? (report.risk_signals as Array<{ severity: string }>)
              : [];
            const hasHighRisk = riskSignals.some(s => s.severity === "high");
            const hasMediumRisk = riskSignals.some(s => s.severity === "medium");
            const patientName = report.patientName;

            return (
              <Link
                key={report.id}
                href={`/sessions/${report.session_id}`}
                className="flex items-start gap-4 p-4 bg-psy-paper border border-psy-border rounded-xl hover:bg-psy-cream transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  hasHighRisk ? "bg-psy-red-light" : hasMediumRisk ? "bg-psy-amber-light" : "bg-psy-blue-light"
                }`}>
                  <Brain size={14} className={hasHighRisk ? "text-psy-red" : hasMediumRisk ? "text-psy-amber" : "text-psy-blue"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-psy-ink">{patientName}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasHighRisk && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-psy-red-light text-psy-red font-medium">
                          Riesgo alto
                        </span>
                      )}
                      <span className="text-xs text-psy-muted font-mono">
                        {new Date(report.generated_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-psy-muted line-clamp-2 leading-relaxed">{report.summary}</p>
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
