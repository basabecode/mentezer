import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signConsent, deletePatient } from "@/lib/patients/actions";
import { ArrowLeft, CheckCircle, AlertTriangle, Mic, FileText, Trash2 } from "lucide-react";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single();

  if (!patient) notFound();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, scheduled_at, status, mode")
    .eq("patient_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(10);

  return (
    <div className="px-6 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/patients" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-xl text-psy-ink font-semibold">{patient.name}</h1>
            <p className="text-xs text-psy-muted mt-0.5">
              {patient.age ? `${patient.age} años · ` : ""}
              Registrado el {new Date(patient.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/patients/${id}/reports`}
            className="flex items-center gap-2 px-3 py-2 bg-psy-paper border border-psy-border text-psy-ink rounded-lg text-sm font-medium hover:bg-psy-cream transition-colors"
          >
            <FileText size={14} />
            Derivaciones
          </Link>
          <Link
            href={`/sessions/new?patient=${id}`}
            className="flex items-center gap-2 px-3 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
          >
            <Mic size={14} />
            Nueva sesión
          </Link>
        </div>
      </div>

      {/* Consentimiento */}
      {!patient.consent_signed_at ? (
        <div className="bg-psy-amber-light border border-psy-amber/20 rounded-xl p-4 mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-psy-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-psy-amber">Consentimiento informado pendiente</p>
              <p className="text-xs text-psy-ink/70 mt-0.5">
                Obtén el consentimiento antes de grabar o analizar sesiones (Ley 1581).
              </p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await signConsent(id);
          }}>
            <button
              type="submit"
              className="px-3 py-1.5 bg-psy-amber text-white text-xs rounded-lg hover:bg-psy-amber/90 transition-colors whitespace-nowrap"
            >
              Registrar consentimiento
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-psy-green-light border border-psy-green/20 rounded-xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle size={15} className="text-psy-green shrink-0" />
          <p className="text-xs text-psy-green font-medium">
            Consentimiento firmado el{" "}
            {new Date(patient.consent_signed_at).toLocaleDateString("es-CO", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Datos del paciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-4">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-3">Datos personales</h2>
          <dl className="space-y-2">
            <DataRow label="Documento" value={patient.document_id} />
            <DataRow label="Género" value={patient.gender} />
            <DataRow label="Teléfono" value={patient.contact_phone} />
            <DataRow label="Email" value={patient.contact_email} />
            <DataRow label="Emergencia" value={patient.emergency_contact} />
          </dl>
        </div>
        <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-4">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-3">Motivo clínico</h2>
          <p className="text-sm text-psy-ink leading-relaxed">{patient.reason}</p>
          {patient.referred_by && (
            <p className="text-xs text-psy-muted mt-3">
              Referido por: {patient.referred_by}
            </p>
          )}
        </div>
      </div>

      {/* Sesiones */}
      <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-sm font-semibold text-psy-ink">Sesiones</h2>
          <Link href={`/sessions/new?patient=${id}`} className="text-xs text-psy-blue hover:underline">
            + Nueva
          </Link>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-psy-cream transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.status === "complete" ? "bg-psy-green" : "bg-psy-amber"}`} />
                  <span className="text-sm text-psy-ink">
                    {new Date(session.scheduled_at).toLocaleDateString("es-CO", {
                      weekday: "long", day: "numeric", month: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-psy-muted capitalize">{session.mode}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    session.status === "complete" ? "bg-psy-green-light text-psy-green" : "bg-psy-amber-light text-psy-amber"
                  }`}>
                    {session.status === "complete" ? "Analizada" : "Pendiente"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-psy-muted text-center py-4">Sin sesiones registradas</p>
        )}
      </div>

      {/* Acciones peligrosas */}
      <div className="bg-psy-red-light border border-psy-red/20 rounded-xl p-4">
        <h2 className="font-serif text-sm font-semibold text-psy-red mb-2">Zona de riesgo</h2>
        <p className="text-xs text-psy-ink/70 mb-3 leading-relaxed">
          Eliminar al paciente borra permanentemente todos sus datos: sesiones, transcripciones,
          reportes, embeddings y planes. Esta acción no se puede deshacer (Derecho al olvido — Ley 1581).
        </p>
        <form action={async () => {
          "use server";
          await deletePatient(id);
        }}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 bg-psy-red text-white text-xs rounded-lg hover:bg-psy-red/90 transition-colors"
            onClick={(e) => {
              if (!confirm(`¿Confirmas la eliminación permanente de todos los datos de ${patient.name}?`)) {
                e.preventDefault();
              }
            }}
          >
            <Trash2 size={12} />
            Eliminar todos los datos del paciente
          </button>
        </form>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-xs text-psy-muted w-24 shrink-0">{label}</dt>
      <dd className="text-xs text-psy-ink">{value}</dd>
    </div>
  );
}
