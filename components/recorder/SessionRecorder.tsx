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
  CheckCircle2,
  FileText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type RecorderState =
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
  selectedDeviceId: string | null;
  preflightReady: boolean;
}

export function SessionRecorder({
  patientId,
  hasConsent,
  selectedDeviceId,
  preflightReady,
}: SessionRecorderProps) {
  const router = useRouter();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingPermission, setRecordingPermission] = useState<RecordingPermission>(null);
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
      throw new Error(data?.error ?? "No se pudo borrar la grabación en borrador");
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!preflightReady) {
      setError("Completa primero la verificación previa de micrófono y transcripción.");
      return;
    }

    if (recordingPermission !== "accepted") {
      setError("Marca primero si el paciente autoriza o no la grabación de esta sesión.");
      return;
    }

    if (!hasConsent) {
      setError("El paciente debe tener consentimiento informado firmado antes de grabar audio.");
      return;
    }

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
      if (!res.ok) throw new Error("No se pudo crear la sesión");
      const { sessionId } = await res.json();
      sessionIdRef.current = sessionId;
    } catch {
      setError("Error al iniciar la sesión. Intenta de nuevo.");
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
      setError("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
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
      setError(err instanceof Error ? err.message : "No se pudo borrar la grabación borrador");
      setState("error");
    } finally {
      setDiscarding(false);
    }
  }, [clearRuntime, deleteDraftSession]);

  const saveWrittenDocumentation = useCallback(async () => {
    if (manualNote.trim().length < 30) {
      setError("Escribe al menos 30 caracteres para documentar la sesión por escrito.");
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
        throw new Error(data.error ?? "No se pudo guardar la documentación escrita");
      }

      router.push(`/sessions/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la sesión");
    } finally {
      setManualSaving(false);
    }
  }, [manualNote, patientId, router]);

  useEffect(() => {
    return () => {
      clearRuntime();
    };
  }, [clearRuntime]);

  const isActive = state === "recording" || state === "paused";
  const canRecord = hasConsent && recordingPermission === "accepted";
  const isWrittenMode = recordingPermission === "declined";
  const controlsDisabled = ["creating", "uploading", "done"].includes(state) || discarding;
  const hasDraftRecording = !!sessionIdRef.current || chunksRef.current.length > 0 || duration > 0;
  const statusCopy =
    state === "idle" ? "Lista para iniciar grabación"
    : state === "creating" ? "Preparando la sesión"
    : state === "recording" ? "Grabación en curso"
    : state === "paused" ? "Grabación en pausa"
    : state === "uploading" ? "Subiendo audio y enviando a transcripción"
    : state === "done" ? "Grabación completada"
    : "Se interrumpió la grabación";

  const handlePermissionChange = (value: Exclude<RecordingPermission, null>) => {
    if (isActive || controlsDisabled) return;
    setRecordingPermission(value);
    setError(null);
  };

  const statusTone =
    state === "recording" ? "text-psy-red"
    : state === "paused" ? "text-psy-amber"
    : state === "done" ? "text-psy-green"
    : "text-psy-blue";

  return (
    <div className="calm-panel mx-auto w-full max-w-3xl overflow-hidden p-4 sm:p-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-psy-blue/80">
          Grabadora clínica
        </p>

        <h2 className="max-w-xl text-balance text-[1.85rem] font-semibold leading-tight text-psy-ink sm:text-[2.2rem]">
          Define la autorización de audio antes de iniciar la sesión.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-psy-muted">
          Si no autoriza grabación, la sesión continúa solo con documentación escrita.
        </p>

        {!hasConsent && (
          <div className="mt-4 flex w-full items-start justify-center gap-2 text-left">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-psy-amber" />
            <div>
              <p className="text-xs font-medium text-psy-amber">Consentimiento informado pendiente</p>
              <p className="mt-0.5 text-xs leading-relaxed text-psy-muted">
                La captura de audio sigue bloqueada. La documentación escrita sí está disponible.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex w-full justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-psy-border bg-white/78 p-1.5">
          {[
            {
              value: "accepted" as const,
              title: "Sí autoriza",
              description: "Activa grabación",
            },
            {
              value: "declined" as const,
              title: "No autoriza",
              description: "Solo nota escrita",
            },
          ].map((option) => {
            const isSelected = recordingPermission === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePermissionChange(option.value)}
                disabled={isActive || controlsDisabled}
                className={cn(
                  "min-w-[180px] rounded-full border px-3 py-2 text-left transition-all sm:min-w-[210px]",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                  isSelected
                    ? "border-psy-blue bg-psy-blue-light shadow-[0_10px_24px_rgba(62,129,151,0.12)]"
                    : "border-transparent bg-white/60 hover:border-psy-blue/20 hover:bg-psy-cream/70",
                )}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors",
                      isSelected
                        ? "border-psy-blue bg-psy-blue text-white"
                        : "border-psy-ink/18 bg-psy-cream text-transparent",
                    )}
                  >
                    <CheckCircle2 size={11} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-psy-ink">{option.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-psy-muted">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        </div>

        <div className="mt-5 w-full rounded-[26px] border border-psy-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,249,249,0.9))] p-3 shadow-[0_18px_50px_rgba(46,46,46,0.05)] sm:p-4">
          {!isWrittenMode && (
            <>
              <div className="mx-auto max-w-xl rounded-[22px] border border-psy-ink/12 bg-[linear-gradient(180deg,rgba(250,251,251,0.96),rgba(242,246,246,0.98))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:p-4">
                <div className="grid gap-2 sm:grid-cols-[1.2fr_auto_auto]">
                  <div className="rounded-2xl border border-psy-ink/10 bg-white px-3 py-2 text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-psy-muted">
                      Estado
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-2 w-2 rounded-full",
                          state === "recording"
                            ? "bg-psy-red shadow-[0_0_0_5px_rgba(192,57,43,0.12)]"
                            : state === "paused"
                              ? "bg-psy-amber"
                              : state === "done"
                                ? "bg-psy-green"
                                : "bg-psy-blue/35",
                        )}
                      />
                      <span className={cn("text-xs font-medium", statusTone)}>{statusCopy}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-psy-ink/10 bg-white px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-psy-muted">
                      Entrada
                    </p>
                    <div className="mt-1 flex items-end justify-center gap-0.5">
                      {Array.from({ length: 8 }).map((_, index) => {
                        const active = Math.round(audioLevel * 6) >= index;
                        return (
                          <span
                            key={index}
                            className={cn(
                              "w-1 rounded-full transition-all",
                              active ? "bg-psy-blue" : "bg-psy-blue/20",
                            )}
                            style={{ height: 6 + (index % 4) * 3 }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-psy-ink/10 bg-white px-3 py-2 text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-psy-muted">
                      Modo
                    </p>
                    <p className="mt-1 text-xs font-medium text-psy-ink">
                      {recordingPermission === "accepted" ? "Audio" : "Espera"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-[20px] border border-psy-ink/8 bg-psy-ink px-4 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/45">
                        Recorder bus
                      </p>
                      <p className="mt-1 text-xs text-white/65">
                        {canRecord && preflightReady
                          ? "Sistema listo para captura clínica."
                          : !preflightReady
                            ? "Preflight pendiente antes de grabar."
                            : "Esperando autorización de audio."}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                      {state === "recording" ? "REC" : state === "paused" ? "PAUSE" : preflightReady ? "READY" : "STBY"}
                    </div>
                  </div>

                  <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1.1fr_auto]">
                    <div className="flex h-20 items-end justify-center gap-1 rounded-[16px] border border-white/8 bg-white/5 px-3 py-3 sm:h-24">
                      {Array.from({ length: 26 }).map((_, index) => {
                        const activeBoost = state === "recording" ? audioLevel : 0.16;
                        const waveFactor = 0.38 + ((index % 7) + 1) / 9;
                        const height = 10 + activeBoost * 50 * waveFactor;

                        return (
                          <span
                            key={index}
                            className={cn(
                              "w-1 rounded-full transition-all duration-150 sm:w-1.5",
                              state === "recording"
                                ? "bg-white/90"
                                : state === "paused"
                                  ? "bg-psy-amber/80"
                                  : "bg-white/28",
                            )}
                            style={{ height }}
                          />
                        );
                      })}
                    </div>

                    <div className="min-w-[9.5rem] text-center sm:text-right">
                      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
                        Timecode
                      </p>
                      <p className="mt-1 font-mono text-[2rem] font-semibold tracking-[0.04em] text-white sm:text-[2.2rem]">
                        {formatDuration(duration)}
                      </p>
                      <p className="mt-1 text-[11px] text-white/55">
                        {canRecord && preflightReady
                          ? "Controles listos."
                          : !preflightReady
                            ? "Completa la verificación previa."
                            : "Autoriza primero para grabar."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 grid w-full gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={controlsDisabled || isActive || !canRecord || !preflightReady}
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    "border-psy-blue/18 bg-psy-blue/10 text-psy-blue hover:bg-psy-blue/14",
                  )}
                >
                  {state === "creating" ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                  {state === "error" ? "Reiniciar" : "Iniciar"}
                </button>

                <button
                  type="button"
                  onClick={state === "recording" ? pauseRecording : resumeRecording}
                  disabled={!isActive || controlsDisabled}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-psy-ink/10 bg-white px-3.5 text-sm font-medium text-psy-ink transition-colors hover:bg-psy-cream/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {state === "recording" ? <Pause size={16} /> : <Play size={16} />}
                  {state === "recording" ? "Pausar" : "Reanudar"}
                </button>

                <button
                  type="button"
                  onClick={discardRecording}
                  disabled={!hasDraftRecording || state === "uploading" || state === "creating" || discarding}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-psy-ink/10 bg-white px-3.5 text-sm font-medium text-psy-muted transition-colors hover:bg-psy-cream/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {discarding ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Borrar
                </button>

                <button
                  type="button"
                  onClick={stopAndUpload}
                  disabled={!isActive || controlsDisabled}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-psy-red/14 bg-psy-red/5 px-3.5 text-sm font-medium text-psy-red transition-colors hover:bg-psy-red/8 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {state === "uploading" ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                  Finalizar
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-1.5 text-left">
                <p className="text-[11px] leading-relaxed text-psy-muted">
                  <span className="font-medium text-psy-ink/80">Seguridad:</span> el audio se cifra durante la transferencia y se elimina después de la transcripción.
                </p>
                <p className="text-[11px] leading-relaxed text-psy-muted">
                  <span className="font-medium text-psy-ink/80">Operación:</span> si una toma no sirve, usa <span className="font-medium text-psy-ink/80">Borrar</span> antes de finalizar.
                </p>
              </div>
            </>
          )}

          {isWrittenMode && (
            <div className="mx-auto max-w-2xl text-left">
              <div className="flex items-start gap-3 rounded-2xl border border-psy-blue/10 bg-psy-blue-light/45 px-4 py-3">
                <FileText size={18} className="mt-0.5 shrink-0 text-psy-blue" />
                <div>
                  <p className="text-sm font-semibold text-psy-blue">Documentación escrita activa</p>
                  <p className="mt-1 text-xs leading-relaxed text-psy-muted">
                    El paciente no autorizó grabación. Registra aquí los hallazgos y acuerdos de la sesión.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="manual-session-note" className="mb-2 block text-sm font-medium text-psy-ink">
                  Nota clínica de la sesión
                </label>
                <textarea
                  id="manual-session-note"
                  value={manualNote}
                  onChange={(event) => {
                    setManualNote(event.target.value);
                    if (error) setError(null);
                  }}
                  rows={8}
                  placeholder="Ejemplo: paciente refiere ansiedad anticipatoria desde la última semana, se exploran detonantes, se refuerzan técnicas de respiración y se acuerda seguimiento..."
                  className="calm-input min-h-[220px] resize-y px-4 py-3 text-sm leading-relaxed"
                />
                <p className="mt-2 text-[11px] text-psy-muted">
                  Esta sesión se guardará como documentación escrita y no activará análisis automático de audio.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-psy-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-psy-ink">Guardar nota clínica</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-psy-muted">
                    Registro sin micrófono.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveWrittenDocumentation}
                  disabled={manualSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-psy-blue/18 bg-psy-blue/10 px-5 py-3 text-sm font-medium text-psy-blue transition-colors hover:bg-psy-blue/14 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {manualSaving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Guardar documentación
                </button>
              </div>
            </div>
          )}
        </div>

        {!recordingPermission && (
          <p className="mt-3 text-[11px] text-psy-muted">
            Selecciona si autoriza grabación para habilitar el flujo correcto.
          </p>
        )}

        {error && (
          <div className="mt-4 flex w-full items-start gap-2 rounded-2xl border border-psy-red/20 bg-psy-red-light px-3.5 py-3 text-left">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-psy-red" />
            <p className="text-xs leading-relaxed text-psy-red">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
