import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, AlertTriangle, Clock } from "lucide-react";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, age, gender, reason, status, consent_signed_at, created_at")
    .eq("psychologist_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Pacientes</h1>
          <p className="text-sm text-psy-muted mt-0.5">
            {patients?.length ?? 0} registrados
          </p>
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-2 px-4 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
        >
          <Plus size={14} />
          Nuevo paciente
        </Link>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {patients?.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="flex items-center gap-4 p-4 bg-psy-paper border border-[var(--border)] rounded-xl hover:border-psy-blue/30 hover:shadow-[var(--shadow-card)] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-psy-blue-light flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-psy-blue">
                {patient.name[0]?.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-psy-ink">{patient.name}</p>
              <p className="text-xs text-psy-muted truncate mt-0.5">{patient.reason}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!patient.consent_signed_at && (
                <span className="flex items-center gap-1 text-xs text-psy-amber bg-psy-amber-light px-2 py-0.5 rounded-full">
                  <AlertTriangle size={10} />
                  Sin consentimiento
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  patient.status === "active"
                    ? "bg-psy-green-light text-psy-green"
                    : patient.status === "paused"
                    ? "bg-psy-amber-light text-psy-amber"
                    : "bg-[var(--border)] text-psy-muted"
                }`}
              >
                {patient.status === "active" ? "Activo" : patient.status === "paused" ? "Pausado" : "Cerrado"}
              </span>
              <div className="flex items-center gap-1 text-xs text-psy-muted">
                <Clock size={10} />
                {new Date(patient.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
              </div>
            </div>
          </Link>
        ))}

        {(!patients || patients.length === 0) && (
          <div className="text-center py-16 text-psy-muted">
            <p className="font-serif text-lg mb-2">Sin pacientes aún</p>
            <p className="text-sm">Registra tu primer paciente para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
