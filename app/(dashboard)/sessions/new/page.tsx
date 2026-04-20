import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AudioUploader } from "@/components/recorder/AudioUploader";
import { PresentialSessionComposer } from "@/components/recorder/PresentialSessionComposer";

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
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/patients" className="rounded-lg p-1.5 text-psy-muted transition-colors hover:bg-psy-paper hover:text-psy-ink">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl font-semibold text-psy-ink">Nueva sesión</h1>
          <p className="mt-0.5 text-xs text-psy-muted">Paciente: {selected?.name}</p>
        </div>
      </div>

      {/* Selector de paciente */}
      {patients.length > 1 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-psy-ink">Paciente</label>
          <div className="flex flex-wrap gap-2">
            {patients.map((p) => (
              <Link
                key={p.id}
                href={`/sessions/new?patient=${p.id}&mode=${mode}`}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  p.id === selected?.id
                    ? "border-psy-blue bg-psy-blue text-white"
                    : "border-psy-border bg-psy-paper text-psy-ink hover:border-psy-blue/40"
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
        <label className="mb-1.5 block text-sm font-medium text-psy-ink">Tipo de sesión</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["presential", "virtual"] as const).map((m) => (
            <Link
              key={m}
              href={`/sessions/new?patient=${selected?.id}&mode=${m}`}
              className={`rounded-xl border p-3 text-center transition-colors ${
                mode === m
                  ? "border-psy-blue bg-psy-blue-light text-psy-blue"
                  : "border-psy-border bg-psy-paper text-psy-muted hover:border-psy-blue/30"
              }`}
            >
              <p className="text-sm font-medium">{m === "presential" ? "Presencial" : "Virtual"}</p>
              <p className="mt-0.5 text-xs opacity-75">
                {m === "presential" ? "Grabar con micrófono" : "Subir archivo de audio"}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Grabador o uploader */}
      <div className="mx-auto w-full max-w-3xl">
        {mode === "presential" ? (
          <PresentialSessionComposer patientId={selected!.id} hasConsent={hasConsent} />
        ) : (
          <AudioUploader patientId={selected!.id} hasConsent={hasConsent} />
        )}
      </div>

      {mode === "virtual" && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-psy-border/70 bg-psy-blue-light/45 px-3 py-2.5">
          <p className="mb-0.5 text-[11px] font-medium text-psy-blue">Modo virtual</p>
          <p className="text-[11px] leading-relaxed text-psy-muted">
            Sube la grabación de la sesión virtual (MP3, M4A, WAV). Se transcribirá con Whisper.
          </p>
        </div>
      )}
    </div>
  );
}
