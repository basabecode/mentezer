"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Pause, Play, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type RecorderState = "idle" | "recording" | "paused" | "uploading" | "done" | "error";

interface SessionRecorderProps {
  sessionId: string;
  hasConsent: boolean;
}

export function SessionRecorder({ sessionId, hasConsent }: SessionRecorderProps) {
  const router = useRouter();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,    // Óptimo para Whisper
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Analizador de nivel de audio
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Elegir el mejor formato disponible
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

      recorder.start(1000); // chunk cada segundo
      setState("recording");
      setError(null);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    } catch {
      setError("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
      setState("error");
    }
  }, [hasConsent, updateAudioLevel]);

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
    if (!mediaRecorderRef.current) return;

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
  }, [sessionId, router]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-6">
      {!hasConsent && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-psy-amber-light rounded-lg">
          <AlertTriangle size={14} className="text-psy-amber shrink-0" />
          <p className="text-xs text-psy-amber font-medium">
            Requiere consentimiento informado firmado para grabar.
          </p>
        </div>
      )}

      {/* Visualizador de nivel de audio */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-24 h-24">
          {/* Pulso externo */}
          <AnimatePresence>
            {state === "recording" && (
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1 + audioLevel * 0.5, opacity: 0.2 }}
                className="absolute inset-0 rounded-full bg-psy-blue"
                style={{ transition: "all 0.1s ease" }}
              />
            )}
          </AnimatePresence>

          {/* Botón principal */}
          <button
            onClick={
              state === "idle" || state === "error"
                ? startRecording
                : state === "recording"
                ? stopAndUpload
                : state === "paused"
                ? stopAndUpload
                : undefined
            }
            disabled={state === "uploading" || state === "done" || !hasConsent}
            className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center transition-all",
              state === "idle" && "bg-psy-blue text-white hover:bg-psy-blue/90",
              state === "recording" && "bg-psy-red text-white hover:bg-psy-red/90",
              state === "paused" && "bg-psy-amber text-white hover:bg-psy-amber/90",
              state === "uploading" && "bg-psy-muted/20 text-psy-muted cursor-not-allowed",
              state === "done" && "bg-psy-green text-white cursor-not-allowed",
              !hasConsent && "opacity-40 cursor-not-allowed",
            )}
          >
            {state === "idle" && <Mic size={28} />}
            {state === "recording" && <Square size={24} />}
            {state === "paused" && <Square size={24} />}
            {state === "uploading" && <Loader2 size={24} className="animate-spin" />}
            {state === "done" && <Mic size={24} />}
            {state === "error" && <Mic size={24} />}
          </button>
        </div>
      </div>

      {/* Duración */}
      <div className="text-center mb-4">
        <p className="font-mono text-3xl font-semibold text-psy-ink">
          {formatDuration(duration)}
        </p>
        <p className="text-xs text-psy-muted mt-1">
          {state === "idle" && "Presiona para grabar"}
          {state === "recording" && "Grabando..."}
          {state === "paused" && "En pausa"}
          {state === "uploading" && "Transcribiendo con IA..."}
          {state === "done" && "Transcripción lista"}
          {state === "error" && "Error — intenta de nuevo"}
        </p>
      </div>

      {/* Controles secundarios */}
      {(state === "recording" || state === "paused") && (
        <div className="flex justify-center gap-3">
          <button
            onClick={state === "recording" ? pauseRecording : resumeRecording}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-psy-muted hover:text-psy-ink hover:bg-psy-cream transition-colors"
          >
            {state === "recording" ? <Pause size={14} /> : <Play size={14} />}
            {state === "recording" ? "Pausar" : "Reanudar"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-psy-red bg-psy-red-light px-3 py-2 rounded-lg text-center">
          {error}
        </p>
      )}

      <p className="mt-4 text-[10px] text-psy-muted text-center leading-relaxed">
        El audio se cifra durante la transferencia y se elimina tras la transcripción.
      </p>
    </div>
  );
}
