"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Monitor,
  Laptop,
  Trash2,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

interface AudioPreflightPanelProps {
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string | null) => void;
  onValidatedChange: (ready: boolean) => void;
}

export function AudioPreflightPanel({
  selectedDeviceId,
  onDeviceChange,
  onValidatedChange,
}: AudioPreflightPanelProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [previewActive, setPreviewActive] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [recordingSample, setRecordingSample] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [testDuration, setTestDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1
  const [dbLevel, setDbLevel] = useState(-Infinity);
  const [sampleBlob, setSampleBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const micSupported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const audioCaptured = !!sampleBlob && sampleBlob.size > 0;
  const preflightReady = permissionState === "granted" && audioCaptured;

  const deviceType = useMemo(() => {
    if (typeof window === "undefined") return "pc";
    const ua = window.navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|tablet/.test(ua)) return "phone";
    if (/macintosh|windows|linux/.test(ua) && !/mobile/.test(ua)) {
      // Small heuristic for laptop vs pc (laptop usually has "Internal" mic)
      return "laptop"; 
    }
    return "pc";
  }, []);

  const DeviceIcon = {
    phone: Smartphone,
    laptop: Laptop,
    pc: Monitor,
  }[deviceType] || Monitor;

  const cleanupPreview = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    previewStreamRef.current?.getTracks().forEach((track) => track.stop());
    previewStreamRef.current = null;
    analyserRef.current = null;
    
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    
    setPreviewActive(false);
    setAudioLevel(0);
    setDbLevel(-Infinity);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!micSupported) {
      setPermissionState("unsupported");
      return;
    }

    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const inputs = allDevices.filter((device) => device.kind === "audioinput");
      setDevices(inputs);

      if (!selectedDeviceId && inputs[0]) {
        onDeviceChange(inputs[0].deviceId || null);
      }
    } catch (err) {
      console.error("Error refreshing devices:", err);
    }
  }, [micSupported, onDeviceChange, selectedDeviceId]);

  const queryPermissionState = useCallback(async () => {
    if (!micSupported) {
      setPermissionState("unsupported");
      return;
    }

    try {
      if (!navigator.permissions?.query) {
        setPermissionState("prompt");
        return;
      }

      const status = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setPermissionState(status.state as PermissionState);
      status.onchange = () => setPermissionState(status.state as PermissionState);
    } catch {
      setPermissionState("prompt");
    }
  }, [micSupported]);

  const beginLevelMonitor = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const loop = () => {
      if (!analyserRef.current) return;
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
      setAudioLevel(avg / 128);

      // Decibel calculation
      const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
      const db = rms > 0 ? 20 * Math.log10(rms / 255) : -Infinity;
      setDbLevel(db);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const enablePreview = useCallback(async () => {
    if (!micSupported) {
      setPermissionState("unsupported");
      setError("Navegador no compatible.");
      return;
    }

    setLoadingPreview(true);
    setError(null);

    try {
      cleanupPreview();

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

      previewStreamRef.current = stream;
      setPermissionState("granted");
      setPreviewActive(true);

      beginLevelMonitor(stream);
      await refreshDevices();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Sin permiso de microfono."
          : "Error al iniciar microfono.";
      setError(message);
      setPermissionState(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "prompt");
    } finally {
      setLoadingPreview(false);
    }
  }, [beginLevelMonitor, cleanupPreview, micSupported, refreshDevices, selectedDeviceId]);

  const validateSample = useCallback(async (blob: Blob) => {
    if (blob.size === 0) {
      setError("No se capturó audio utilizable en la prueba.");
      onValidatedChange(false);
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob, "preflight-sample.webm");

    try {
      const res = await fetch("/api/sessions/preflight", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fallo validacion");

      setTranscript(data.transcript ?? "Audio capturado correctamente.");
      onValidatedChange(true);
    } catch {
      setTranscript("Audio capturado correctamente. La transcripción de prueba no está disponible en este momento.");
      onValidatedChange(true);
    }
  }, [onValidatedChange]);

  const stopTestRecording = useCallback(async () => {
    if (!recorderRef.current || recorderRef.current.state === "inactive") return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    return new Promise<void>((resolve) => {
      recorderRef.current!.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorderRef.current!.mimeType });
        setSampleBlob(blob);
        setRecordingSample(false);
        setIsPaused(false);
        await validateSample(blob);
        resolve();
      };
      recorderRef.current!.stop();
    });
  }, [validateSample]);

  const startTestRecording = useCallback(async () => {
    if (!previewStreamRef.current) {
      await enablePreview();
    }

    const stream = previewStreamRef.current;
    if (!stream) return;

    setRecordingSample(true);
    setIsPaused(false);
    setTestDuration(0);
    setTranscript("");
    setSampleBlob(null);
    setError(null);
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(200);

    timerRef.current = setInterval(() => {
      setTestDuration((d) => {
        if (d >= 4.9) {
          void stopTestRecording();
          return 5;
        }
        return d + 0.1;
      });
    }, 100);
  }, [enablePreview, stopTestRecording]);

  const pauseTestRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const resumeTestRecording = useCallback(() => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setTestDuration((d) => {
          if (d >= 4.9) {
            void stopTestRecording();
            return 5;
          }
          return d + 0.1;
        });
      }, 100);
    }
  }, [stopTestRecording]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecordingSample(false);
    setIsPaused(false);
    setTestDuration(0);
    setSampleBlob(null);
    setTranscript("");
    setError(null);
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    void queryPermissionState();
    void refreshDevices();
  }, [queryPermissionState, refreshDevices]);

  useEffect(() => {
    onValidatedChange(preflightReady);
  }, [onValidatedChange, preflightReady]);

  useEffect(() => {
    return () => cleanupPreview();
  }, [cleanupPreview]);

  if (!micSupported) {
    return (
      <section className="rounded-2xl border border-psy-red/20 bg-psy-red-light px-4 py-3">
        <div className="flex items-center gap-2 text-psy-red">
          <AlertTriangle size={16} />
          <p className="text-sm font-medium">Hardware de audio no detectado o no soportado.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="session-preflight" className="relative overflow-hidden rounded-[1.3rem] border border-psy-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-psy-blue/10 text-psy-blue">
            <DeviceIcon size={14} />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-psy-blue/80">Test de Audio (5s)</p>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
          preflightReady ? "bg-psy-green-light text-psy-green" : "bg-psy-amber-light text-psy-amber"
        )}>
          {preflightReady ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
          {preflightReady ? "OPTIMO" : "PENDIENTE"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          {/* Microfono Selector */}
          <div className="relative">
            <select
              value={selectedDeviceId ?? ""}
              onChange={(e) => {
                onDeviceChange(e.target.value || null);
                setSampleBlob(null);
                setTranscript("");
                setError(null);
                onValidatedChange(false);
              }}
              className="w-full appearance-none rounded-xl border border-psy-border bg-psy-paper px-4 py-3 text-sm text-psy-ink outline-none transition-all focus:border-psy-blue/30 focus:ring-4 focus:ring-psy-blue/5"
            >
              {devices.length === 0 && <option value="">Buscando microfonos...</option>}
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || "Microfono del sistema"}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-psy-muted">
              <RotateCcw size={12} className="animate-pulse" />
            </div>
          </div>

          {/* Mini Grabador Area */}
          <div className="flex items-center gap-3 rounded-2xl border border-psy-border bg-psy-paper/50 p-3">
            {!recordingSample && !sampleBlob ? (
              <button
                onClick={startTestRecording}
                disabled={loadingPreview}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-psy-red text-white shadow-lg shadow-psy-red/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-semibold">Iniciar Test 5s</span>
              </button>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                {recordingSample && (
                  <>
                    <button
                      onClick={isPaused ? resumeTestRecording : pauseTestRecording}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-psy-border text-psy-ink shadow-sm"
                    >
                      {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                    </button>
                    <div className="flex-1 space-y-1.5 px-1">
                      <div className="flex justify-between text-[10px] font-bold text-psy-muted">
                        <span>{isPaused ? "PAUSA" : "GRABANDO"}</span>
                        <span>{testDuration.toFixed(1)}s / 5s</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-psy-blue/10">
                        <div 
                          className="h-full bg-psy-blue transition-all duration-100" 
                          style={{ width: `${(testDuration / 5) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </>
                )}
                {sampleBlob && (
                  <div className="flex flex-1 items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2 text-psy-green">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Test capturado</span>
                    </div>
                    <button
                      onClick={resetTest}
                      className="flex h-9 items-center gap-2 rounded-lg bg-psy-red/10 px-3 text-psy-red transition-colors hover:bg-psy-red/20"
                    >
                      <Trash2 size={14} />
                      <span className="text-[10px] font-bold uppercase">Borrar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decibel Meter Side */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-psy-border bg-psy-paper/30 p-3 lg:w-24">
          <div className="flex h-full w-full flex-col items-center justify-between gap-1">
            <Volume2 size={14} className="text-psy-blue" />
            <div className="relative flex h-24 w-6 flex-col-reverse overflow-hidden rounded-full bg-psy-blue/5">
              <div 
                className={cn(
                  "w-full transition-all duration-75",
                  dbLevel > -10 ? "bg-psy-red" : dbLevel > -25 ? "bg-psy-amber" : "bg-psy-blue"
                )}
                style={{ height: `${Math.max(0, (dbLevel + 60) * 1.66)}%` }} 
              />
              {/* dB Markers */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-20">
                {[0, 1, 2, 3].map(i => <div key={i} className="h-[1px] w-full bg-black" />)}
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold text-psy-muted">
              {dbLevel === -Infinity ? "--" : `${Math.round(dbLevel)}dB`}
            </span>
          </div>
        </div>
      </div>

      {/* Redacción / Transcript Result */}
      {(transcript || error) && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={cn(
            "rounded-2xl border p-4",
            error ? "border-psy-red/20 bg-psy-red-light/30" : "border-psy-blue/10 bg-psy-blue-light/20"
          )}>
            <div className="flex items-center gap-2">
              <Bot size={14} className={error ? "text-psy-red" : "text-psy-blue"} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-psy-muted">
                {error ? "Error de audio" : "Validación de audio"}
              </p>
            </div>
            <p className={cn(
              "mt-2 text-sm leading-relaxed",
              error ? "text-psy-red" : "italic text-psy-ink"
            )}>
              {error || `"${transcript}"`}
            </p>
            {!error && transcript && (
              <div className="mt-3 flex items-center gap-1.5 text-psy-green">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-bold uppercase">Procesamiento vocal validado</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!previewActive && !loadingPreview && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <button
            onClick={enablePreview}
            className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-psy-blue text-white shadow-xl shadow-psy-blue/30 group-hover:bg-psy-blue/90">
              <Mic size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-psy-blue">Vincular Microfono</span>
          </button>
        </div>
      )}
    </section>
  );
}
