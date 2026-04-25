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
  Volume2,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { RecordingSettings } from "@/components/recorder/RecordingSettingsPanel";

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
  onStateChange?: (state: RecorderState) => void;
  onDurationChange?: (duration: number) => void;
  onPreflightChange?: (ready: boolean) => void;
  externalFinalizeSignal?: number;
  captureSource?: "mic" | "screen";
  settings?: RecordingSettings;
}

export function SessionRecorder({
  patientId,
  hasConsent,
  recordingPermission,
  onStateChange,
  onDurationChange,
  onPreflightChange,
  externalFinalizeSignal = 0,
  captureSource = "mic",
  settings,
}: SessionRecorderProps) {
  const router = useRouter();

  // Recorder state
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [levelLabel, setLevelLabel] = useState<"silencio" | "bajo" | "óptimo" | "alto" | "saturado">("silencio");
  const [manualNote, setManualNote] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  // Inline mic test state
  const [localDevices, setLocalDevices] = useState<MediaDeviceInfo[]>([]);
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);
  const [localPreflightReady, setLocalPreflightReady] = useState(false);
  const [testState, setTestState] = useState<"idle" | "testing" | "pass" | "fail">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [testLevel, setTestLevel] = useState(0);
  const [testLevelLabel, setTestLevelLabel] = useState<"silencio" | "bajo" | "óptimo" | "alto" | "saturado">("silencio");
  const [testCountdown, setTestCountdown] = useState(5);

  // Recorder refs
  const sessionIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const externalFinalizeRef = useRef(0);
  const durationRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);

  // Mic test refs
  const testStreamRef = useRef<MediaStream | null>(null);
  const testContextRef = useRef<AudioContext | null>(null);
  const testAnalyserRef = useRef<AnalyserNode | null>(null);
  const testFrameRef = useRef<number | null>(null);
  const testTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testPeakRef = useRef(0);

  const effectiveSettings: RecordingSettings = settings ?? {
    audioQuality: "high",
    format: "webm",
    noiseCancellation: true,
    echoCancellation: true,
    autoGainControl: true,
    diarization: true,
    language: "es",
    safetyTrack: true,
    preRecordSeconds: 3 as const,
  };

  const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_CONSENT === "true";

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(data);
    let sumSquares = 0;
    let peak = 0;
    for (const value of data) {
      const normalized = (value - 128) / 128;
      sumSquares += normalized * normalized;
      peak = Math.max(peak, Math.abs(normalized));
    }
    const rms = Math.sqrt(sumSquares / data.length);
    setAudioLevel(Math.min(1, rms * 4));
    setLevelLabel(
      peak > 0.92 ? "saturado"
      : rms > 0.26 ? "alto"
      : rms > 0.045 ? "óptimo"
      : rms > 0.015 ? "bajo"
      : "silencio",
    );
    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const syncDurationFromClock = useCallback(() => {
    if (startedAtRef.current === null) return elapsedBeforePauseRef.current;
    const elapsed = elapsedBeforePauseRef.current + Math.floor((performance.now() - startedAtRef.current) / 1000);
    durationRef.current = elapsed;
    setDuration(elapsed);
    return elapsed;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startedAtRef.current = performance.now();
    timerRef.current = setInterval(() => { syncDurationFromClock(); }, 250);
  }, [stopTimer, syncDurationFromClock]);

  const clearRuntime = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) void audioContextRef.current.close().catch(() => undefined);
    timerRef.current = null;
    animFrameRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setAudioLevel(0);
    setLevelLabel("silencio");
  }, []);

  const stopMicTest = useCallback(() => {
    if (testTimerRef.current) clearInterval(testTimerRef.current);
    if (testFrameRef.current) cancelAnimationFrame(testFrameRef.current);
    testStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (testContextRef.current) void testContextRef.current.close().catch(() => undefined);
    testStreamRef.current = null;
    testContextRef.current = null;
    testAnalyserRef.current = null;
    testTimerRef.current = null;
    testFrameRef.current = null;
    setTestLevel(0);
  }, []);

  const startMicTest = useCallback(async () => {
    stopMicTest();
    setTestState("testing");
    setTestError(null);
    setTestCountdown(5);
    setTestLevel(0);
    testPeakRef.current = 0;

    try {
      // Constraints minimalistas para máxima compatibilidad
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: localDeviceId ? { deviceId: { exact: localDeviceId } } : true,
      });
      testStreamRef.current = stream;

      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devs.filter((d) => d.kind === "audioinput");
      setLocalDevices(audioInputs);

      const ctx = new AudioContext();
      testContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      testAnalyserRef.current = analyser;

      const measureLevel = () => {
        if (!testAnalyserRef.current) return;
        const data = new Uint8Array(testAnalyserRef.current.fftSize);
        testAnalyserRef.current.getByteTimeDomainData(data);
        let sumSquares = 0;
        let peak = 0;
        for (const value of data) {
          const normalized = (value - 128) / 128;
          sumSquares += normalized * normalized;
          peak = Math.max(peak, Math.abs(normalized));
        }
        const rms = Math.sqrt(sumSquares / data.length);
        setTestLevel(Math.min(1, rms * 4));
        setTestLevelLabel(
          peak > 0.92 ? "saturado"
          : rms > 0.26 ? "alto"
          : rms > 0.045 ? "óptimo"
          : rms > 0.015 ? "bajo"
          : "silencio",
        );
        testPeakRef.current = Math.max(testPeakRef.current, peak);
        testFrameRef.current = requestAnimationFrame(measureLevel);
      };
      testFrameRef.current = requestAnimationFrame(measureLevel);

      let remaining = 5;
      testTimerRef.current = setInterval(() => {
        remaining -= 1;
        setTestCountdown(remaining);
        if (remaining <= 0) {
          if (testTimerRef.current) clearInterval(testTimerRef.current);
          if (testFrameRef.current) cancelAnimationFrame(testFrameRef.current);
          testStreamRef.current?.getTracks().forEach((t) => t.stop());
          if (testContextRef.current) void testContextRef.current.close().catch(() => undefined);
          testStreamRef.current = null;
          testContextRef.current = null;
          setTestLevel(0);
          const passed = testPeakRef.current > 0.008;
          setTestState(passed ? "pass" : "fail");
          setLocalPreflightReady(passed);
          onPreflightChange?.(passed);
        }
      }, 1000);
    } catch (err) {
      const name = err instanceof Error ? (err as DOMException).name : "";
      const msg =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Permiso denegado — haz clic en el 🔒 candado de la barra de dirección y permite el micrófono."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
            ? "No se encontró ningún micrófono. Conecta uno e intenta de nuevo."
            : name === "NotReadableError" || name === "TrackStartError"
              ? "El micrófono está en uso por otra aplicación (Teams, Zoom, etc.). Ciérrala e intenta de nuevo."
              : name === "OverconstrainedError"
                ? "Los ajustes del dispositivo no son compatibles. Intenta con 'Por defecto'."
                : `Error al acceder al micrófono${name ? ` (${name})` : ""}. Verifica los permisos del navegador.`;
      setTestError(msg);
      setTestState("fail");
      stopMicTest();
    }
  }, [localDeviceId, onPreflightChange, stopMicTest]);

  const getSupportedMimeType = useCallback((preferredFormat: RecordingSettings["format"]) => {
    if (typeof MediaRecorder === "undefined") return null;
    const candidates =
      preferredFormat === "wav"
        ? ["audio/wav", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"]
        : ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
    return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? null;
  }, []);

  const deleteDraftSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "No se pudo borrar la grabacion en borrador");
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!DEV_BYPASS) {
      if (!hasConsent) {
        setError("El paciente debe tener consentimiento informado firmado antes de grabar audio.");
        return;
      }
      if (recordingPermission !== "accepted") {
        setError("Marca primero que el paciente autoriza la grabación de esta sesión.");
        return;
      }
      if (captureSource === "mic" && !localPreflightReady) {
        setError("Completa primero el test de micrófono.");
        return;
      }
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setError("Este navegador no permite acceso al micrófono.");
      setState("error");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError("Este navegador no soporta grabación con MediaRecorder.");
      setState("error");
      return;
    }
    const mimeType = getSupportedMimeType(effectiveSettings.format);
    if (!mimeType) {
      setError("No hay un formato de audio soportado por este navegador.");
      setState("error");
      return;
    }
    setState("creating");
    setDuration(0);
    durationRef.current = 0;
    elapsedBeforePauseRef.current = 0;
    startedAtRef.current = null;
    setAudioLevel(0);
    setLevelLabel("silencio");
    setError(null);

    try {
      let stream: MediaStream;
      if (captureSource === "screen") {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error("Este navegador no soporta captura de pantalla. Usa Chrome o Edge.");
        }
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          audio: { channelCount: 1, sampleRate: 16000, echoCancellation: false, noiseSuppression: false },
          video: { width: 1, height: 1 },
        });
        const audioTracks = displayStream.getAudioTracks();
        displayStream.getVideoTracks().forEach((t) => t.stop());
        if (audioTracks.length === 0) throw new Error("No se detectó audio en la pestaña seleccionada.");
        stream = new MediaStream(audioTracks);
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: localDeviceId ? { exact: localDeviceId } : undefined,
            channelCount: 1,
            sampleRate: effectiveSettings.audioQuality === "high" ? 48000 : 16000,
            echoCancellation: effectiveSettings.echoCancellation,
            noiseSuppression: effectiveSettings.noiseCancellation,
            autoGainControl: effectiveSettings.autoGainControl,
          },
        });
      }
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, mode: captureSource === "screen" ? "virtual" : "presential" }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "No se pudo crear la sesión");
      sessionIdRef.current = payload.sessionId;

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onerror = () => { setError("La grabación se interrumpió por un error del navegador."); setState("error"); };
      recorder.start(1000);
      setState("recording");
      startTimer();
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    } catch (err) {
      const orphanId = sessionIdRef.current;
      clearRuntime();
      sessionIdRef.current = null;
      if (orphanId) { try { await deleteDraftSession(orphanId); } catch { /* ignore */ } }
      setError(err instanceof Error ? err.message : "No se pudo acceder al micrófono. Verifica los permisos del navegador.");
      setState("error");
    }
  }, [
    captureSource, clearRuntime, deleteDraftSession,
    effectiveSettings.audioQuality, effectiveSettings.autoGainControl,
    effectiveSettings.echoCancellation, effectiveSettings.format,
    effectiveSettings.noiseCancellation, getSupportedMimeType,
    hasConsent, localDeviceId, localPreflightReady, patientId,
    recordingPermission, startTimer, updateAudioLevel,
  ]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "recording") return;
    mediaRecorderRef.current.pause();
    elapsedBeforePauseRef.current = syncDurationFromClock();
    startedAtRef.current = null;
    setState("paused");
    stopTimer();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);
    setLevelLabel("silencio");
  }, [stopTimer, syncDurationFromClock]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "paused") return;
    mediaRecorderRef.current.resume();
    setState("recording");
    startTimer();
    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [startTimer, updateAudioLevel]);

  const stopAndUpload = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    const sessionId = sessionIdRef.current;
    if (!recorder || !sessionId) return;
    syncDurationFromClock();
    stopTimer();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop(); });
    const mimeType = recorder.mimeType;
    const chunks = [...chunksRef.current];
    clearRuntime();
    setState("uploading");
    try {
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size === 0) throw new Error("No se capturó audio utilizable.");
      const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("wav") ? "wav" : "webm";
      const formData = new FormData();
      formData.append("audio", blob, `session-${sessionId}.${extension}`);
      formData.append("sessionId", sessionId);
      formData.append("metadata", JSON.stringify({
        durationSeconds: durationRef.current, mimeType, fileSizeBytes: blob.size,
        audioQuality: effectiveSettings.audioQuality, requestedFormat: effectiveSettings.format,
        noiseSuppression: effectiveSettings.noiseCancellation, echoCancellation: effectiveSettings.echoCancellation,
        autoGainControl: effectiveSettings.autoGainControl, safetyTrack: effectiveSettings.safetyTrack,
        preRecordSeconds: effectiveSettings.preRecordSeconds,
      }));
      const res = await fetch("/api/sessions/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      setState("done");
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el audio");
      setState("error");
    }
  }, [
    clearRuntime, effectiveSettings.audioQuality, effectiveSettings.autoGainControl,
    effectiveSettings.echoCancellation, effectiveSettings.format,
    effectiveSettings.noiseCancellation, effectiveSettings.preRecordSeconds,
    effectiveSettings.safetyTrack, router, stopTimer, syncDurationFromClock,
  ]);

  const discardRecording = useCallback(async () => {
    const draftId = sessionIdRef.current;
    if ((state === "recording" || state === "paused") && !window.confirm("¿Descartar esta grabación en curso?")) return;
    setDiscarding(true);
    setError(null);
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        await new Promise<void>((resolve) => { const r = mediaRecorderRef.current!; r.onstop = () => resolve(); r.stop(); });
      }
      clearRuntime();
      if (draftId) await deleteDraftSession(draftId);
      sessionIdRef.current = null;
      setDuration(0);
      durationRef.current = 0;
      elapsedBeforePauseRef.current = 0;
      startedAtRef.current = null;
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la grabacion borrador");
      setState("error");
    } finally {
      setDiscarding(false);
    }
  }, [clearRuntime, deleteDraftSession, state]);

  const saveWrittenDocumentation = useCallback(async () => {
    if (manualNote.trim().length < 30) { setError("Escribe al menos 30 caracteres para documentar la sesion por escrito."); return; }
    setManualSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions/manual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, note: manualNote.trim(), mode: "presential" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar la documentacion escrita");
      router.push(`/sessions/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la sesion");
    } finally {
      setManualSaving(false);
    }
  }, [manualNote, patientId, router]);

  useEffect(() => { return () => { clearRuntime(); stopMicTest(); }; }, [clearRuntime, stopMicTest]);
  useEffect(() => { onStateChange?.(state); }, [onStateChange, state]);
  useEffect(() => { onDurationChange?.(duration); durationRef.current = duration; }, [duration, onDurationChange]);
  useEffect(() => {
    if (externalFinalizeSignal === 0 || externalFinalizeSignal === externalFinalizeRef.current) return;
    externalFinalizeRef.current = externalFinalizeSignal;
    if (state === "recording" || state === "paused") { void stopAndUpload(); return; }
    setError("No hay una grabacion activa para finalizar y procesar.");
  }, [externalFinalizeSignal, state, stopAndUpload]);

  // Derived display values
  const isActive = state === "recording" || state === "paused";
  const canRecord = DEV_BYPASS || (hasConsent && recordingPermission === "accepted" && (captureSource === "screen" || localPreflightReady));
  const isWrittenMode = recordingPermission === "declined";
  const controlsDisabled = ["creating", "uploading", "done"].includes(state) || discarding;
  const hasDraftRecording = !!sessionIdRef.current || chunksRef.current.length > 0 || duration > 0;
  const showMicTest = state === "idle" && captureSource === "mic" && !isWrittenMode;

  const statusCopy =
    state === "idle" ? "Lista para iniciar"
    : state === "creating" ? "Preparando sesion"
    : state === "recording" ? "Grabacion en curso"
    : state === "paused" ? "Grabacion en pausa"
    : state === "uploading" ? "Subiendo y transcribiendo"
    : state === "done" ? "Grabacion completada"
    : "Sesion interrumpida";

  const recorderBadgeCopy =
    state === "recording" ? "REC"
    : state === "paused" ? "PAUSE"
    : state === "done" ? "DONE"
    : canRecord && localPreflightReady ? "READY"
    : "ESPERA";

  const activeDisplayLevel = state === "recording" ? audioLevel : (testState === "testing" ? testLevel : 0.12);
  const displayLevelLabel =
    state === "recording" ? levelLabel
    : state === "paused" ? "En pausa"
    : testState === "testing" ? testLevelLabel
    : "En espera";

  const activeDeviceLabel =
    localDevices.find((d) => d.deviceId === localDeviceId)?.label?.replace(/\s*\(.*?\)\s*/g, "").trim()
    ?? (localDeviceId ? "Seleccionado" : "Por defecto");

  return (
    <div className="flex h-full flex-col gap-2.5">
      {!isWrittenMode && (
        <section className="flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-[#171a1d] bg-[radial-gradient(circle_at_top,rgba(64,104,120,0.18),transparent_32%),linear-gradient(180deg,#1b1e20_0%,#111315_100%)] p-3 shadow-[0_22px_42px_rgba(13,16,18,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex flex-1 flex-col rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,22,24,0.98),rgba(12,13,15,1))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">

            {/* Inner content card */}
            <div className="flex flex-1 flex-col rounded-[1.35rem] border border-[#30363a] bg-[linear-gradient(180deg,#0f1214_0%,#14181b_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em]",
                    state === "recording" ? "border-[#743232] bg-[#462221] text-[#ffb4ac]"
                    : state === "paused" ? "border-[#786b36] bg-[#40361f] text-[#f6df9f]"
                    : state === "done" ? "border-[#2b5944] bg-[#19392f] text-[#9de0b8]"
                    : canRecord && localPreflightReady ? "border-[#264a56] bg-[#17323a] text-[#9ed7e8]"
                    : "border-white/10 bg-white/5 text-white/55",
                  )}>
                    {recorderBadgeCopy}
                  </span>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">Clinic Rec</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">Estado</p>
                  <p className="mt-1 text-[11px] text-white/64">{statusCopy}</p>
                  {state === "uploading" && (
                    <p className="mt-0.5 text-[9px] text-white/42">Puede tomar 1–3 min</p>
                  )}
                </div>
              </div>

              {/* Timer + tech chips */}
              <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-black/20 px-3 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/32">Display</p>
                <p className="mt-1.5 font-mono text-[2.4rem] font-semibold leading-none tracking-[0.08em] text-white">
                  {formatDuration(duration)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {captureSource === "screen" ? "Pantalla" : activeDeviceLabel}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {effectiveSettings.format === "wav" ? "WAV" : "WEBM·Opus"}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {effectiveSettings.audioQuality === "high" ? "Alta" : "Estándar"}
                  </span>
                </div>
              </div>

              {/* ── Inline mic test ── */}
              {showMicTest && (
                <div className="mt-3 rounded-[1.1rem] border border-white/8 bg-white/[0.025] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Volume2 size={11} className="shrink-0 text-white/38" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/38">Test de audio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testState === "pass" && (
                        <span className="flex items-center gap-1 text-[10px] text-[#9de0b8]">
                          <CheckCircle2 size={11} /> Validado
                        </span>
                      )}
                      {testState === "testing" && (
                        <span className="font-mono text-[10px] text-white/48">{testCountdown}s</span>
                      )}
                      <button
                        type="button"
                        onClick={startMicTest}
                        disabled={testState === "testing"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors disabled:opacity-50",
                          testState === "pass"
                            ? "border-[#2b5944]/60 bg-[#19392f]/60 text-[#9de0b8] hover:bg-[#19392f]"
                            : testState === "fail"
                              ? "border-[#743232]/60 bg-[#462221]/60 text-[#ffb4ac] hover:bg-[#462221]"
                              : "border-white/15 bg-white/[0.06] text-white/65 hover:bg-white/[0.10]",
                        )}
                      >
                        {testState === "testing"
                          ? <Loader2 size={10} className="animate-spin" />
                          : testState === "pass"
                            ? <RotateCcw size={10} />
                            : <Mic size={10} />}
                        {testState === "testing" ? "Probando..." : testState === "pass" ? "Repetir" : testState === "fail" ? "Reintentar" : "Probar mic"}
                      </button>
                    </div>
                  </div>

                  {/* Error detallado */}
                  {testState === "fail" && testError && (
                    <div className="mt-2 rounded-lg border border-[#743232]/40 bg-[#462221]/40 px-2.5 py-2">
                      <p className="text-[10px] leading-[1.6] text-[#ffb4ac]">{testError}</p>
                    </div>
                  )}

                  {/* Level bars during test */}
                  {(testState === "testing" || testState === "pass") && (
                    <div className="mt-2 flex items-end gap-0.5">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const lvl = testState === "testing" ? testLevel : 0;
                        const h = 5 + lvl * 22 * (0.35 + ((i % 5) + 1) / 12);
                        return (
                          <span
                            key={i}
                            className={cn(
                              "w-1 rounded-full transition-all duration-100",
                              testState === "testing" ? "bg-[#9ed7e8]/65" : "bg-[#9de0b8]/35",
                            )}
                            style={{ height: h }}
                          />
                        );
                      })}
                      {testState === "testing" && (
                        <span className="ml-1.5 self-center text-[9px] text-white/38">{testLevelLabel}</span>
                      )}
                    </div>
                  )}

                  {/* Device selector */}
                  {localDevices.length > 1 && (
                    <div className="mt-2 flex items-center gap-1">
                      <ChevronDown size={9} className="shrink-0 text-white/30" />
                      <select
                        value={localDeviceId ?? ""}
                        onChange={(e) => {
                          setLocalDeviceId(e.target.value || null);
                          setLocalPreflightReady(false);
                          setTestState("idle");
                          setTestError(null);
                          onPreflightChange?.(false);
                        }}
                        className="flex-1 bg-transparent font-mono text-[9px] text-white/45 outline-none"
                      >
                        <option value="">Por defecto</option>
                        {localDevices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label?.replace(/\s*\(.*?\)\s*/g, "").trim() || `Micrófono ${d.deviceId.slice(0, 4)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Waveform — fills remaining space */}
              <div className="mt-3 flex flex-1 flex-col justify-end rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="flex items-end justify-center gap-1">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = 14 + activeDisplayLevel * 54 * (0.4 + ((i % 6) + 1) / 10);
                    return (
                      <span
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all duration-150",
                          state === "recording" ? "bg-[#9a7dff]"
                          : state === "paused" ? "bg-[#f0c776]"
                          : state === "done" ? "bg-[#9adab2]"
                          : testState === "testing" ? "bg-[#9ed7e8]/65"
                          : "bg-white/22",
                        )}
                        style={{ height: h }}
                      />
                    );
                  })}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/32">Nivel</span>
                  <span className="text-[11px] text-white/62">{displayLevelLabel}</span>
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={startRecording}
                disabled={controlsDisabled || isActive || !canRecord}
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
        <section className="flex-1 rounded-[1.5rem] border border-psy-border bg-white px-4 py-4 shadow-[0_12px_28px_rgba(13,34,50,0.04)] sm:px-5 sm:py-5">
          <div className="mx-auto max-w-2xl">
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
                onChange={(e) => { setManualNote(e.target.value); if (error) setError(null); }}
                rows={8}
                placeholder="Ejemplo: paciente refiere ansiedad anticipatoria desde la ultima semana, se exploran detonantes, se refuerzan tecnicas de respiracion y se acuerda seguimiento..."
                className="calm-input min-h-[220px] resize-y px-4 py-3 text-sm leading-relaxed"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-psy-border bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-psy-ink">Guardar nota clinica</p>
                <p className="mt-1 text-[11px] text-psy-muted">Registro sin microfono.</p>
              </div>
              <button
                type="button"
                onClick={saveWrittenDocumentation}
                disabled={manualSaving}
                className="inline-flex items-center gap-2 rounded-[16px] border border-psy-blue/18 bg-psy-blue/10 px-5 py-3 text-sm font-medium text-psy-blue transition-colors hover:bg-psy-blue/14 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {manualSaving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Guardar documentacion
              </button>
            </div>
          </div>
        </section>
      )}

      {!DEV_BYPASS && !recordingPermission && (
        <p className="rounded-[0.95rem] border border-psy-border bg-[#fbfcfc] px-3 py-2 text-[11px] text-psy-muted">
          Define el consentimiento en la columna izquierda para habilitar el flujo correcto.
        </p>
      )}

      {!DEV_BYPASS && recordingPermission === "accepted" && !hasConsent && (
        <p className="rounded-[0.95rem] border border-psy-amber/20 bg-psy-amber-light px-3 py-2 text-[11px] text-psy-amber">
          El paciente todavía no tiene consentimiento informado firmado. No se puede grabar audio.
        </p>
      )}

      {error && (
        <div className="flex w-full items-start gap-2 rounded-2xl border border-psy-red/20 bg-psy-red-light px-3.5 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-psy-red" />
          <p className="text-xs leading-relaxed text-psy-red">{error}</p>
        </div>
      )}
    </div>
  );
}
