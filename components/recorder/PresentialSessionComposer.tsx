"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Mic, Sparkles } from "lucide-react";
import { SessionRecorder, type RecorderState } from "@/components/recorder/SessionRecorder";
import { AudioPreflightPanel } from "@/components/recorder/AudioPreflightPanel";
import { RecordingSettingsPanel } from "@/components/recorder/RecordingSettingsPanel";
import { type LiveTranscriptSegment } from "@/components/recorder/LiveTranscriptPanel";
import { SessionQuickActions } from "@/components/recorder/SessionQuickActions";
import { SessionClinicalHeader } from "@/components/recorder/SessionClinicalHeader";
import { useSessionDraft } from "@/components/recorder/useSessionDraft";
import { SessionMobileDock } from "@/components/recorder/SessionMobileDock";

interface PresentialSessionComposerProps {
  patientId: string;
  patientName: string;
  hasConsent: boolean;
  recordingPermission: "accepted" | "declined" | null;
}

const transcriptSeeds: Array<Omit<LiveTranscriptSegment, "id" | "timestampLabel">> = [
  { speaker: "Paciente", text: "He estado sintiendo mucha ansiedad ultimamente, sobre todo por las noches.", live: true },
  { speaker: "Psicologo", text: "Puedes contarme que situaciones te generan mas ansiedad esta semana?", live: true },
  { speaker: "Paciente", text: "Pienso mucho en el trabajo y me cuesta desconectarme al final del dia.", live: true },
  { speaker: "Psicologo", text: "Vamos a revisar detonantes, cuerpo y pensamientos para ordenar esa secuencia.", live: true },
];

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
}: PresentialSessionComposerProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [preflightReady, setPreflightReady] = useState(false);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<LiveTranscriptSegment[]>([]);
  const [externalFinalizeSignal, setExternalFinalizeSignal] = useState(0);
  const [activeAnchor, setActiveAnchor] = useState("session-main");
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
    lastSavedAt,
  } = useSessionDraft(patientId);

  const transcriptCursorRef = useRef(0);

  useEffect(() => {
    if (recorderState !== "recording") return;

    const interval = window.setInterval(() => {
      setSegments((current) => {
        if (transcriptCursorRef.current >= transcriptSeeds.length) return current;

        const nextIndex = transcriptCursorRef.current;
        transcriptCursorRef.current += 1;

        return [
          ...current,
          {
            ...transcriptSeeds[nextIndex],
            id: `segment-${nextIndex + 1}`,
            timestampLabel: formatTimestamp(Math.max(duration + nextIndex * 8, nextIndex * 8 + 12)),
          },
        ];
      });
    }, 4200);

    return () => window.clearInterval(interval);
  }, [duration, recorderState]);

  useEffect(() => {
    if (recorderState === "idle" && duration === 0) {
      transcriptCursorRef.current = 0;
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
      overview: `Sesion centrada en ansiedad anticipatoria, con foco en carga laboral, rumiacion nocturna y necesidad de ordenar detonantes en ${patientName}.`,
      keyPoints: [
        segments[0]?.text ?? "La captura aun no genera segmentos suficientes.",
        notes[0]?.content ?? "No hay notas clinicas registradas todavia.",
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
    setActiveAnchor("session-notes");
  };

  const addQuickNote = () => {
    setNotes((current) => [
      {
        id: `note-${current.length + 1}`,
        content: duration > 0
          ? `Observacion breve en ${formatTimestamp(duration)}: se detecta un cambio emocional relevante.`
          : "Nota previa: preparar motivo de consulta y apertura de sesion.",
        timestampLabel: formatTimestamp(duration),
      },
      ...current,
    ]);
    setActiveAnchor("session-notes");
  };

  const openSummary = () => {
    setSummaryRequested(true);
    setActiveView("analysis");
    setActiveAnchor("session-main");
  };

  const triggerFinalize = () => {
    setExternalFinalizeSignal((current) => current + 1);
    setActiveAnchor("session-main");
  };

  const showTranscriptContent = activeView === "transcript";
  const canFinalize = recorderState === "recording" || recorderState === "paused";

  return (
    <div className="flex flex-col gap-3 pb-24 lg:pb-6 xl:pb-0">
      {/* ── Header compacto ── */}
      <SessionClinicalHeader
        patientName={patientName}
        hasConsent={hasConsent}
        modeLabel="Presencial"
        recorderState={recorderState}
        duration={duration}
        lastSavedAt={lastSavedAt}
      />

      {/* ── Layout principal ── */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[340px_minmax(0,1fr)_280px] 2xl:grid-cols-[360px_minmax(0,1fr)_300px]">

        {/* ── COLUMNA 1: Grabador + Preflight ── lg:col1 | xl:col1 */}
        <div id="session-main" className="scroll-mt-20 order-2 flex flex-col gap-3 lg:order-2 xl:order-none xl:sticky xl:top-4 xl:self-start">
          <SessionRecorder
            patientId={patientId}
            hasConsent={hasConsent}
            recordingPermission={recordingPermission}
            selectedDeviceId={selectedDeviceId}
            preflightReady={preflightReady}
            onStateChange={setRecorderState}
            onDurationChange={setDuration}
            externalFinalizeSignal={externalFinalizeSignal}
          />

          {/* Preflight pegado al grabador */}
          <AudioPreflightPanel
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={setSelectedDeviceId}
            onValidatedChange={setPreflightReady}
          />

          {/* Configuración de grabación compactada */}
          <RecordingSettingsPanel
            settings={settings}
            onChange={setSettings}
            preflightReady={preflightReady}
          />
        </div>

        {/* ── COLUMNA 2: Transcripción / Análisis ── lg: full-width top | xl: middle col */}
        <section
          id="session-transcript"
          className="scroll-mt-20 order-1 overflow-hidden rounded-[1.6rem] border border-[#d9e7ee] bg-[linear-gradient(180deg,#f5f9fb_0%,#ffffff_100%)] shadow-[0_8px_20px_rgba(13,34,50,0.04)] lg:col-span-2 lg:order-1 xl:col-span-1 xl:order-none"
        >
          {/* Tab bar */}
          <div className="flex items-center justify-between gap-3 border-b border-[#dbe8ee] bg-[linear-gradient(180deg,#eef5f8_0%,#f8fbfc_100%)] px-4 py-2.5">
            <div className="inline-flex items-center gap-1 rounded-xl bg-white/90 p-1 shadow-[0_4px_10px_rgba(13,34,50,0.04)]">
              <button
                type="button"
                onClick={() => setActiveView("transcript")}
                aria-pressed={showTranscriptContent}
                className={`rounded-[0.65rem] px-3.5 py-1.5 text-sm font-medium transition ${showTranscriptContent ? "bg-[#e8f3f8] text-[#3f7d95]" : "text-psy-muted hover:text-psy-ink"}`}
              >
                Transcripción
              </button>
              <button
                type="button"
                onClick={() => setActiveView("analysis")}
                aria-pressed={!showTranscriptContent}
                className={`rounded-[0.65rem] px-3.5 py-1.5 text-sm font-medium transition ${!showTranscriptContent ? "bg-[#f0eaff] text-[#7857d5]" : "text-psy-muted hover:text-psy-ink"}`}
              >
                Análisis IA
              </button>
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${showTranscriptContent ? "border-[#d7eaf2] bg-[#edf7fb] text-[#3f7d95]" : "border-[#eadfff] bg-[#f6f1ff] text-[#7857d5]"}`}
            >
              {showTranscriptContent ? <Mic size={12} /> : <Sparkles size={12} />}
              {showTranscriptContent ? transcriptStatusLabel : summaryRequested ? "Listo" : "Sin generar"}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4">
            {showTranscriptContent ? (
              segments.length > 0 ? (
                <div className="space-y-2.5" aria-live="polite">
                  {segments.slice(-6).map((segment) => (
                    <article
                      key={segment.id}
                      className={`rounded-[1rem] border px-3.5 py-3 ${segment.speaker === "Paciente" ? "border-[#e4dcff] bg-[#f8f4ff]" : "border-[#d8ebf2] bg-[#f2f9fc]"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${segment.speaker === "Paciente" ? "bg-[#ede2ff] text-[#7857d5]" : "bg-[#e0f1f7] text-[#3f7eae]"}`}>
                          {segment.speaker}
                        </span>
                        <span className="text-[11px] text-psy-muted">{segment.timestampLabel}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-psy-ink">{segment.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[260px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f3f8] text-[#4e8ca7]">
                      <Mic size={18} />
                    </div>
                    <p className="mt-3 text-base font-medium text-psy-ink">Sin transcripción aún</p>
                    <p className="mt-1 text-sm text-psy-muted">Inicia la grabación para ver fragmentos aquí.</p>
                  </div>
                </div>
              )
            ) : (
              clinicalSummary ? (
                <div className="space-y-3">
                  <div className="rounded-[1rem] border border-[#e6dcff] bg-[#f8f4ff] px-4 py-3.5">
                    <p className="text-sm leading-7 text-psy-ink">{clinicalSummary.overview}</p>
                  </div>
                  <div className="grid gap-2">
                    {clinicalSummary.keyPoints.map((item, index) => (
                      <div key={index} className="rounded-[0.9rem] border border-[#e6dcff] bg-white px-3.5 py-2.5 text-sm leading-6 text-psy-ink">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[260px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0e6ff] text-[#7857d5]">
                      <Bot size={18} />
                    </div>
                    <p className="mt-3 text-base font-medium text-psy-ink">Resumen IA en espera</p>
                    <p className="mt-1 text-sm text-psy-muted">Activa cuando haya transcript o notas.</p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* ── COLUMNA 3: Acciones + Marcas + Notas ── lg: col2 right | xl: col3 */}
        <div id="session-notes" className="scroll-mt-20 order-3 flex flex-col gap-3 lg:order-3 xl:order-none">
          <SessionQuickActions
            canMark={duration > 0}
            canSummarize={segments.length > 0 || notes.length > 0}
            canFinalize={canFinalize}
            cueCount={cuePoints.length}
            noteCount={notes.length}
            onAddCue={addCuePoint}
            onAddNote={addQuickNote}
            onGenerateSummary={openSummary}
            onFinalize={triggerFinalize}
          />

          {/* Marcas clínicas */}
          <div className="rounded-[1.5rem] border border-[#ddd4f4] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(13,34,50,0.03)]">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7857d5]">Marcas</p>
              <span className="rounded-full bg-[#f1e8ff] px-2 py-0.5 text-[10px] font-medium text-[#7857d5]">{cuePoints.length}</span>
            </div>
            <div className="mt-2.5 grid gap-1.5">
              {cuePoints.length > 0 ? cuePoints.map((cue) => (
                <div key={cue.id} className="rounded-[0.85rem] border border-[#e6dcff] bg-white px-3 py-2.5">
                  <p className="text-sm font-medium text-psy-ink">{cue.label}</p>
                  <p className="mt-0.5 text-[11px] text-psy-muted">{cue.timestampLabel}</p>
                </div>
              )) : (
                <p className="rounded-[0.85rem] border border-dashed border-[#e6dcff] bg-white/90 px-3 py-2.5 text-sm text-psy-muted">Sin marcas clínicas.</p>
              )}
            </div>
          </div>

          {/* Notas rápidas */}
          <div className="rounded-[1.5rem] border border-[#e6ddcf] bg-[linear-gradient(180deg,#fff9f1_0%,#ffffff_100%)] p-4 shadow-[0_8px_20px_rgba(13,34,50,0.03)]">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#bf7b32]">Notas rápidas</p>
              <span className="rounded-full bg-[#fff1de] px-2 py-0.5 text-[10px] font-medium text-[#bf7b32]">{notes.length}</span>
            </div>
            <div className="mt-2.5 grid gap-1.5">
              {notes.length > 0 ? notes.map((note) => (
                <div key={note.id} className="rounded-[0.85rem] border border-[#f0e3d2] bg-white px-3 py-2.5">
                  <p className="text-sm leading-6 text-psy-ink">{note.content}</p>
                  <p className="mt-0.5 text-[11px] text-psy-muted">{note.timestampLabel}</p>
                </div>
              )) : (
                <p className="rounded-[0.85rem] border border-dashed border-[#f0e3d2] bg-white/90 px-3 py-2.5 text-sm text-psy-muted">Sin notas registradas.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <SessionMobileDock activeAnchor={activeAnchor} onNavigate={setActiveAnchor} />
    </div>
  );
}
