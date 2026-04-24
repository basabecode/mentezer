import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { signConsent, deletePatient } from "@/lib/patients/actions"
import { parsePatientSlug, toPatientSlug } from "@/lib/patients/slug"
import { ArrowLeft, CheckCircle, AlertTriangle, Mic, FileText, Trash2, StickyNote } from "lucide-react"
import { PortalPage } from "@/components/ui/portal-layout"
import { PatientNotesPanel } from "@/components/patient/PatientNotesPanel"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const patientId = parsePatientSlug(slug)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: sessions }, { data: notes }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", patientId).eq("psychologist_id", user!.id).single(),
    supabase
      .from("sessions")
      .select("id, scheduled_at, status, mode, transcripts(edited_at), ai_reports(id)")
      .eq("patient_id", patientId)
      .order("scheduled_at", { ascending: false })
      .limit(10),
    supabase
      .from("patient_notes")
      .select("id, content, created_at")
      .eq("patient_id", patientId)
      .eq("psychologist_id", user!.id)
      .order("created_at", { ascending: false }),
  ])

  if (!patient) notFound()

  const patientSlug = toPatientSlug(patient.name, patient.id)

  return (
    <PortalPage size="lg">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/patients"
              className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-ink"
              style={{ borderColor: "var(--psy-warm-border)" }}
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Ficha del paciente</p>
              <h1 className="mt-1 font-serif text-[1.9rem] font-bold tracking-tight text-psy-ink">{patient.name}</h1>
              {patient.age ? (
                <p className="mt-0.5 text-xs text-psy-muted">
                  {patient.age} años · Registrado el{" "}
                  {new Date(patient.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/patients/${patientSlug}/reports`}
              className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm font-medium text-psy-ink transition hover:-translate-y-0.5 hover:shadow-sm"
              style={{ borderColor: "var(--psy-warm-border)" }}
            >
              <FileText size={14} strokeWidth={2} />
              Derivaciones
            </Link>
            <Link
              href={`/sessions/new?patient=${patient.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-psy-blue px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(62,129,151,0.28)] transition hover:-translate-y-0.5"
            >
              <Mic size={14} strokeWidth={2} />
              Nueva sesión
            </Link>
          </div>
        </div>

        {/* Consentimiento */}
        {!patient.consent_signed_at ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-psy-amber/20 bg-psy-amber-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-psy-amber" />
              <div>
                <p className="text-sm font-semibold text-psy-amber">Consentimiento informado pendiente</p>
                <p className="mt-0.5 text-xs leading-relaxed text-psy-ink/65">
                  Obtén el consentimiento antes de grabar o analizar sesiones (Ley 1581).
                </p>
              </div>
            </div>
            <form action={async () => {
              "use server"
              await signConsent(patient.id)
            }}>
              <button
                type="submit"
                className="whitespace-nowrap rounded-xl bg-psy-amber px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-psy-amber/90"
              >
                Registrar consentimiento
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-psy-green/15 bg-psy-green-light px-5 py-3">
            <CheckCircle size={15} className="shrink-0 text-psy-green" />
            <p className="text-sm font-medium text-psy-green">
              Consentimiento firmado el{" "}
              {new Date(patient.consent_signed_at).toLocaleDateString("es-CO", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Datos + Motivo */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-muted">Datos personales</p>
            <dl className="mt-4 space-y-3">
              <DataRow label="Documento" value={patient.document_id} />
              <DataRow label="Género" value={patient.gender} />
              <DataRow label="Teléfono" value={patient.contact_phone} />
              <DataRow label="Email" value={patient.contact_email} />
              <DataRow label="Emergencia" value={patient.emergency_contact} />
            </dl>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-muted">Motivo de consulta</p>
            <p className="mt-4 text-sm leading-7 text-psy-ink">{patient.reason}</p>
            {patient.referred_by && (
              <p className="mt-3 text-xs text-psy-muted">
                Referido por: <span className="font-medium text-psy-ink">{patient.referred_by}</span>
              </p>
            )}
          </div>
        </div>

        {/* Notas del psicólogo */}
        <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
          <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: "var(--psy-warm-border)" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-psy-amber-light text-psy-amber">
              <StickyNote size={15} />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-amber">Observaciones</p>
              <h2 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-psy-ink">
                Notas clínicas
              </h2>
            </div>
            {notes && notes.length > 0 && (
              <span className="ml-auto rounded-full border border-psy-amber/20 bg-psy-amber-light px-2 py-0.5 text-[10px] font-bold text-psy-amber">
                {notes.length}
              </span>
            )}
          </div>
          <div className="p-5">
            <PatientNotesPanel
              patientId={patient.id}
              initialNotes={notes ?? []}
            />
          </div>
        </div>

        {/* Sesiones */}
        <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--psy-warm-border)" }}>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-blue">Historial</p>
              <h2 className="mt-1 font-serif text-lg font-bold tracking-tight text-psy-ink">Sesiones</h2>
            </div>
            <Link href={`/sessions/new?patient=${patient.id}`} className="text-xs font-semibold text-psy-blue hover:underline">
              + Nueva
            </Link>
          </div>

          <div className="p-5">
            {sessions && sessions.length > 0 ? (
              <div className="space-y-2">
                {(sessions as Array<{
                  id: string
                  scheduled_at: string
                  status: string
                  mode: string
                  transcripts?: { edited_at: string | null }[] | { edited_at: string | null } | null
                  ai_reports?: { id: string }[] | { id: string } | null
                }>).map(session => {
                  const transcriptMeta = Array.isArray(session.transcripts) ? session.transcripts[0] : session.transcripts
                  const reports = Array.isArray(session.ai_reports) ? session.ai_reports : session.ai_reports ? [session.ai_reports] : []
                  const isManualDocumented = !!transcriptMeta?.edited_at && reports.length === 0
                  const isAnalyzed = session.status === "complete" && reports.length > 0
                  const statusLabel = isAnalyzed ? "Analizada" : isManualDocumented ? "Documentada" : "Pendiente"
                  const statusClass = isAnalyzed
                    ? "border-psy-green/15 bg-psy-green-light text-psy-green"
                    : isManualDocumented
                      ? "border-psy-blue/15 bg-psy-blue-light text-psy-blue"
                      : "border-psy-amber/15 bg-psy-amber-light text-psy-amber"
                  const dot = isAnalyzed ? "bg-psy-green" : isManualDocumented ? "bg-psy-blue" : "bg-psy-amber"

                  return (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border bg-psy-cream/30 px-4 py-3 transition hover:border-psy-blue/20 hover:bg-psy-blue-light/30"
                      style={{ borderColor: "var(--psy-warm-border)" }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                        <span className="text-sm text-psy-ink">
                          {new Date(session.scheduled_at).toLocaleDateString("es-CO", {
                            weekday: "long", day: "numeric", month: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs capitalize text-psy-muted">{session.mode}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-psy-muted">Sin sesiones registradas</p>
            )}
          </div>
        </div>

        {/* Zona de riesgo */}
        <div className="rounded-2xl border border-psy-red/15 bg-psy-red-light p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-red">Zona de riesgo</p>
          <p className="mt-3 text-xs leading-relaxed text-psy-ink/65">
            Eliminar al paciente borra permanentemente todos sus datos: sesiones, transcripciones,
            reportes, notas, embeddings y planes. Esta acción no se puede deshacer (Derecho al olvido — Ley 1581).
          </p>
          <form
            className="mt-4"
            action={async () => {
              "use server"
              await deletePatient(patient.id)
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-psy-red px-4 py-2 text-xs font-semibold text-white transition hover:bg-psy-red/90"
            >
              <Trash2 size={12} />
              Eliminar todos los datos del paciente
            </button>
          </form>
        </div>

      </div>
    </PortalPage>
  )
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-xs text-psy-muted">{label}</dt>
      <dd className="min-w-0 truncate text-xs font-medium text-psy-ink">{value}</dd>
    </div>
  )
}
