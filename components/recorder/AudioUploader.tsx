"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileAudio, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

type UploaderState = "idle" | "creating" | "uploading" | "done" | "error";

interface AudioUploaderProps {
  patientId: string;
  hasConsent: boolean;
}

const ACCEPTED = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/m4a", "audio/x-m4a", "audio/webm", "audio/ogg"];
const MAX_MB = 100;

export function AudioUploader({ patientId, hasConsent }: AudioUploaderProps) {
  const router = useRouter();
  const [state, setState] = useState<UploaderState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      setError("Formato no soportado. Usa MP3, M4A, WAV o WebM.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    // TEMPORAL BYPASS
    if (!file) return;

    setState("creating");
    setError(null);

    // Crear sesión virtual
    let sessionId: string;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, mode: "virtual" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      sessionId = data.sessionId;
    } catch {
      setError("Error al crear la sesión. Intenta de nuevo.");
      setState("error");
      return;
    }

    setState("uploading");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("audio", file, file.name);
      formData.append("sessionId", sessionId);

      setProgress(30);
      const res = await fetch("/api/sessions/transcribe", {
        method: "POST",
        body: formData,
      });
      setProgress(90);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al transcribir");
      }

      setProgress(100);
      setState("done");
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el audio");
      setState("error");
    }
  };

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

  return (
    <div className="space-y-4 rounded-xl border border-psy-border bg-psy-paper p-6">
      {/* TEMPORAL BYPASS: Ocultando el bloqueo de UI */}
      {/* {!hasConsent && (
        <div className="flex items-center gap-2 rounded-lg bg-psy-amber-light px-3 py-2.5">
          <AlertTriangle size={14} className="shrink-0 text-psy-amber" />
          <p className="text-xs font-medium text-psy-amber">
            Requiere consentimiento informado firmado.
          </p>
        </div>
      )} */}

      {/* Drop zone */}
      <div
        onClick={() => state === "idle" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-psy-border p-8 text-center transition-colors hover:border-psy-blue/40 hover:bg-psy-blue-light/30"
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileAudio size={20} className="shrink-0 text-psy-blue" />
            <div className="text-left">
              <p className="max-w-xs truncate text-sm font-medium text-psy-ink">{file.name}</p>
              <p className="text-xs text-psy-muted">{formatSize(file.size)}</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={24} className="mx-auto mb-2 text-psy-muted" />
            <p className="text-sm font-medium text-psy-ink">Arrastra el audio aquí o haz clic</p>
            <p className="mt-1 text-xs text-psy-muted">MP3, M4A, WAV, WebM — máximo {MAX_MB} MB</p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {state === "uploading" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-psy-muted">
            <span>Transcribiendo con Whisper...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-psy-cream">
            <div
              className="h-full rounded-full bg-psy-blue transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-psy-red-light px-3 py-2 text-xs text-psy-red">
          {error}
        </p>
      )}

      {state === "done" && (
        <div className="flex items-center gap-2 rounded-lg bg-psy-green-light px-3 py-2.5 text-sm text-psy-green">
          <CheckCircle size={14} />
          Transcripción completada. Redirigiendo...
        </div>
      )}

      <button
        onClick={handleSubmit}
        // TEMPORAL BYPASS: Eliminado el requerimiento de !hasConsent
        disabled={!file || ["creating", "uploading", "done"].includes(state)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-psy-blue text-sm font-medium text-white transition-all hover:bg-psy-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {["creating", "uploading"].includes(state) ? (
          <><Loader2 size={15} className="animate-spin" /> Procesando...</>
        ) : (
          <><Upload size={15} /> Transcribir sesión</>
        )}
      </button>

      <p className="text-center text-xs text-psy-muted">
        La grabación se cifra durante la transferencia y se elimina tras la transcripción.
      </p>
    </div>
  );
}
