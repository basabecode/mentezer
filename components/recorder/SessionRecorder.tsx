"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  Pause,
  Play,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type RecorderState =
  | "idle"
  | "creating"
  | "recording"
  | "paused"
  | "uploading"
  | "done"
  | "error";
type RecordingPermission = "accepted" | "declined" | null;

interface SessionRecorderProps {
  patientId: string;
  hasConsent: boolean;
  recordingPermission: RecordingPermission;
  selectedDeviceId: string | null;
  preflightReady: boolean;
  onStateChange?: (state: RecorderState) => void;
  onDurationChange?: (duration: number) => void;
  externalFinalizeSignal?: number;
}

export function SessionRecorder({
  patientId,
  hasConsent,
  recordingPermission,
  selectedDeviceId,
  preflightReady,
  onStateChange,
  onDurationChange,
  externalFinalizeSignal = 0,
}: SessionRecorderProps) {
  const router = useRouter();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [manualNote, setManualNote] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const externalFinalizeRef = useRef(0);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(avg / 128);
    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const clearRuntime = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    timerRef.current = null;
    animFrameRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setAudioLevel(0);
  }, []);

  const deleteDraftSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "No se pudo borrar la grabacion en borrador");
    }
  }, []);

  const startRecording = useCallback(async () => {
    // TEMPORAL: Bypass de verificaciones para pruebas
    // if (!preflightReady) {
    //   setError("Completa primero la prueba rapida de microfono.");
    //   return;
    // }

    // if (recordingPermission !== "accepted") {
    //   setError("Marca primero si el paciente autoriza o no la grabacion de esta sesion.");
    //   return;
    // }

    // if (!hasConsent) {
    //   setError("El paciente debe tener consentimiento informado firmado antes de grabar audio.");
    //   return;
    // }

    setState("creating");
    setDuration(0);
    setAudioLevel(0);
    setError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, mode: "presential" }),
      });
      if (!res.ok) throw new Error("No se pudo crear la sesion");
      const { sessionId } = await res.json();
      sessionIdRef.current = sessionId;
    } catch {
      setError("Error al iniciar la sesion. Intenta de nuevo.");
      setState("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.start(1000);
      setState("recording");

      timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    } catch {
      const orphanSessionId = sessionIdRef.current;
      clearRuntime();
      sessionIdRef.current = null;
      if (orphanSessionId) {
        try {
          await deleteDraftSession(orphanSessionId);
        } catch {
          // No bloqueamos al usuario si falla la limpieza del borrador.
        }
      }
      setError("No se pudo acceder al microfono. Verifica los permisos del navegador.");
      setState("error");
    }
  }, [clearRuntime, deleteDraftSession, hasConsent, patientId, preflightReady, recordingPermission, selectedDeviceId, updateAudioLevel]);

  const pauseRecording = useCallback(() => {
    mediaRecorderRef.current?.pause();
    setState("paused");
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);
  }, []);

  const resumeRecording = useCallback(() => {
    mediaRecorderRef.current?.resume();
    setState("recording");
    timerRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [updateAudioLevel]);

  const stopAndUpload = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    const sessionId = sessionIdRef.current;
    if (!recorder || !sessionId) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    const mimeType = recorder.mimeType;
    const chunks = [...chunksRef.current];
    clearRuntime();
    setState("uploading");

    try {
      const blob = new Blob(chunks, { type: mimeType });
      const formData = new FormData();
      formData.append("audio", blob, `session-${sessionId}.webm`);
      formData.append("sessionId", sessionId);

      const res = await fetch("/api/sessions/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      setState("done");
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el audio");
      setState("error");
    }
  }, [clearRuntime, router]);

  const discardRecording = useCallback(async () => {
    const draftSessionId = sessionIdRef.current;
    setDiscarding(true);
    setError(null);

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        await new Promise<void>((resolve) => {
          const recorder = mediaRecorderRef.current!;
          recorder.onstop = () => resolve();
          recorder.stop();
        });
      }

      clearRuntime();

      if (draftSessionId) {
        await deleteDraftSession(draftSessionId);
      }

      sessionIdRef.current = null;
      setDuration(0);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la grabacion borrador");
      setState("error");
    } finally {
      setDiscarding(false);
    }
  }, [clearRuntime, deleteDraftSession]);

  const saveWrittenDocumentation = useCallback(async () => {
    if (manualNote.trim().length < 30) {
      setError("Escribe al menos 30 caracteres para documentar la sesion por escrito.");
      return;
    }

    setManualSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          note: manualNote.trim(),
          mode: "presential",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo guardar la documentacion escrita");
      }

      router.push(`/sessions/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la sesion");
    } finally {
      setManualSaving(false);
    }
  }, [manualNote, patientId, router]);

  useEffect(() => {
    return () => {
      clearRuntime();
    };
  }, [clearRuntime]);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  useEffect(() => {
    onDurationChange?.(duration);
  }, [duration, onDurationChange]);

  useEffect(() => {
    if (externalFinalizeSignal === 0 || externalFinalizeSignal === externalFinalizeRef.current) return;

    externalFinalizeRef.current = externalFinalizeSignal;

    if (state === "recording" || state === "paused") {
      void stopAndUpload();
      return;
    }

    setError("No hay una grabacion activa para finalizar y procesar.");
  }, [externalFinalizeSignal, state, stopAndUpload]);

  const isActive = state === "recording" || state === "paused";
  const canRecord = true; // TEMPORAL: hasConsent && recordingPermission === "accepted";
  const isWrittenMode = false; // TEMPORAL: recordingPermission === "declined";
  const controlsDisabled = ["creating", "uploading", "done"].includes(state) || discarding;
  const hasDraftRecording = !!sessionIdRef.current || chunksRef.current.length > 0 || duration > 0;
  const statusCopy =
    state === "idle" ? "Lista para iniciar"
    : state === "creating" ? "Preparando sesion"
    : state === "recording" ? "Grabacion en curso"
    : state === "paused" ? "Grabacion en pausa"
    : state === "uploading" ? "Subiendo y transcribiendo"
    : state === "done" ? "Grabacion completada"
    : "Sesion interrumpida";

  const recorderBadgeCopy =
    state === "recording"
      ? "REC"
      : state === "paused"
        ? "PAUSE"
        : state === "done"
          ? "DONE"
          : canRecord && preflightReady
            ? "READY"
            : "STBY";

  const serviceItems = [
    {
      label: "Entrada",
      value: selectedDeviceId ? "Seleccionada" : "Por defecto",
    },
    {
      label: "Preflight",
      value: preflightReady ? "Validado" : "Pendiente",
    },
    {
      label: "Captura",
      value: canRecord && preflightReady ? "Lista" : "Bloqueada",
    },
  ];

  return (
    <div className="space-y-2.5">
      {!isWrittenMode && (
        <section className="w-full overflow-hidden rounded-[2rem] border border-[#171a1d] bg-[radial-gradient(circle_at_top,rgba(64,104,120,0.18),transparent_32%),linear-gradient(180deg,#1b1e20_0%,#111315_100%)] p-3 shadow-[0_22px_42px_rgba(13,16,18,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,22,24,0.98),rgba(12,13,15,1))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="rounded-[1.35rem] border border-[#30363a] bg-[linear-gradient(180deg,#0f1214_0%,#14181b_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em]",
                      state === "recording"
                        ? "border-[#743232] bg-[#462221] text-[#ffb4ac]"
                        : state === "paused"
                          ? "border-[#786b36] bg-[#40361f] text-[#f6df9f]"
                          : state === "done"
                            ? "border-[#2b5944] bg-[#19392f] text-[#9de0b8]"
                            : canRecord && preflightReady
                              ? "border-[#264a56] bg-[#17323a] text-[#9ed7e8]"
                              : "border-white/10 bg-white/5 text-white/55",
                    )}
                  >
                    {recorderBadgeCopy}
                  </span>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                    Clinic Rec
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">Estado</p>
                  <p className="mt-1 text-[11px] text-white/64">{statusCopy}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.1rem] border border-white/8 bg-black/20 px-3 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/32">Display</p>
                <p className="mt-2 font-mono text-[2.4rem] font-semibold leading-none tracking-[0.08em] text-white">
                  {formatDuration(duration)}
                </p>
                <div className="mt-3 grid gap-2">
                  {serviceItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-white/6 pb-1.5 last:border-b-0 last:pb-0">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{item.label}</span>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          item.label === "Captura" && canRecord && preflightReady
                            ? "text-[#ffb4ac]"
                            : item.label === "Preflight" && preflightReady
                              ? "text-[#9ed7e8]"
                              : "text-white/68",
                        )}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="flex items-end justify-center gap-1">
                  {Array.from({ length: 24 }).map((_, index) => {
                    const activeBoost = state === "recording" ? audioLevel : 0.14;
                    const waveFactor = 0.4 + ((index % 6) + 1) / 10;
                    const height = 14 + activeBoost * 54 * waveFactor;

                    return (
                      <span
                        key={index}
                        className={cn(
                          "w-1 rounded-full transition-all duration-150",
                          state === "recording"
                            ? "bg-[#9a7dff]"
                            : state === "paused"
                              ? "bg-[#f0c776]"
                              : state === "done"
                                ? "bg-[#9adab2]"
                                : "bg-white/22",
                        )}
                        style={{ height }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/32">Nivel</span>
                  <span className="text-[11px] text-white/62">
                    {state === "recording" ? "Activo" : state === "paused" ? "En pausa" : "Standby"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={startRecording}
                disabled={controlsDisabled || isActive || !canRecord} // TEMPORAL: Removido !preflightReady
                className={cn(
                  "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[1rem] border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                  "border-[#7a3532] bg-[linear-gradient(180deg,rgba(116,46,44,0.94),rgba(88,34,32,0.96))] text-[#ffe0db] hover:bg-[linear-gradient(180deg,rgba(129,52,49,0.98),rgba(95,37,35,1))]",
                )}
              >
                {state === "creating" ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                {state === "error" ? "Reiniciar" : "Iniciar"}
              </button>

              <button
                type="button"
                onClick={state === "recording" ? pauseRecording : resumeRecording}
                disabled={!isActive || controlsDisabled}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {state === "recording" ? <Pause size={16} /> : <Play size={16} />}
                {state === "recording" ? "Pausar" : "Reanudar"}
              </button>

              <button
                type="button"
                onClick={discardRecording}
                disabled={!hasDraftRecording || state === "uploading" || state === "creating" || discarding}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/72 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {discarding ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Borrar
              </button>

              <button
                type="button"
                onClick={stopAndUpload}
                disabled={!isActive || controlsDisabled}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[1rem] border border-[#23505e] bg-[linear-gradient(180deg,rgba(27,74,89,0.98),rgba(18,54,64,0.98))] px-4 text-sm font-medium text-[#c6f1ff] transition-colors hover:bg-[linear-gradient(180deg,rgba(31,84,100,1),rgba(20,59,70,1))] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {state === "uploading" ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                Finalizar
              </button>
            </div>
          </div>
        </section>
      )}

      {isWrittenMode && (
        <section className="rounded-[1.5rem] border border-psy-border bg-white px-4 py-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:px-5 sm:py-5">
          <div className="mx-auto max-w-2xl text-left">
            <div className="flex items-start gap-3 rounded-2xl border border-psy-blue/10 bg-psy-blue-light/45 px-4 py-3">
              <FileText size={18} className="mt-0.5 shrink-0 text-psy-blue" />
              <div>
                <p className="text-sm font-semibold text-psy-blue">Documentacion escrita activa</p>
                <p className="mt-1 text-xs leading-relaxed text-psy-muted">
                  El paciente no autorizo grabacion. Registra aqui los hallazgos y acuerdos de la sesion.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="manual-session-note" className="mb-2 block text-sm font-medium text-psy-ink">
                Nota clinica de la sesion
              </label>
              <textarea
                id="manual-session-note"
                value={manualNote}
                onChange={(event) => {
                  setManualNote(event.target.value);
                  if (error) setError(null);
                }}
                rows={8}
                placeholder="Ejemplo: paciente refiere ansiedad anticipatoria desde la ultima semana, se exploran detonantes, se refuerzan tecnicas de respiracion y se acuerda seguimiento..."
                className="calm-input min-h-[220px] resize-y px-4 py-3 text-sm leading-relaxed"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-psy-border bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-psy-ink">Guardar nota clinica</p>
                <p className="mt-1 text-[11px] leading-relaxed text-psy-muted">Registro sin microfono.</p>
              </div>
              <button
                type="button"
                onClick={saveWrittenDocumentation}
                disabled={manualSaving}
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-psy-blue/18 bg-psy-blue/10 px-5 py-3 text-sm font-medium text-psy-blue transition-colors hover:bg-psy-blue/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {manualSaving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Guardar documentacion
              </button>
            </div>
          </div>
        </section>
      )}

      {!recordingPermission && (
        <p className="rounded-[0.95rem] border border-psy-border bg-[#fbfcfc] px-3 py-2 text-[11px] text-psy-muted">
          Define el consentimiento en la columna izquierda para habilitar el flujo correcto.
        </p>
      )}

      {error && (
        <div className="flex w-full items-start gap-2 rounded-2xl border border-psy-red/20 bg-psy-red-light px-3.5 py-3 text-left">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-psy-red" />
          <p className="text-xs leading-relaxed text-psy-red">{error}</p>
        </div>
      )}
    </div>
  );
}
