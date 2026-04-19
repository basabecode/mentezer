import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, AlertTriangle, Clock, User } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, age, gender, reason, status, consent_signed_at, created_at")
    .eq("psychologist_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Pacientes</h1>
            <p className="text-base text-psy-ink/60 mt-2">
              Gestiona el seguimiento clínico de tus <span className="font-bold text-psy-blue">{patients?.length ?? 0}</span> pacientes registrados.
            </p>
          </div>
          <Link
            href="/patients/new"
            className="lift-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-psy-blue px-6 text-sm font-bold text-white shadow-xl shadow-psy-blue/20 transition-all max-sm:w-full"
          >
            <Plus size={18} strokeWidth={2.5} />
            Registrar paciente
          </Link>
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {patients?.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white border border-psy-border rounded-[1.5rem] hover:border-psy-blue/30 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-psy-blue/5 border border-psy-blue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold text-psy-blue">
                  {patient.name[0]?.toUpperCase()}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-[17px] font-bold text-psy-ink tracking-tight">{patient.name}</h3>
                <p className="text-sm text-psy-ink/50 truncate mt-0.5">{patient.reason}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 max-sm:w-full">
              {!patient.consent_signed_at && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-psy-red bg-psy-red/5 border border-psy-red/10 px-3 py-1 rounded-full">
                  <AlertTriangle size={12} />
                  Falta Consentimiento
                </span>
              )}
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
                  patient.status === "active"
                    ? "bg-psy-green/5 border-psy-green/10 text-psy-green"
                    : patient.status === "paused"
                    ? "bg-psy-amber/5 border-psy-amber/10 text-psy-amber"
                    : "bg-psy-cream border-psy-border text-psy-muted"
                )}
              >
                {patient.status === "active" ? "Activo" : patient.status === "paused" ? "Pausado" : "Cerrado"}
              </span>
              <div className="flex items-center gap-1.5 rounded-full border border-psy-border bg-psy-cream/50 px-3 py-1 text-xs font-medium text-psy-muted max-sm:w-full max-sm:justify-center">
                <Clock size={12} />
                <span>Registrado: {new Date(patient.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}</span>
              </div>
            </div>
          </Link>
        ))}

        {(!patients || patients.length === 0) && (
          <div className="text-center py-24 bg-white border border-psy-border rounded-[2rem] shadow-sm">
            <div className="w-20 h-20 bg-psy-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-psy-muted" />
            </div>
            <p className="font-sora text-xl font-bold text-psy-ink mb-2">No tienes pacientes registrados</p>
            <p className="text-sm text-psy-ink/60">Registra tu primer paciente para comenzar el seguimiento clínico.</p>
          </div>
        )}
      </div>
    </div>
  );
}
