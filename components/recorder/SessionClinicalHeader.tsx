"use client";

import type { RecorderState } from "@/components/recorder/SessionRecorder";

interface SessionClinicalHeaderProps {
  patientName: string;
  hasConsent: boolean;
  modeLabel: string;
  recorderState: RecorderState;
  duration: number;
  lastSavedAt: string | null;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "00")}:${String(seconds).padStart(2, "00")}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDur(s: number) {
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

function formatSavedAt(savedAt: string | null) {
  if (!savedAt) return null;
  return new Date(savedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function SessionClinicalHeader({
  patientName,
  hasConsent,
  modeLabel,
  recorderState,
  duration,
  lastSavedAt,
}: SessionClinicalHeaderProps) {
  const isRecording = recorderState === "recording";
  const isPaused = recorderState === "paused";
  const isError = recorderState === "error";
  const isDone = recorderState === "done";

  const stateTone =
    isRecording ? "border-psy-green/20 bg-psy-green-light text-psy-green"
    : isPaused ? "border-psy-amber/20 bg-psy-amber-light text-psy-amber"
    : isError ? "border-psy-red/20 bg-psy-red-light text-psy-red"
    : isDone ? "border-[#d7eaf2] bg-[#edf7fb] text-[#3f7d95]"
    : "border-psy-border bg-[#f8faf9] text-psy-muted";

  const stateLabel =
    isRecording ? "Grabando"
    : isPaused ? "Pausada"
    : recorderState === "uploading" ? "Procesando"
    : isDone ? "Completada"
    : isError ? "Error"
    : "Preparando";

  const todayLabel = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const savedAt = formatSavedAt(lastSavedAt);

  return (
    <section
      id="session-overview"
      className="scroll-mt-20 rounded-[1.5rem] border border-psy-warm-border bg-[linear-gradient(180deg,oklch(97% 0.02 265)_0%,#ffffff_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(13,34,50,0.04)] sm:px-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#e9f4f8] text-sm font-semibold text-[#4f8ea7] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {patientName
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("")}
        </div>

        {/* Nombre */}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-blue/70">Sesión activa · {modeLabel}</p>
          <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-psy-ink">
            {patientName}
          </h1>
        </div>

        {/* Chips de estado */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Consentimiento */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${hasConsent ? "bg-psy-green-light text-psy-green" : "bg-psy-amber-light text-psy-amber"}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasConsent ? "Consentimiento" : "Sin consentimiento"}
          </span>

          {/* Fecha */}
          <span className="rounded-full border border-[#dbe8ee] bg-white/90 px-2.5 py-1 text-[11px] text-psy-muted">
            {todayLabel}
          </span>

          {/* Duración si activo */}
          {duration > 0 && (
            <span className="rounded-full border border-[#ddd4f4] bg-[#faf7ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#7857d5]">
              {formatDur(duration)}
            </span>
          )}

          {/* Borrador si existe */}
          {savedAt && (
            <span className="rounded-full border border-[#dce8dd] bg-[#f5fbf5] px-2.5 py-1 text-[11px] text-[#5b8a61]">
              ↓ {savedAt}
            </span>
          )}

          {/* Estado grabadora */}
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${stateTone}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${isRecording ? "animate-pulse" : ""}`} />
            {stateLabel}
          </div>
        </div>
      </div>
    </section>
  );
}
