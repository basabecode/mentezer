import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Calendar,
  MapPin,
  Video,
  FileText,
} from "lucide-react";
import type { AIReportData } from "@/lib/ai/analysis";
import type { TranscriptSegment } from "@/lib/ai/whisper";
import { AnalyzeButton } from "@/components/analysis/AnalyzeButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PortalPage } from "@/components/ui/portal-layout";
import { cn } from "@/lib/utils/cn";

function formatSessionDate(dateValue: string | null) {
  if (!dateValue) return "Sin fecha";
  return new Date(dateValue).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSessionTime(dateValue: string | null) {
  if (!dateValue) return "--:--";
  return new Date(dateValue).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, patient_id, status, mode, scheduled_at, patients(name, consent_signed_at)")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single();

  if (!session) notFound();

  const patient = session.patients as unknown as {
    name: string;
    consent_signed_at: string | null;
  } | null;

  const [{ data: transcript }, { data: report }] = await Promise.all([
    supabase.from("transcripts").select("content, edited_at").eq("session_id", id).single(),
    supabase.from("ai_reports").select("*").eq("session_id", id).single(),
  ]);

  const segments = transcript?.content as TranscriptSegment[] | null;
  const aiReport = report as unknown as AIReportData | null;
  const disclaimerText = aiReport?.disclaimer?.replace(/^⚠️\s*/, "").trim();
  const isManualTranscript = !!transcript?.edited_at;
  const transcriptText = segments?.map((segment) => segment.text).join("\n\n") ?? "";
  const riskSignals = aiReport?.risk_signals ?? [];
  const highRiskCount = riskSignals.filter(signal => signal.severity === "high").length;
  const moderateRiskCount = riskSignals.filter(signal => signal.severity !== "high").length;
  const patternCount = aiReport?.patterns?.length ?? 0;
  const suggestionCount = aiReport?.therapeutic_suggestions?.length ?? 0;

  return (
    <PortalPage size="lg">
      <div className="space-y-4">
        <Breadcrumbs />

        <section className="rounded-[2rem] border border-[#dce8ed] bg-[linear-gradient(180deg,#f8fbfc_0%,#ffffff_100%)] px-5 py-5 shadow-[0_16px_40px_rgba(13,34,50,0.05)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <Link
                href={`/patients/${session.patient_id}`}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-psy-border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-blue"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">
                  Sesion clinica
                </p>
                <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-psy-ink sm:text-[2.4rem]">
                  {patient?.name ?? "Paciente"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-border bg-[#f8faf9] px-3 py-1 text-psy-muted">
                    <Calendar size={12} />
                    {formatSessionDate(session.scheduled_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-border bg-[#f8faf9] px-3 py-1 text-psy-muted">
                    {session.mode === "presential" ? <MapPin size={12} /> : <Video size={12} />}
                    {session.mode === "presential" ? "Presencial" : "Virtual"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-border bg-[#f8faf9] px-3 py-1 text-psy-muted">
                    <Calendar size={12} />
                    {formatSessionTime(session.scheduled_at)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                      session.status === "completed"
                        ? "border-psy-green/10 bg-psy-green-light text-psy-green"
                        : session.status === "transcribing"
                          ? "border-psy-amber/10 bg-psy-amber-light text-psy-amber"
                          : "border-psy-border bg-psy-cream text-psy-muted",
                    )}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            </div>

            {transcript && !report && !isManualTranscript ? <AnalyzeButton sessionId={id} /> : null}
          </div>
        </section>

        {isManualTranscript && !aiReport && (
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-psy-blue/15 bg-white px-4 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-psy-blue/10 text-psy-blue">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-psy-blue">
                Documentacion manual
              </p>
              <p className="mt-1 text-sm leading-relaxed text-psy-muted">
                Esta sesion se guardo como nota clínica escrita. No hubo captura de audio ni análisis por IA.
              </p>
            </div>
          </div>
        )}

        {!transcript && (
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-psy-amber/20 bg-white px-4 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-psy-amber/10 text-psy-amber">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-psy-amber">
                Procesando transcripcion
              </p>
              <p className="mt-1 text-sm leading-relaxed text-psy-muted">
                El audio sigue en proceso. La transcripción y el análisis aparecerán aquí cuando estén listos.
              </p>
            </div>
          </div>
        )}

        {(segments?.length || aiReport) ? (
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_330px]">
            <div className="space-y-4">
              {segments && segments.length > 0 && (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-cream text-psy-muted">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">
                        {isManualTranscript ? "Nota clinica" : "Transcripcion"}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-psy-ink">
                        {isManualTranscript ? "Registro de la sesion" : "Texto de la sesion"}
                      </h2>
                    </div>
                  </div>

                  {isManualTranscript ? (
                  <div className="rounded-[1.4rem] border border-[#d7eaf2] bg-[#f6fbfd] px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-psy-ink/85">
                        {transcriptText}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[620px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                      {segments.map((seg, i) => (
                        <div key={i} className="grid gap-2 rounded-[1.2rem] border border-[#dce8ed] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)] px-3.5 py-3 sm:grid-cols-[54px_1fr] sm:items-start">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-psy-blue/75">
                            {Math.floor(seg.start / 60).toString().padStart(2, "0")}:{Math.floor(seg.start % 60).toString().padStart(2, "0")}
                          </span>
                          <p className="text-sm leading-relaxed text-psy-ink/85">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {aiReport?.patterns && aiReport.patterns.length > 0 && (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-blue/10 text-psy-blue">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Patrones</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-psy-ink">Evidencia clinica</h2>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {aiReport.patterns.map((pattern, i) => (
                      <div key={i} className="rounded-[1.3rem] border border-[#dce8ed] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)] px-4 py-4">
                        <p className="text-sm font-semibold text-psy-ink">{pattern.pattern}</p>
                        <p className="mt-2 text-sm leading-relaxed text-psy-muted">"{pattern.evidence}"</p>
                        {pattern.source ? (
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-psy-blue">
                            {pattern.source}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-4">
              {aiReport ? (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-psy-blue/10 text-psy-blue">
                      <Brain size={18} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Lectura IA</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-psy-ink">Resumen clinico</h2>
                    </div>
                  </div>

                  {disclaimerText ? (
                    <div className="mt-4 rounded-[1.2rem] border border-psy-amber/15 bg-psy-amber-light/70 px-3.5 py-3 text-xs leading-relaxed text-psy-muted">
                      {disclaimerText}
                    </div>
                  ) : null}

                  <p className="mt-4 text-sm leading-relaxed text-psy-ink/85">{aiReport.summary}</p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-[1.2rem] border border-psy-border bg-[#f8faf9] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-psy-muted">Riesgo alto</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-psy-ink">{highRiskCount}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-psy-border bg-[#f8faf9] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-psy-muted">Patrones</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-psy-ink">{patternCount}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-psy-border bg-[#f8faf9] px-3 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-psy-muted">Sugerencias</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-psy-ink">{suggestionCount}</p>
                    </div>
                  </div>
                </section>
              ) : transcript && !isManualTranscript ? (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Analisis pendiente</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-psy-ink">La transcripcion ya esta lista</h2>
                  <p className="mt-2 text-sm leading-relaxed text-psy-muted">
                    Ejecuta el análisis para generar resumen, patrones y recomendaciones terapéuticas.
                  </p>
                  <div className="mt-4">
                    <AnalyzeButton sessionId={id} />
                  </div>
                </section>
              ) : null}

              {aiReport?.risk_signals && aiReport.risk_signals.length > 0 && (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-red/10 text-psy-red">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Riesgo</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-psy-ink">Señales detectadas</h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiReport.risk_signals.map((signal, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-[1.2rem] border px-3.5 py-3",
                          signal.severity === "high"
                            ? "border-psy-red/10 bg-psy-red-light/80"
                            : "border-psy-amber/10 bg-psy-amber-light/80",
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                              signal.severity === "high" ? "bg-psy-red" : "bg-psy-amber",
                            )}
                          >
                            {signal.severity === "high" ? "Grave" : "Moderado"}
                          </span>
                          <p className="text-sm font-semibold text-psy-ink">{signal.signal}</p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-psy-muted">{signal.description}</p>
                      </div>
                    ))}
                  </div>

                  {moderateRiskCount > 0 || highRiskCount > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-psy-muted">
                      {highRiskCount > 0 ? <span>{highRiskCount} de alta prioridad</span> : null}
                      {moderateRiskCount > 0 ? <span>{moderateRiskCount} moderadas</span> : null}
                    </div>
                  ) : null}
                </section>
              )}

              {aiReport?.evolution_vs_previous ? (
                <section className="rounded-[1.9rem] border border-psy-border bg-white p-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-green/10 text-psy-green">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Evolucion</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-psy-ink">Comparativo clinico</h2>
                    </div>
                  </div>
                  <div className="rounded-[1.2rem] border border-psy-green/10 bg-psy-green-light/70 px-4 py-4 text-sm leading-relaxed text-psy-ink/80">
                    {aiReport.evolution_vs_previous}
                  </div>
                </section>
              ) : null}
            </div>
          </section>
        ) : null}

        {aiReport?.therapeutic_suggestions && aiReport.therapeutic_suggestions.length > 0 ? (
          <section className="rounded-[2rem] border border-psy-ink bg-psy-ink px-5 py-5 shadow-[0_18px_40px_rgba(13,16,18,0.22)] sm:px-6 sm:py-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-psy-blue/20 text-psy-blue">
                <Lightbulb size={20} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Plan de accion</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Sugerencias terapeuticas</h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {aiReport.therapeutic_suggestions.map((suggestion, i) => (
                <div key={i} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-psy-blue text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-relaxed text-white">{suggestion.suggestion}</p>
                      <p className="mt-2 text-xs leading-relaxed text-white/55">{suggestion.basis}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PortalPage>
  );
}
