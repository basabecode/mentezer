import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SessionRecorder } from "@/components/recorder/SessionRecorder";
import { AudioUploader } from "@/components/recorder/AudioUploader";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; mode?: string }>;
}) {
  const { patient: patientId, mode: modeParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, consent_signed_at, status")
    .eq("psychologist_id", user!.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (!patients || patients.length === 0) redirect("/patients/new");

  const selected = patients.find((p) => p.id === patientId) ?? patients[0];
  const mode = modeParam === "virtual" ? "virtual" : "presential";
  const hasConsent = !!selected?.consent_signed_at;

  return (
    <div className="px-6 py-6 max-w-xl space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/patients" className="p-1.5 rounded-lg text-[var(--psy-muted)] hover:text-[var(--psy-ink)] hover:bg-[var(--psy-paper)] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-[var(--psy-ink)] font-semibold">Nueva sesión</h1>
          <p className="text-xs text-[var(--psy-muted)] mt-0.5">Paciente: {selected?.name}</p>
        </div>
      </div>

      {/* Selector de paciente */}
      {patients.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-[var(--psy-ink)] mb-1.5">Paciente</label>
          <div className="flex flex-wrap gap-2">
            {patients.map((p) => (
              <Link
                key={p.id}
                href={`/sessions/new?patient=${p.id}&mode=${mode}`}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  p.id === selected?.id
                    ? "bg-[var(--psy-blue)] text-white border-[var(--psy-blue)]"
                    : "bg-[var(--psy-paper)] text-[var(--psy-ink)] border-[var(--psy-border)] hover:border-[var(--psy-blue)]/40"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Selector de modo */}
      <div>
        <label className="block text-sm font-medium text-[var(--psy-ink)] mb-1.5">Tipo de sesión</label>
        <div className="grid grid-cols-2 gap-2">
          {(["presential", "virtual"] as const).map((m) => (
            <Link
              key={m}
              href={`/sessions/new?patient=${selected?.id}&mode=${m}`}
              className={`p-3 rounded-xl border text-center transition-colors ${
                mode === m
                  ? "bg-[var(--psy-blue-light)] border-[var(--psy-blue)] text-[var(--psy-blue)]"
                  : "bg-[var(--psy-paper)] border-[var(--psy-border)] text-[var(--psy-muted)] hover:border-[var(--psy-blue)]/30"
              }`}
            >
              <p className="text-sm font-medium">{m === "presential" ? "Presencial" : "Virtual"}</p>
              <p className="text-[10px] mt-0.5 opacity-75">
                {m === "presential" ? "Grabar con micrófono" : "Subir archivo de audio"}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Grabador o uploader */}
      {mode === "presential" ? (
        <SessionRecorder patientId={selected!.id} hasConsent={hasConsent} />
      ) : (
        <AudioUploader patientId={selected!.id} hasConsent={hasConsent} />
      )}

      <div className="p-3 bg-[var(--psy-blue-light)] rounded-lg">
        <p className="text-xs text-[var(--psy-blue)] font-medium mb-0.5">
          {mode === "presential" ? "Modo presencial" : "Modo virtual"}
        </p>
        <p className="text-xs text-[var(--psy-ink)]/70 leading-relaxed">
          {mode === "presential"
            ? "Graba directamente desde este dispositivo. El audio se procesa con Whisper en español."
            : "Sube la grabación de la sesión virtual (MP3, M4A, WAV). Se transcribirá con Whisper."}
        </p>
      </div>
    </div>
  );
}
