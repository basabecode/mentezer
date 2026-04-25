"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  FileText,
  Mic,
  Sparkles,
  Flag,
  Settings,
  Square,
  MonitorPlay,
  Upload,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { SessionRecorder, type RecorderState } from "@/components/recorder/SessionRecorder";
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

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
    recorderState === "recording" ? "Grabando"
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

  const deleteNote = (id: string) => {
    setNotes((current) => current.filter((n) => n.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const startEditNote = (id: string, content: string) => {
    setEditingNoteId(id);
    setEditingNoteText(content);
  };

  const saveEditNote = (id: string) => {
    const text = editingNoteText.trim();
    if (!text) return;
    setNotes((current) =>
      current.map((n) => (n.id === id ? { ...n, content: text } : n)),
    );
    setEditingNoteId(null);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEditNote(id);
    }
    if (e.key === "Escape") cancelEditNote();
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
          <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
            {/* Grabador */}
            <div className="flex flex-col">
              <SessionRecorder
                patientId={patientId}
                hasConsent={hasConsent}
                recordingPermission={livePermission}
                onStateChange={setRecorderState}
                onDurationChange={setDuration}
                onPreflightChange={setPreflightReady}
                externalFinalizeSignal={externalFinalizeSignal}
                captureSource={captureSource}
                settings={settings}
              />
            </div>

            {/* Panel de transcripción */}
            <section
              className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border bg-white"
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
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center px-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border bg-psy-cream shadow-sm" style={{ borderColor: "var(--psy-warm-border)" }}>
                        <Mic size={24} className="text-psy-blue/60" />
                      </div>
                      <p className="mt-4 font-serif text-[1.1rem] font-semibold tracking-tight text-psy-ink">El audio se convierte en texto</p>
                      <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed text-psy-muted">
                        Mientras grabas, Mentezer procesa en segundo plano. Cuando finalices la sesión, aquí aparecerá la transcripción completa para extraer tus citas clínicas.
                      </p>
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

          {/* ── Acciones: dos tarjetas en grid ── */}
          <div className="grid gap-3 lg:grid-cols-2 lg:items-start">

            {/* Tarjeta izquierda — Configuración de grabación + Marcas */}
            <div
              className="flex flex-col gap-3 rounded-2xl border border-psy-blue/15 bg-psy-blue-light/40 px-4 py-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-psy-blue-light">
                  <Settings size={13} className="text-psy-blue" />
                </div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">
                  Grabación
                </p>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen((v) => !v)}
                    title="Configuración de grabación"
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition",
                      settingsOpen
                        ? "border-psy-blue/30 bg-psy-blue-light text-psy-blue"
                        : "border-psy-border bg-white text-psy-muted hover:text-psy-ink",
                    )}
                  >
                    <Settings size={12} />
                    {settingsOpen ? "Cerrar ajustes" : "Ajustes de audio"}
                  </button>
                  <button
                    type="button"
                    onClick={triggerFinalize}
                    disabled={!canFinalize}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-psy-ink px-3 text-xs font-medium text-white transition hover:bg-psy-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Square size={11} />
                    Finalizar
                  </button>
                </div>
              </div>

              {/* Panel de configuración inline */}
              {settingsOpen && (
                <RecordingSettingsPanel
                  settings={settings}
                  onChange={setSettings}
                  preflightReady={preflightReady}
                />
              )}

              {/* Estado cuando está colapsado */}
              {!settingsOpen && (
                <p className="text-xs text-psy-muted">
                  Ajusta micrófono, calidad y fuente de captura antes o durante la sesión.
                </p>
              )}

              {/* Lista de marcas clínicas */}
              {cuePoints.length > 0 && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: "var(--psy-warm-border)" }}>
                    <Flag size={11} className="text-psy-amber" />
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">Marcas</p>
                    <span
                      className="ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-bold text-psy-muted"
                      style={{ borderColor: "var(--psy-warm-border)" }}
                    >
                      {cuePoints.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {cuePoints.map((cue) => (
                      <div
                        key={cue.id}
                        className="flex items-center gap-3 rounded-xl border px-3 py-2"
                        style={{ borderColor: "var(--psy-warm-border)", background: "var(--psy-paper)" }}
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-psy-amber" />
                        <p className="flex-1 text-[13px] font-medium text-psy-ink">{cue.label}</p>
                        <span className="font-mono text-[10px] text-psy-muted">{cue.timestampLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta derecha — Notas rápidas + lista de notas guardadas */}
            <div
              className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-4"
              style={{ borderColor: "var(--psy-warm-border)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-psy-amber-light">
                  <FileText size={13} className="text-psy-amber" />
                </div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">
                  Notas rápidas
                </p>
                <button
                  type="button"
                  onClick={addCuePoint}
                  disabled={duration <= 0}
                  title="Marcar momento clínico"
                  className={cn(
                    "ml-auto inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                    duration > 0
                      ? "border-psy-amber/40 bg-psy-amber-light/60 text-psy-amber hover:bg-psy-amber-light"
                      : "border-psy-border bg-white text-psy-muted",
                  )}
                >
                  <Flag size={12} />
                  Marcar momento
                </button>
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-1">
                <textarea
                  ref={noteTextareaRef}
                  value={inlineNoteText}
                  onChange={(e) => setInlineNoteText(e.target.value)}
                  onKeyDown={handleNoteKeyDown}
                  rows={2}
                  placeholder="Nota rápida... Enter para guardar"
                  className="calm-input w-full resize-none text-sm leading-relaxed"
                  style={{ minHeight: "64px", maxHeight: "120px" }}
                />
                {inlineNoteText.length > 0 ? (
                  <p className="pl-1 text-[10px] text-psy-muted">Enter ↵ para guardar · Shift+Enter nueva línea</p>
                ) : (
                  <p className="pl-1 text-[10px] text-psy-muted">Observaciones clínicas se guardan al presionar Enter</p>
                )}
              </div>

              {/* Lista de notas guardadas */}
              {notes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: "var(--psy-warm-border)" }}>
                    <FileText size={11} className="text-psy-blue" />
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-psy-ink">Guardadas</p>
                    <span
                      className="ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-bold text-psy-muted"
                      style={{ borderColor: "var(--psy-warm-border)" }}
                    >
                      {notes.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="group rounded-xl border border-psy-blue/12 bg-psy-blue-light/20 px-3 py-2.5"
                      >
                        {editingNoteId === note.id ? (
                          /* Modo edición */
                          <div className="flex flex-col gap-1.5">
                            <textarea
                              autoFocus
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(e, note.id)}
                              rows={2}
                              className="calm-input w-full resize-none text-sm leading-relaxed"
                              style={{ minHeight: "52px", maxHeight: "120px" }}
                            />
                            <div className="flex items-center gap-1.5">
                              <p className="flex-1 text-[10px] text-psy-muted">Enter ↵ guardar · Esc cancelar</p>
                              <button
                                type="button"
                                onClick={() => saveEditNote(note.id)}
                                className="inline-flex h-6 items-center gap-1 rounded-lg bg-psy-blue px-2 text-[10px] font-medium text-white transition hover:bg-psy-blue/90"
                              >
                                <Check size={10} />
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditNote}
                                className="inline-flex h-6 items-center gap-1 rounded-lg border px-2 text-[10px] font-medium text-psy-muted transition hover:text-psy-ink"
                                style={{ borderColor: "var(--psy-warm-border)" }}
                              >
                                <X size={10} />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Modo lectura */
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] leading-5 text-psy-ink">{note.content}</p>
                              <p className="mt-1 font-mono text-[10px] text-psy-muted">{note.timestampLabel}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => startEditNote(note.id, note.content)}
                                title="Editar nota"
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-psy-muted transition hover:bg-psy-blue/10 hover:text-psy-blue"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNote(note.id)}
                                title="Eliminar nota"
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-psy-muted transition hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
