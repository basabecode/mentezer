import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle, Clock } from "lucide-react"
import { ReferralGenerator } from "@/components/referral/ReferralGenerator"
import { parsePatientSlug, toPatientSlug } from "@/lib/patients/slug"
import { PortalPage } from "@/components/ui/portal-layout"

export default async function PatientReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const id = parsePatientSlug(slug)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from("patients")
    .select("id, name, consent_signed_at")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single()

  if (!patient) notFound()

  const patientSlug = toPatientSlug(patient.name, patient.id)

  const { data: reports } = await supabase
    .from("referral_reports")
    .select("id, recipient_specialty, recipient_specialist_name, status, created_at")
    .eq("patient_id", id)
    .eq("psychologist_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <PortalPage size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/patients/${patientSlug}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-ink"
            style={{ borderColor: "var(--psy-warm-border)" }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Paciente</p>
            <h1 className="mt-1 font-serif text-[1.8rem] font-bold tracking-tight text-psy-ink">
              Informes de derivación
            </h1>
            <p className="mt-0.5 text-sm text-psy-muted">{patient.name}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Generador */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Nuevo informe</p>
            <ReferralGenerator patientId={id} />
          </div>

          {/* Historial */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-psy-muted">Historial</p>
            {reports && reports.length > 0 ? (
              <div className="space-y-2">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-xl border bg-psy-cream/30 px-4 py-3"
                    style={{ borderColor: "var(--psy-warm-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="shrink-0 text-psy-muted" />
                      <div>
                        <p className="text-sm font-medium text-psy-ink">
                          Derivación a {report.recipient_specialty}
                        </p>
                        <p className="text-xs text-psy-muted">
                          {new Date(report.created_at).toLocaleDateString("es-CO", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      report.status === "sent" ? "bg-psy-green-light text-psy-green"
                      : report.status === "draft" ? "bg-psy-amber-light text-psy-amber"
                      : "bg-psy-blue-light text-psy-blue"
                    }`}>
                      {report.status === "sent" ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {report.status === "draft" ? "Borrador" : report.status === "approved" ? "Aprobado" : "Enviado"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed px-5 py-8 text-center" style={{ borderColor: "var(--psy-warm-border)" }}>
                <p className="text-sm text-psy-muted">Sin informes de derivación aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalPage>
  )
}
