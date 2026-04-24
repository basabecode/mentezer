import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  ArrowLeft, Brain, AlertTriangle, BookOpen, Lightbulb,
  TrendingUp, Calendar, MapPin, Video, FileText,
} from "lucide-react"
import type { AIReportData } from "@/lib/ai/analysis"
import type { TranscriptSegment } from "@/lib/ai/whisper"
import { AnalyzeButton } from "@/components/analysis/AnalyzeButton"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { PortalPage } from "@/components/ui/portal-layout"
import { cn } from "@/lib/utils/cn"
import { toPatientSlug } from "@/lib/patients/slug"

function formatSessionDate(dateValue: string | null) {
  if (!dateValue) return "Sin fecha"
  return new Date(dateValue).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
}

function formatSessionTime(dateValue: string | null) {
  if (!dateValue) return "--:--"
  return new Date(dateValue).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from("sessions")
    .select("id, patient_id, status, mode, scheduled_at, patients(name, consent_signed_at)")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single()

  if (!session) notFound()

  const patient = session.patients as unknown as { name: string; consent_signed_at: string | null } | null
  const patientHref = patient ? `/patients/${toPatientSlug(patient.name, session.patient_id)}` : `/patients/${session.patient_id}`

  const [{ data: transcript }, { data: report }] = await Promise.all([
    supabase.from("transcripts").select("content, edited_at").eq("session_id", id).single(),
    supabase.from("ai_reports").select("*").eq("session_id", id).single(),
  ])

  const segments = transcript?.content as TranscriptSegment[] | null
  const aiReport = report as unknown as AIReportData | null
  const disclaimerText = aiReport?.disclaimer?.replace(/^⚠️\s*/, "").trim()
  const isManualTranscript = !!transcript?.edited_at
  const transcriptText = segments?.map(segment => segment.text).join("\n\n") ?? ""
  const riskSignals = aiReport?.risk_signals ?? []
  const highRiskCount = riskSignals.filter(s => s.severity === "high").length
  const moderateRiskCount = riskSignals.filter(s => s.severity !== "high").length
  const patternCount = aiReport?.patterns?.length ?? 0
  const suggestionCount = aiReport?.therapeutic_suggestions?.length ?? 0

  return (
    <PortalPage size="lg">
      <div className="space-y-4">
        <Breadcrumbs />

        {/* Hero de sesión */}
        <section className="rounded-[2rem] border bg-white px-5 py-5 shadow-[0_12px_32px_rgba(13,34,50,0.05)] sm:px-6 sm:py-6" style={{ borderColor: 'var(--psy-warm-border)' }}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <Link
                href={patientHref}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-blue"
                style={{ borderColor: 'var(--psy-warm-border)' }}
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Sesión clínica</p>
                <h1 className="mt-2 font-serif text-[2rem] font-bold tracking-tight text-psy-ink sm:text-[2.3rem]">
                  {patient?.name ?? "Paciente"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-blue/15 bg-psy-blue-light px-3 py-1 text-psy-muted">
                    <Calendar size={11} />
                    {formatSessionDate(session.scheduled_at)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-blue/15 bg-psy-blue-light px-3 py-1 text-psy-muted">
                    {session.mode === "presential" ? <MapPin size={11} /> : <Video size={11} />}
                    {session.mode === "presential" ? "Presencial" : "Virtual"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-blue/15 bg-psy-blue-light px-3 py-1 text-psy-muted">
                    <Calendar size={11} />
                    {formatSessionTime(session.scheduled_at)}
                  </span>
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    session.status === "completed"
                      ? "border-psy-green/15 bg-psy-green-light text-psy-green"
                      : session.status === "transcribing"
                        ? "border-psy-amber/15 bg-psy-amber-light text-psy-amber"
                        : "bg-psy-cream text-psy-muted",
                  )}
                  style={session.status !== "completed" && session.status !== "transcribing" ? { borderColor: 'var(--psy-warm-border)' } : {}}>
                    {session.status}
                  </span>
                </div>
              </div>
            </div>
            {transcript && !report && !isManualTranscript ? <AnalyzeButton sessionId={id} /> : null}
          </div>
        </section>

        {/* Banners de estado */}
        {isManualTranscript && !aiReport && (
          <div className="flex items-start gap-3 rounded-2xl border border-psy-blue/15 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-psy-blue-light text-psy-blue">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-psy-blue">Documentación manual</p>
              <p className="mt-1 text-sm leading-relaxed text-psy-muted">
                Esta sesión se guardó como nota clínica escrita. No hubo captura de audio ni análisis por IA.
              </p>
            </div>
          </div>
        )}

        {!transcript && (
          <div className="flex items-start gap-3 rounded-2xl border border-psy-amber/20 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-psy-amber-light text-psy-amber">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-psy-amber">Procesando transcripción</p>
              <p className="mt-1 text-sm leading-relaxed text-psy-muted">
                El audio sigue en proceso. La transcripción y el análisis aparecerán aquí cuando estén listos.
              </p>
            </div>
          </div>
        )}

        {(segments?.length || aiReport) ? (
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_300px]">

            {/* Columna izquierda */}
            <div className="space-y-4">
              {segments && segments.length > 0 && (
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-cream text-psy-muted">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">
                        {isManualTranscript ? "Nota clínica" : "Transcripción"}
                      </p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">
                        {isManualTranscript ? "Registro de la sesión" : "Texto de la sesión"}
                      </h2>
                    </div>
                  </div>

                  {isManualTranscript ? (
                    <div className="rounded-xl border border-psy-blue/15 bg-psy-blue-light/40 px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-psy-ink/85">{transcriptText}</p>
                    </div>
                  ) : (
                    <div className="custom-scrollbar max-h-[580px] space-y-2.5 overflow-y-auto pr-1">
                      {segments.map((seg, i) => (
                        <div key={i} className="grid gap-2 rounded-xl border bg-psy-cream/40 px-3.5 py-3 sm:grid-cols-[54px_1fr] sm:items-start" style={{ borderColor: 'var(--psy-warm-border)' }}>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-psy-blue/70">
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
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-blue-light text-psy-blue">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Patrones</p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">Evidencia clínica</h2>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {aiReport.patterns.map((pattern, i) => (
                      <div key={i} className="rounded-xl border bg-psy-cream/40 px-4 py-4" style={{ borderColor: 'var(--psy-warm-border)' }}>
                        <p className="text-sm font-semibold text-psy-ink">{pattern.pattern}</p>
                        <p className="mt-2 text-sm leading-relaxed text-psy-muted">"{pattern.evidence}"</p>
                        {pattern.source ? (
                          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-psy-blue">{pattern.source}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {aiReport ? (
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-psy-blue-light text-psy-blue">
                      <Brain size={18} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Lectura IA</p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">Resumen clínico</h2>
                    </div>
                  </div>

                  {disclaimerText ? (
                    <div className="mt-4 rounded-xl border border-psy-amber/20 bg-psy-amber-light/60 px-3.5 py-3 text-xs leading-relaxed text-psy-muted">
                      {disclaimerText}
                    </div>
                  ) : null}

                  <p className="mt-4 text-sm leading-7 text-psy-ink/85">{aiReport.summary}</p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    {[
                      { label: "Riesgo alto", value: highRiskCount },
                      { label: "Patrones", value: patternCount },
                      { label: "Sugerencias", value: suggestionCount },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl border bg-psy-cream/50 px-3 py-3" style={{ borderColor: 'var(--psy-warm-border)' }}>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-psy-muted">{item.label}</p>
                        <p className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-psy-ink">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : transcript && !isManualTranscript ? (
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Análisis pendiente</p>
                  <h2 className="mt-2 font-serif text-lg font-bold tracking-tight text-psy-ink">La transcripción ya está lista</h2>
                  <p className="mt-2 text-sm leading-7 text-psy-muted">
                    Ejecuta el análisis para generar resumen, patrones y recomendaciones terapéuticas.
                  </p>
                  <div className="mt-4"><AnalyzeButton sessionId={id} /></div>
                </section>
              ) : null}

              {aiReport?.risk_signals && aiReport.risk_signals.length > 0 && (
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-red-light text-psy-red">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Riesgo</p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">Señales detectadas</h2>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {aiReport.risk_signals.map((signal, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl border px-3.5 py-3",
                          signal.severity === "high"
                            ? "border-psy-red/15 bg-psy-red-light"
                            : "border-psy-amber/15 bg-psy-amber-light",
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
                            signal.severity === "high" ? "bg-psy-red" : "bg-psy-amber",
                          )}>
                            {signal.severity === "high" ? "Grave" : "Moderado"}
                          </span>
                          <p className="text-sm font-semibold text-psy-ink">{signal.signal}</p>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-psy-muted">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                  {(moderateRiskCount > 0 || highRiskCount > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-psy-muted">
                      {highRiskCount > 0 && <span>{highRiskCount} de alta prioridad</span>}
                      {moderateRiskCount > 0 && <span>{moderateRiskCount} moderadas</span>}
                    </div>
                  )}
                </section>
              )}

              {aiReport?.evolution_vs_previous ? (
                <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-green-light text-psy-green">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-muted">Evolución</p>
                      <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">Comparativo clínico</h2>
                    </div>
                  </div>
                  <div className="rounded-xl border border-psy-green/15 bg-psy-green-light/60 px-4 py-4 text-sm leading-7 text-psy-ink/80">
                    {aiReport.evolution_vs_previous}
                  </div>
                </section>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Sugerencias terapéuticas */}
        {aiReport?.therapeutic_suggestions && aiReport.therapeutic_suggestions.length > 0 ? (
          <section className="rounded-[2rem] border border-psy-ink bg-psy-ink px-5 py-5 shadow-[0_16px_36px_rgba(13,16,18,0.20)] sm:px-6 sm:py-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-psy-blue/20 text-psy-blue">
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">Plan de acción</p>
                <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-white">Sugerencias terapéuticas</h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {aiReport.therapeutic_suggestions.map((suggestion, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-psy-blue text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-relaxed text-white">{suggestion.suggestion}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/55">{suggestion.basis}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

      </div>
    </PortalPage>
  )
}
