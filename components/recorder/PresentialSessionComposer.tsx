"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Mic,
  Sparkles,
  Flag,
  Settings,
  Square,
  MonitorPlay,
  Upload,
} from "lucide-react";
import { SessionRecorder, type RecorderState } from "@/components/recorder/SessionRecorder";
import { AudioPreflightPanel } from "@/components/recorder/AudioPreflightPanel";
import { RecordingSettingsPanel } from "@/components/recorder/RecordingSettingsPanel";
import { type LiveTranscriptSegment } from "@/components/recorder/LiveTranscriptPanel";
import { SessionConfigBar } from "@/components/recorder/SessionConfigBar";
import { AudioUploader } from "@/components/recorder/AudioUploader";
import { useSessionDraft } from "@/components/recorder/useSessionDraft";
import { cn } from "@/lib/utils/cn";

export interface PresentialSessionComposerProps {
  patientId: string;
  patientName: string;
  hasConsent: boolean;
  recordingPermission: "accepted" | "declined" | null;
  mode: "presential" | "virtual";
}

function formatTimestamp(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PresentialSessionComposer({
  patientId,
  patientName,
  hasConsent,
  recordingPermission,
  mode,
}: PresentialSessionComposerProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [preflightReady, setPreflightReady] = useState(false);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<LiveTranscriptSegment[]>([]);
  const [externalFinalizeSignal, setExternalFinalizeSignal] = useState(0);

  // Estado local nuevo
  const [livePermission, setLivePermission] = useState<"accepted" | "declined" | null>(recordingPermission);
  const [captureSource, setCaptureSource] = useState<"mic" | "screen">(mode === "virtual" ? "screen" : "mic");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inlineNoteText, setInlineNoteText] = useState("");
  const [showUploader, setShowUploader] = useState(false);

  const {
    activeView,
    setActiveView,
    settings,
    setSettings,
    cuePoints,
    setCuePoints,
    notes,
    setNotes,
    summaryRequested,
    setSummaryRequested,
  } = useSessionDraft(patientId);

  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (recorderState === "idle" && duration === 0) {
      setSegments([]);
    }
  }, [duration, recorderState]);

  const transcriptStatusLabel =
    recorderState === "recording" ? "En vivo"
    : recorderState === "paused" ? "Pausada"
    : recorderState === "uploading" ? "Procesando"
    : segments.length > 0 ? "Capturada"
    : "Lista";

  const clinicalSummary = useMemo(() => {
    if (!summaryRequested && segments.length === 0 && notes.length === 0) return null;
    return {
      overview: `Resumen preliminar de ${patientName} basado solo en notas rápidas y marcas locales de esta captura. El análisis clínico completo se genera después de transcribir la sesión.`,
      keyPoints: [
        segments[0]?.text ?? "La transcripción real se genera al finalizar y procesar el audio.",
        notes[0]?.content ?? "No hay notas clínicas rápidas registradas todavía.",
        cuePoints[0] ? `Existe una marca relevante en ${cuePoints[0].timestampLabel}.` : "No se registran marcas clinicas todavia.",
      ],
    };
  }, [cuePoints, notes, patientName, segments, summaryRequested]);

  const addCuePoint = () => {
    if (duration <= 0) return;
    setCuePoints((current) => [
      {
        id: `cue-${current.length + 1}`,
        label: `Marca ${current.length + 1}`,
        timestampLabel: formatTimestamp(duration),
      },
      ...current,
    ]);
  };

  const submitInlineNote = () => {
    const text = inlineNoteText.trim();
    if (!text) return;
    setNotes((current) => [
      {
        id: `note-${current.length + 1}`,
        content: text,
        timestampLabel: formatTimestamp(duration),
      },
      ...current,
    ]);
    setInlineNoteText("");
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitInlineNote();
    }
  };

  const triggerFinalize = () => {
    setExternalFinalizeSignal((current) => current + 1);
  };

  const openSummary = () => {
    setSummaryRequested(true);
    setActiveView("analysis");
  };

  const showTranscriptContent = activeView === "transcript";
  const canFinalize = recorderState === "recording" || recorderState === "paused";
  const hasMarksOrNotes = cuePoints.length > 0 || notes.length > 0;

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* Config bar sticky */}
      <SessionConfigBar
        patientId={patientId}
        patientName={patientName}
        hasConsent={hasConsent}
        mode={mode}
        permission={livePermission}
        onPermissionChange={setLivePermission}
        recorderState={recorderState}
      />

      {/* ── Banner modo virtual ── */}
      {mode === "virtual" && !showUploader && (
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-psy-blue-light">
              <MonitorPlay size={18} className="text-psy-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-psy-ink">Captura de audio desde Meet o Teams</p>
              <p className="mt-1 text-xs leading-relaxed text-psy-muted">
                El navegador te pedira seleccionar la pestana de la videollamada. Seleccionala y el audio quedara capturado automaticamente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCaptureSource("screen")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-psy-blue px-3.5 py-2 text-xs font-medium text-white transition hover:bg-psy-blue/90"
                >
                  <MonitorPlay size={13} />
                  Capturar llamada
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploader(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium text-psy-muted transition hover:text-psy-ink"
                  style={{ borderColor: "var(--psy-warm-border)" }}
                >
                  <Upload size={13} />
                  Tengo el audio grabado →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploader si eligió subir archivo */}
      {mode === "virtual" && showUploader && (
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--psy-warm-border)" }}>
          <button
            type="button"
            onClick={() => setShowUploader(false)}
            className="mb-3 text-xs text-psy-blue hover:underline"
          >
            ← Volver a captura en vivo
          </button>
          <AudioUploader patientId={patientId} hasConsent={hasConsent} />
        </div>
      )}

      {/* ── Layout principal: grabador + transcript ── */}
      {!showUploader && (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Grabador */}
            <div className="flex flex-col gap-3">
              <SessionRecorder
                patientId={patientId}
                hasConsent={hasConsent}
                recordingPermission={livePermission}
                selectedDeviceId={selectedDeviceId}
                preflightReady={preflightReady}
                onStateChange={setRecorderState}
                onDurationChange={setDuration}
                externalFinalizeSignal={externalFinalizeSignal}
                captureSource={captureSource}
                settings={settings}
              />

              {recorderState === "idle" && (
                <>
                  <AudioPreflightPanel
                    selectedDeviceId={selectedDeviceId}
                    onDeviceChange={setSelectedDeviceId}
                    onValidatedChange={setPreflightReady}
                  />
                  {settingsOpen && (
                    <RecordingSettingsPanel
                      settings={settings}
                      onChange={setSettings}
                      preflightReady={preflightReady}
                    />
                  )}
                </>
              )}
            </div>

            {/* Panel de transcripción */}
            <section
              className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: "var(--psy-warm-border)" }}
            >
              {/* Tab bar */}
              <div
                className="flex items-center justify-between gap-3 border-b px-4 py-2"
                style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
              >
                <div
                  className="inline-flex items-center gap-1 rounded-xl border p-1"
                  style={{ borderColor: "var(--psy-warm-border)", background: "white" }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveView("transcript")}
                    aria-pressed={showTranscriptContent}
                    className={cn(
                      "rounded-lg px-3 py-1 text-sm font-medium transition",
                      showTranscriptContent ? "bg-psy-blue-light text-psy-blue" : "text-psy-muted hover:text-psy-ink",
                    )}
                  >
                    Transcripcion
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveView("analysis"); openSummary(); }}
                    aria-pressed={!showTranscriptContent}
                    className={cn(
                      "rounded-lg px-3 py-1 text-sm font-medium transition",
                      !showTranscriptContent ? "bg-psy-green-light text-psy-green" : "text-psy-muted hover:text-psy-ink",
                    )}
                  >
                    Analisis IA
                  </button>
                </div>

                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                    showTranscriptContent
                      ? "border-psy-blue/20 bg-psy-blue/5 text-psy-blue"
                      : "border-psy-green/20 bg-psy-green/5 text-psy-green",
                  )}
                >
                  {showTranscriptContent ? <Mic size={12} /> : <Sparkles size={12} />}
                  {showTranscriptContent ? transcriptStatusLabel : summaryRequested ? "Listo" : "Sin generar"}
                </div>
              </div>

              {/* Contenido del transcript */}
              <div className="flex-1 overflow-y-auto p-4">
                {showTranscriptContent ? (
                  segments.length > 0 ? (
                    <div className="space-y-2" aria-live="polite">
                      {segments.slice(-8).map((segment) => (
                        <article
                          key={segment.id}
                          className={cn(
                            "rounded-xl border px-3 py-2.5",
                            segment.speaker === "Paciente"
                              ? "border-psy-border bg-psy-cream/50"
                              : "border-psy-blue/15 bg-psy-blue-light/30",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                segment.speaker === "Paciente"
                                  ? "border border-psy-border bg-white text-psy-ink"
                                  : "bg-psy-blue/10 text-psy-blue",
                              )}
                            >
                              {segment.speaker}
                            </span>
                            <span className="font-mono text-[10px] text-psy-muted">{segment.timestampLabel}</span>
                          </div>
                          <p className="mt-1.5 text-[13px] leading-6 text-psy-ink">{segment.text}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border bg-psy-paper text-psy-muted" style={{ borderColor: "var(--psy-warm-border)" }}>
                        <Mic size={16} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-psy-ink">Sin transcripcion aun</p>
                      <p className="mt-1 text-xs text-psy-muted">La transcripción real aparecerá al finalizar y procesar el audio.</p>
                    </div>
                  )
                ) : clinicalSummary ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-psy-green/20 bg-psy-green/5 px-4 py-3">
                      <p className="text-[13px] leading-6 text-psy-ink">{clinicalSummary.overview}</p>
                    </div>
                    <div className="grid gap-2">
                      {clinicalSummary.keyPoints.map((item, index) => (
                        <div key={index} className="rounded-lg border px-3.5 py-2.5 text-[13px] leading-6 text-psy-ink" style={{ borderColor: "var(--psy-warm-border)" }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border bg-psy-paper text-psy-muted" style={{ borderColor: "var(--psy-warm-border)" }}>
                      <Bot size={16} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-psy-ink">Resumen IA en espera</p>
                    <p className="mt-1 text-xs text-psy-muted">Activa cuando haya transcript o notas.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Barra de acciones ── */}
          <div
            className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"
            style={{ borderColor: "var(--psy-warm-border)" }}
          >
            {/* Marcar */}
            <button
              type="button"
              onClick={addCuePoint}
              disabled={duration <= 0}
              title="Marcar momento clinico"
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40",
                duration > 0
                  ? "border-psy-amber/40 bg-psy-amber-light/60 text-psy-amber hover:bg-psy-amber-light"
                  : "border-psy-border bg-white text-psy-muted",
              )}
            >
              <Flag size={15} />
            </button>

            {/* Textarea nota rápida */}
            <div className="relative flex-1">
              <textarea
                ref={noteTextareaRef}
                value={inlineNoteText}
                onChange={(e) => setInlineNoteText(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                rows={1}
                placeholder="Escribe una nota rapida... (Enter para guardar)"
                className="calm-input w-full resize-none text-sm"
                style={{ minHeight: "36px", maxHeight: "96px" }}
              />
            </div>

            {/* Configuración */}
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              title="Configuracion de grabacion"
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                settingsOpen
                  ? "border-psy-blue/30 bg-psy-blue-light text-psy-blue"
                  : "border-psy-border bg-white text-psy-muted hover:text-psy-ink",
              )}
            >
              <Settings size={15} />
            </button>

            {/* Finalizar */}
            <button
              type="button"
              onClick={triggerFinalize}
              disabled={!canFinalize}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-psy-ink px-4 text-xs font-medium text-white transition hover:bg-psy-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Square size={13} />
              Finalizar
            </button>
          </div>

          {/* Panel de settings cuando está abierto (y no idle) */}
          {settingsOpen && recorderState !== "idle" && (
            <div className="rounded-2xl border bg-white" style={{ borderColor: "var(--psy-warm-border)" }}>
              <RecordingSettingsPanel
                settings={settings}
                onChange={setSettings}
                preflightReady={preflightReady}
              />
            </div>
          )}

          {/* ── Marcas y Notas ── */}
          {hasMarksOrNotes && (
            <div className="grid gap-3 lg:grid-cols-2">
              {/* Marcas clínicas */}
              <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--psy-warm-border)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">Marcas Clinicas</p>
                  <span
                    className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
                  >
                    {cuePoints.length}
                  </span>
                </div>
                <div className="grid gap-1.5">
                  {cuePoints.map((cue) => (
                    <div
                      key={cue.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                      style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
                    >
                      <p className="text-[13px] font-medium text-psy-ink">{cue.label}</p>
                      <span className="font-mono text-[10px] text-psy-muted">{cue.timestampLabel}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas rápidas */}
              <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--psy-warm-border)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">Notas Rapidas</p>
                  <span
                    className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
                  >
                    {notes.length}
                  </span>
                </div>
                <div className="grid gap-1.5">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-psy-amber/20 bg-psy-amber-light/20 px-3 py-2">
                      <p className="text-[13px] leading-5 text-psy-ink">{note.content}</p>
                      <p className="mt-1 font-mono text-[10px] text-psy-muted">{note.timestampLabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
