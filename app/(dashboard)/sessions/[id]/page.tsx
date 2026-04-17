import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Brain, AlertTriangle, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import type { AIReportData } from "@/lib/ai/analysis";
import type { TranscriptSegment } from "@/lib/ai/whisper";
import { AnalyzeButton } from "@/components/analysis/AnalyzeButton";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, patient_id, status, mode, scheduled_at, patients(name, consent_signed_at)")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single();

  if (!session) notFound();

  const patient = session.patients as unknown as { name: string; consent_signed_at: string | null } | null;

  const [{ data: transcript }, { data: report }] = await Promise.all([
    supabase.from("transcripts").select("content, edited_at").eq("session_id", id).single(),
    supabase.from("ai_reports").select("*").eq("session_id", id).single(),
  ]);

  const segments = transcript?.content as TranscriptSegment[] | null;
  const aiReport = report as unknown as AIReportData | null;

  return (
    <div className="px-6 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/patients/${session.patient_id}`}
            className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-xl text-psy-ink font-semibold">
              Sesión — {patient?.name ?? "Paciente"}
            </h1>
            <p className="text-xs text-psy-muted mt-0.5">
              {new Date(session.scheduled_at).toLocaleDateString("es-CO", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })} · {session.mode === "presential" ? "Presencial" : "Virtual"}
            </p>
          </div>
        </div>

        {/* Analizar si hay transcripción pero no hay reporte */}
        {transcript && !report && (
          <AnalyzeButton sessionId={id} />
        )}
      </div>

      {/* Estado de la sesión */}
      {!transcript && (
        <div className="bg-psy-amber-light border border-psy-amber/20 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={15} className="text-psy-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-psy-amber">Sin transcripción aún</p>
            <p className="text-xs text-psy-ink/70 mt-0.5">
              El estado de la sesión es <span className="font-mono">{session.status}</span>. La transcripción aparecerá aquí cuando Whisper finalice el procesamiento.
            </p>
          </div>
        </div>
      )}

      {/* Transcripción */}
      {segments && segments.length > 0 && (
        <div className="bg-psy-paper border border-psy-border rounded-xl p-4 mb-5">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-3">Transcripción</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {segments.map((seg, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-[10px] text-psy-muted shrink-0 mt-0.5 w-10">
                  {Math.floor(seg.start / 60).toString().padStart(2, "0")}:{Math.floor(seg.start % 60).toString().padStart(2, "0")}
                </span>
                <p className="text-xs text-psy-ink leading-relaxed">{seg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informe IA */}
      {aiReport && (
        <div className="space-y-4">
          {/* Disclaimer */}
          <div className="p-3 bg-psy-amber-light border border-psy-amber/20 rounded-lg">
            <p className="text-[10px] text-psy-amber leading-relaxed">{aiReport.disclaimer}</p>
          </div>

          {/* Resumen */}
          <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-psy-blue" />
              <h2 className="font-serif text-sm font-semibold text-psy-ink">Resumen ejecutivo</h2>
            </div>
            <p className="text-xs text-psy-ink leading-relaxed">{aiReport.summary}</p>
          </div>

          {/* Señales de riesgo */}
          {aiReport.risk_signals && aiReport.risk_signals.length > 0 && (
            <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-psy-red" />
                <h2 className="font-serif text-sm font-semibold text-psy-ink">Señales de riesgo</h2>
              </div>
              <div className="space-y-2">
                {aiReport.risk_signals.map((signal, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${
                    signal.severity === "high" ? "bg-psy-red-light border-psy-red/20" :
                    signal.severity === "medium" ? "bg-psy-amber-light border-psy-amber/20" :
                    "bg-psy-paper border-psy-border"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                        signal.severity === "high" ? "text-psy-red" :
                        signal.severity === "medium" ? "text-psy-amber" : "text-psy-muted"
                      }`}>{signal.severity === "high" ? "Alto" : signal.severity === "medium" ? "Medio" : "Bajo"}</span>
                      <span className="text-xs font-medium text-psy-ink">{signal.signal}</span>
                    </div>
                    <p className="text-xs text-psy-muted leading-relaxed">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patrones observados */}
          {aiReport.patterns && aiReport.patterns.length > 0 && (
            <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-psy-blue" />
                <h2 className="font-serif text-sm font-semibold text-psy-ink">Patrones clínicos</h2>
              </div>
              <div className="space-y-3">
                {aiReport.patterns.map((p, i) => (
                  <div key={i} className="pb-3 border-b border-psy-border last:border-0 last:pb-0">
                    <p className="text-xs font-medium text-psy-ink mb-0.5">{p.pattern}</p>
                    <p className="text-xs text-psy-muted leading-relaxed mb-1">{p.evidence}</p>
                    {p.source && (
                      <p className="text-[10px] text-psy-blue font-mono">{p.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias terapéuticas */}
          {aiReport.therapeutic_suggestions && aiReport.therapeutic_suggestions.length > 0 && (
            <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-psy-green" />
                <h2 className="font-serif text-sm font-semibold text-psy-ink">Sugerencias terapéuticas</h2>
              </div>
              <div className="space-y-3">
                {aiReport.therapeutic_suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-psy-green-light flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-psy-green">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-psy-ink">{s.suggestion}</p>
                      <p className="text-[10px] text-psy-muted mt-0.5">{s.basis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evolución */}
          {aiReport.evolution_vs_previous && (
            <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-psy-green" />
                <h2 className="font-serif text-sm font-semibold text-psy-ink">Evolución vs. sesiones anteriores</h2>
              </div>
              <p className="text-xs text-psy-ink leading-relaxed">{aiReport.evolution_vs_previous}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
