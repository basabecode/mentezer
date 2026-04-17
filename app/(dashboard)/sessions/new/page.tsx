import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionRecorder } from "@/components/recorder/SessionRecorder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function createSession(patientId: string, mode: "presential" | "virtual") {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("sessions")
    .insert({
      patient_id: patientId,
      psychologist_id: user.id,
      mode,
      scheduled_at: new Date().toISOString(),
      status: "recording",
    })
    .select("id")
    .single();

  return data?.id ?? null;
}

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient: patientId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Listar pacientes con consentimiento para el selector
  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, consent_signed_at, status")
    .eq("psychologist_id", user!.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const selectedPatient = patientId
    ? patients?.find((p) => p.id === patientId)
    : patients?.[0];

  if (!selectedPatient && patients && patients.length === 0) {
    redirect("/patients/new");
  }

  // Crear sesión para el paciente seleccionado
  let sessionId: string | null = null;
  if (selectedPatient) {
    sessionId = await createSession(selectedPatient.id, "presential");
  }

  if (!sessionId) {
    return (
      <div className="px-6 py-6">
        <p className="text-psy-muted">Error al crear la sesión. Inténtalo de nuevo.</p>
      </div>
    );
  }

  const hasConsent = !!selectedPatient?.consent_signed_at;

  return (
    <div className="px-6 py-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/patients" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-psy-ink font-semibold">Nueva sesión</h1>
          {selectedPatient && (
            <p className="text-xs text-psy-muted mt-0.5">
              Paciente: {selectedPatient.name}
            </p>
          )}
        </div>
      </div>

      {/* Selector de paciente */}
      {!patientId && patients && patients.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-psy-ink mb-1">
            Seleccionar paciente
          </label>
          <select className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30">
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <SessionRecorder
        sessionId={sessionId}
        hasConsent={hasConsent}
      />

      <div className="mt-4 p-3 bg-psy-blue-light rounded-lg">
        <p className="text-xs text-psy-blue font-medium mb-1">Modo presencial</p>
        <p className="text-xs text-psy-ink/70 leading-relaxed">
          Graba la sesión directamente desde este dispositivo. El audio se procesa localmente
          y se envía cifrado a Whisper para transcripción en español.
        </p>
      </div>
    </div>
  );
}
