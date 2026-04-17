import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock } from "lucide-react";
import { ReferralGenerator } from "@/components/referral/ReferralGenerator";

export default async function PatientReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from("patients")
    .select("name, consent_signed_at")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single();

  if (!patient) notFound();

  const { data: reports } = await supabase
    .from("referral_reports")
    .select("id, recipient_specialty, recipient_specialist_name, status, created_at")
    .eq("patient_id", id)
    .eq("psychologist_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/patients/${id}`}
          className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-psy-ink font-semibold">Informes de derivación</h1>
          <p className="text-sm text-psy-muted mt-0.5">Paciente: {patient.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generador */}
        <div>
          <ReferralGenerator patientId={id} />
        </div>

        {/* Historial */}
        <div>
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-3">Historial</h2>
          {reports && reports.length > 0 ? (
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-psy-paper border border-psy-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-psy-muted" />
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
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    report.status === "sent" ? "bg-psy-green-light text-psy-green" :
                    report.status === "draft" ? "bg-psy-amber-light text-psy-amber" :
                    "bg-psy-blue-light text-psy-blue"
                  }`}>
                    {report.status === "sent" ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {report.status === "draft" ? "Borrador" :
                     report.status === "approved" ? "Aprobado" : "Enviado"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-psy-border rounded-xl p-8 text-center">
              <p className="text-sm text-psy-muted">Sin informes de derivación aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
