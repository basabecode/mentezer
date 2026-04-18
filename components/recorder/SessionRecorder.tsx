"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Pause, Play, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type RecorderState = "idle" | "creating" | "recording" | "paused" | "uploading" | "done" | "error";

interface SessionRecorderProps {
  patientId: string;
  hasConsent: boolean;
}

export function SessionRecorder({ patientId, hasConsent }: SessionRecorderProps) {
  const router = useRouter();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

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

  const startRecording = useCallback(async () => {
    if (!hasConsent) {
      setError("El paciente debe firmar el consentimiento informado antes de grabar.");
      return;
    }

    setState("creating");
    setError(null);

    // Crear la sesión justo antes de grabar (no en el render de la página)
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000);
      setState("recording");

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    } catch {
      setError("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
      setState("error");
    }
  }, [hasConsent, patientId, updateAudioLevel]);

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
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [updateAudioLevel]);

  const stopAndUpload = useCallback(async () => {
    if (!mediaRecorderRef.current || !sessionIdRef.current) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setState("uploading");

    try {
      const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType });
      const formData = new FormData();
      formData.append("audio", blob, `session-${sessionIdRef.current}.webm`);
      formData.append("sessionId", sessionIdRef.current);

      const res = await fetch("/api/sessions/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      setState("done");
      router.push(`/sessions/${sessionIdRef.current}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el audio");
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const isActive = state === "recording" || state === "paused";

  return (
    <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-xl p-6">
      {!hasConsent && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-[var(--psy-amber-light)] rounded-lg">
          <AlertTriangle size={14} className="text-[var(--psy-amber)] shrink-0" />
          <p className="text-xs text-[var(--psy-amber)] font-medium">
            Requiere consentimiento informado firmado para grabar.
          </p>
        </div>
      )}

      {/* Visualizador */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-24 h-24">
          {state === "recording" && (
            <div
              className="absolute inset-0 rounded-full bg-[var(--psy-blue)] opacity-20 transition-transform duration-100"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            />
          )}
          <button
            onClick={
              state === "idle" || state === "error" ? startRecording
              : isActive ? stopAndUpload
              : undefined
            }
            disabled={["creating", "uploading", "done"].includes(state) || !hasConsent}
            className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center transition-all",
              state === "idle"      && "bg-[var(--psy-blue)] text-white hover:bg-[var(--psy-blue)]/90",
              state === "creating"  && "bg-[var(--psy-muted)]/20 text-[var(--psy-muted)] cursor-not-allowed",
              state === "recording" && "bg-[var(--psy-red)] text-white hover:bg-[var(--psy-red)]/90",
              state === "paused"    && "bg-[var(--psy-amber)] text-white hover:bg-[var(--psy-amber)]/90",
              state === "uploading" && "bg-[var(--psy-muted)]/20 text-[var(--psy-muted)] cursor-not-allowed",
              state === "done"      && "bg-[var(--psy-green)] text-white cursor-not-allowed",
              state === "error"     && "bg-[var(--psy-blue)] text-white hover:bg-[var(--psy-blue)]/90",
              !hasConsent           && "opacity-40 cursor-not-allowed",
            )}
          >
            {(state === "idle" || state === "error") && <Mic size={28} />}
            {state === "creating"  && <Loader2 size={24} className="animate-spin" />}
            {state === "recording" && <Square size={24} />}
            {state === "paused"    && <Square size={24} />}
            {state === "uploading" && <Loader2 size={24} className="animate-spin" />}
            {state === "done"      && <Mic size={24} />}
          </button>
        </div>
      </div>

      {/* Duración */}
      <div className="text-center mb-4">
        <p className="font-mono text-3xl font-semibold text-[var(--psy-ink)]">
          {formatDuration(duration)}
        </p>
        <p className="text-xs text-[var(--psy-muted)] mt-1">
          {state === "idle"      && "Presiona para grabar"}
          {state === "creating"  && "Iniciando sesión..."}
          {state === "recording" && "Grabando — presiona para finalizar"}
          {state === "paused"    && "En pausa"}
          {state === "uploading" && "Transcribiendo con Whisper..."}
          {state === "done"      && "Transcripción lista"}
          {state === "error"     && "Error — intenta de nuevo"}
        </p>
      </div>

      {isActive && (
        <div className="flex justify-center gap-3">
          <button
            onClick={state === "recording" ? pauseRecording : resumeRecording}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--psy-border)] rounded-lg text-sm text-[var(--psy-muted)] hover:text-[var(--psy-ink)] hover:bg-[var(--psy-cream)] transition-colors"
          >
            {state === "recording" ? <Pause size={14} /> : <Play size={14} />}
            {state === "recording" ? "Pausar" : "Reanudar"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-[var(--psy-red)] bg-[var(--psy-red-light)] px-3 py-2 rounded-lg text-center">
          {error}
        </p>
      )}

      <p className="mt-4 text-[10px] text-[var(--psy-muted)] text-center leading-relaxed">
        El audio se cifra durante la transferencia y se elimina tras la transcripción.
      </p>
    </div>
  );
}
