import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Brain, AlertTriangle, BookOpen, Lightbulb, TrendingUp, Calendar, MapPin, Video, FileText } from "lucide-react";
import type { AIReportData } from "@/lib/ai/analysis";
import type { TranscriptSegment } from "@/lib/ai/whisper";
import { AnalyzeButton } from "@/components/analysis/AnalyzeButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs />
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href={`/patients/${session.patient_id}`}
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-psy-border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-blue shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-psy-blue/10 text-psy-blue text-[10px] font-bold">S</span>
                <p className="font-mono text-[10px] uppercase tracking-widest text-psy-blue font-bold">
                  Resumen de Sesión
                </p>
              </div>
              <h1 className="font-sora text-3xl font-bold tracking-tight text-psy-ink">
                {patient?.name ?? "Paciente"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-psy-ink/50 font-medium">
                  <Calendar size={14} />
                  <span>{new Date(session.scheduled_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-psy-ink/50 font-medium">
                  {session.mode === "presential" ? <MapPin size={14} /> : <Video size={14} />}
                  <span>{session.mode === "presential" ? "Presencial" : "Virtual"}</span>
                </div>
              </div>
            </div>
          </div>

          {transcript && !report && (
            <AnalyzeButton sessionId={id} />
          )}
        </div>
      </div>

      {/* Estado de la sesión */}
      {!transcript && (
        <div className="mb-8 flex items-start gap-4 rounded-[1.5rem] border border-psy-amber/20 bg-white p-6 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-psy-amber/5 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-psy-amber" />
          </div>
          <div>
            <p className="text-sm font-bold text-psy-amber uppercase tracking-wider">Procesando Transcripción</p>
            <p className="text-sm text-psy-ink/60 mt-1 leading-relaxed">
              Whisper está procesando el audio en segundo plano. La transcripción y el análisis clínico aparecerán aquí automáticamente en unos minutos.
            </p>
          </div>
        </div>
      )}

      {/* Transcripción */}
      {segments && segments.length > 0 && (
        <div className="mb-8 rounded-[2rem] border border-psy-border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-psy-cream flex items-center justify-center text-psy-muted">
              <FileText size={16} />
            </div>
            <h2 className="font-sora text-sm font-bold text-psy-ink uppercase tracking-wider">Transcripción de la Sesión</h2>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {segments.map((seg, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="font-mono text-[10px] text-psy-blue font-bold shrink-0 mt-1 w-12 opacity-60 group-hover:opacity-100 transition-opacity">
                  {Math.floor(seg.start / 60).toString().padStart(2, "0")}:{Math.floor(seg.start % 60).toString().padStart(2, "0")}
                </span>
                <p className="text-sm text-psy-ink/80 leading-relaxed group-hover:text-psy-ink transition-colors">{seg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informe IA */}
      {aiReport && (
        <div className="space-y-6">
          {/* Disclaimer */}
          <div className="flex gap-3 rounded-2xl border border-psy-border border-l-4 border-l-psy-amber bg-white p-4 shadow-sm">
            <AlertTriangle className="text-psy-amber shrink-0 h-5 w-5" />
            <p className="text-[11px] text-psy-ink/60 leading-relaxed italic">{aiReport.disclaimer}</p>
          </div>

          {/* Resumen */}
          <div className="rounded-[2rem] border border-psy-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-psy-blue/5 flex items-center justify-center text-psy-blue">
                <Brain size={20} />
              </div>
              <h2 className="font-sora text-sm font-bold text-psy-ink uppercase tracking-wider">Análisis Clínico / Resumen</h2>
            </div>
            <p className="text-[15px] text-psy-ink/80 leading-relaxed font-medium">{aiReport.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Señales de riesgo */}
            {aiReport.risk_signals && aiReport.risk_signals.length > 0 && (
              <div className="h-full rounded-[2rem] border border-psy-border bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-psy-red/5 flex items-center justify-center text-psy-red">
                    <AlertTriangle size={16} />
                  </div>
                  <h2 className="font-sora text-sm font-bold text-psy-ink uppercase tracking-wider">Alertas de Riesgo</h2>
                </div>
                <div className="space-y-4">
                  {aiReport.risk_signals.map((signal, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                      signal.severity === "high" 
                        ? "bg-psy-red/5 border-psy-red/10" 
                        : "bg-psy-amber/5 border-psy-amber/10"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          signal.severity === "high" ? "bg-psy-red text-white" : "bg-psy-amber text-white"
                        )}>
                          {signal.severity === "high" ? "Grave" : "Moderado"}
                        </span>
                        <span className="text-sm font-bold text-psy-ink">{signal.signal}</span>
                      </div>
                      <p className="text-xs text-psy-ink/60 leading-relaxed">{signal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evolución */}
            {aiReport.evolution_vs_previous && (
              <div className="h-full rounded-[2rem] border border-psy-border bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-psy-green/5 flex items-center justify-center text-psy-green">
                    <TrendingUp size={16} />
                  </div>
                  <h2 className="font-sora text-sm font-bold text-psy-ink uppercase tracking-wider">Evolución Clínica</h2>
                </div>
                <div className="p-6 rounded-2xl bg-psy-green/5 border border-psy-green/10">
                  <p className="text-sm text-psy-ink leading-relaxed italic">"{aiReport.evolution_vs_previous}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Patrones observados */}
          {aiReport.patterns && aiReport.patterns.length > 0 && (
            <div className="rounded-[2rem] border border-psy-border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-psy-blue/5 flex items-center justify-center text-psy-blue">
                  <BookOpen size={20} />
                </div>
                <h2 className="font-sora text-sm font-bold text-psy-ink uppercase tracking-wider">Patrones y Evidencia Clínica</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiReport.patterns.map((p, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-psy-cream/30 border border-psy-border hover:bg-white hover:shadow-lg transition-all">
                    <p className="text-[15px] font-bold text-psy-ink mb-2">{p.pattern}</p>
                    <p className="text-sm text-psy-ink/60 leading-relaxed mb-4">"{p.evidence}"</p>
                    {p.source && (
                      <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-md bg-psy-blue/10 flex items-center justify-center">
                           <BookOpen size={12} className="text-psy-blue" />
                         </div>
                         <p className="text-[10px] text-psy-blue font-bold uppercase tracking-wider">{p.source}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias terapéuticas */}
          {aiReport.therapeutic_suggestions && aiReport.therapeutic_suggestions.length > 0 && (
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-psy-ink bg-psy-ink p-6 shadow-2xl sm:p-10">
              {/* Efecto visual de fondo */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-psy-blue/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-psy-green/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-[1.5rem] bg-psy-blue/20 flex items-center justify-center text-psy-blue shadow-inner">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h2 className="font-sora text-lg font-bold text-white uppercase tracking-wider">Plan de Acción / Sugerencias</h2>
                    <p className="text-xs text-white/40 mt-1">Estrategias recomendadas por MENTEZER basado en el contexto clínico</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiReport.therapeutic_suggestions.map((s, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-psy-blue flex items-center justify-center shrink-0 shadow-lg shadow-psy-blue/30 mt-1">
                        <span className="text-xs font-bold text-white">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-white leading-tight">{s.suggestion}</p>
                        <p className="text-xs text-white/50 mt-2 leading-relaxed">{s.basis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
