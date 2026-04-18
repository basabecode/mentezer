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
    if (!file || !hasConsent) return;

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
    <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-xl p-6 space-y-4">
      {!hasConsent && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--psy-amber-light)] rounded-lg">
          <AlertTriangle size={14} className="text-[var(--psy-amber)] shrink-0" />
          <p className="text-xs text-[var(--psy-amber)] font-medium">
            Requiere consentimiento informado firmado.
          </p>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => state === "idle" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[var(--psy-border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--psy-blue)]/40 hover:bg-[var(--psy-blue-light)]/30 transition-colors"
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
            <FileAudio size={20} className="text-[var(--psy-blue)] shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--psy-ink)] truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-[var(--psy-muted)]">{formatSize(file.size)}</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={24} className="text-[var(--psy-muted)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--psy-ink)]">Arrastra el audio aquí o haz clic</p>
            <p className="text-xs text-[var(--psy-muted)] mt-1">MP3, M4A, WAV, WebM — máximo {MAX_MB} MB</p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {state === "uploading" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--psy-muted)]">
            <span>Transcribiendo con Whisper...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--psy-cream)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--psy-blue)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-[var(--psy-red)] bg-[var(--psy-red-light)] px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {state === "done" && (
        <div className="flex items-center gap-2 text-sm text-[var(--psy-green)] bg-[var(--psy-green-light)] px-3 py-2.5 rounded-lg">
          <CheckCircle size={14} />
          Transcripción completada. Redirigiendo...
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || !hasConsent || ["creating", "uploading", "done"].includes(state)}
        className="w-full h-11 bg-[var(--psy-blue)] text-white rounded-xl text-sm font-medium hover:bg-[var(--psy-blue)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {["creating", "uploading"].includes(state) ? (
          <><Loader2 size={15} className="animate-spin" /> Procesando...</>
        ) : (
          <><Upload size={15} /> Transcribir sesión</>
        )}
      </button>

      <p className="text-[10px] text-[var(--psy-muted)] text-center">
        La grabación se cifra durante la transferencia y se elimina tras la transcripción.
      </p>
    </div>
  );
}
