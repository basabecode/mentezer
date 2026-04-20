"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Loader2, Mic, RefreshCw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

interface AudioPreflightPanelProps {
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string | null) => void;
  onValidatedChange: (ready: boolean) => void;
}

interface AudioDiagnostics {
  label: string;
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
  const [validatingAI, setValidatingAI] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const [sampleBlob, setSampleBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<AudioDiagnostics | null>(null);

  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);

  const micSupported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const aiValidated = transcript.trim().length >= 3;
  const preflightReady = permissionState === "granted" && !!sampleBlob && aiValidated;

  const selectedDeviceLabel = useMemo(() => {
    return devices.find((device) => device.deviceId === selectedDeviceId)?.label || "Micrófono por defecto";
  }, [devices, selectedDeviceId]);

  const cleanupPreview = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    previewStreamRef.current?.getTracks().forEach((track) => track.stop());
    previewStreamRef.current = null;
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    setPreviewActive(false);
    setAudioLevel(0);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!micSupported) {
      setPermissionState("unsupported");
      return;
    }

    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const inputs = allDevices.filter((device) => device.kind === "audioinput");
    setDevices(inputs);

    if (!selectedDeviceId && inputs[0]) {
      onDeviceChange(inputs[0].deviceId || null);
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
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const enablePreview = useCallback(async () => {
    if (!micSupported) {
      setPermissionState("unsupported");
      setError("Este navegador no soporta la prueba de audio.");
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

      const track = stream.getAudioTracks()[0];
      setDiagnostics({
        label: track?.label || selectedDeviceLabel,
      });

      beginLevelMonitor(stream);
      await refreshDevices();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "El navegador no tiene permiso para usar el micrófono."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No se encontró un micrófono disponible."
            : "No fue posible iniciar la prueba de micrófono.";
      setError(message);
      setPermissionState(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "prompt");
    } finally {
      setLoadingPreview(false);
    }
  }, [beginLevelMonitor, cleanupPreview, micSupported, refreshDevices, selectedDeviceId, selectedDeviceLabel]);

  const recordSample = useCallback(async () => {
    if (!previewStreamRef.current) {
      await enablePreview();
    }

    const stream = previewStreamRef.current;
    if (!stream) return;

    setRecordingSample(true);
    setError(null);
    setTranscript("");
    onValidatedChange(false);

    try {
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.start(500);

      await new Promise<void>((resolve) => {
        window.setTimeout(() => {
          recorder.onstop = () => resolve();
          recorder.stop();
        }, 3500);
      });

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setSampleBlob(blob);
      setSampleUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return url;
      });
    } catch {
      setError("No se pudo grabar la muestra.");
    } finally {
      setRecordingSample(false);
      cleanupPreview();
    }
  }, [cleanupPreview, enablePreview, onValidatedChange]);

  const validateWithAI = useCallback(async () => {
    if (!sampleBlob) {
      setError("Primero realiza una grabación de prueba.");
      return;
    }

    setValidatingAI(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", sampleBlob, "preflight-sample.webm");

      const res = await fetch("/api/sessions/preflight", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo validar la prueba");
      }

      setTranscript(data.transcript ?? "Prueba recibida.");
      onValidatedChange((data.transcript ?? "").trim().length >= 3);
    } catch (err) {
      setTranscript("");
      onValidatedChange(false);
      setError(err instanceof Error ? err.message : "No se pudo validar la prueba.");
    } finally {
      setValidatingAI(false);
    }
  }, [onValidatedChange, sampleBlob]);

  useEffect(() => {
    void queryPermissionState();
    void refreshDevices();
  }, [queryPermissionState, refreshDevices]);

  useEffect(() => {
    if (!micSupported) return;

    const handleDeviceChange = () => {
      void refreshDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
  }, [micSupported, refreshDevices]);

  useEffect(() => {
    onValidatedChange(preflightReady);
  }, [onValidatedChange, preflightReady]);

  useEffect(() => {
    return () => {
      cleanupPreview();
      if (sampleUrl) URL.revokeObjectURL(sampleUrl);
    };
  }, [cleanupPreview, sampleUrl]);

  const levelLabel =
    audioLevel >= 0.58 ? "Saturado"
    : audioLevel >= 0.28 ? "Correcto"
    : audioLevel >= 0.14 ? "Bajo"
    : "Sin señal";

  const transcriptLabel = transcript || "La transcripción de la prueba aparecerá aquí.";

  return (
    <section className="rounded-2xl border border-psy-border/80 bg-white/72 px-3 py-2.5 shadow-[0_8px_18px_rgba(46,46,46,0.03)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-psy-blue/80">
            Prueba rápida
          </p>
          <div
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
              preflightReady
                ? "border-psy-green/20 bg-psy-green-light text-psy-green"
                : "border-psy-amber/20 bg-psy-amber-light text-psy-amber",
            )}
          >
            {preflightReady ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
            {preflightReady ? "Lista" : "Pendiente"}
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(180px,240px)_repeat(3,max-content)] lg:items-center">
          <label className="min-w-0 rounded-xl border border-psy-border bg-white px-3 py-2">
            <span className="block text-[9px] uppercase tracking-[0.2em] text-psy-muted">Micrófono</span>
            <select
              value={selectedDeviceId ?? ""}
              onChange={(event) => onDeviceChange(event.target.value || null)}
              className="mt-1 w-full bg-transparent text-sm text-psy-ink outline-none"
            >
              {devices.length === 0 && <option value="">Micrófono por defecto</option>}
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Micrófono disponible"}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 sm:grid-cols-3 lg:contents">
            <button
              type="button"
              onClick={previewActive ? cleanupPreview : enablePreview}
              disabled={loadingPreview || !micSupported}
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-psy-ink/10 bg-white px-3.5 text-sm font-medium text-psy-ink transition-colors hover:bg-psy-cream/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPreview ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} />}
              Habilitar
            </button>

            <button
              type="button"
              onClick={recordSample}
              disabled={recordingSample || loadingPreview || !micSupported}
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-psy-blue/18 bg-psy-blue/10 px-3.5 text-sm font-medium text-psy-blue transition-colors hover:bg-psy-blue/14 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recordingSample ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Probar grabación
            </button>

            <button
              type="button"
              onClick={validateWithAI}
              disabled={validatingAI || !sampleBlob}
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-psy-green/18 bg-psy-green-light px-3.5 text-sm font-medium text-psy-green transition-colors hover:bg-psy-green-light/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {validatingAI ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
              Confirmar pruebas
            </button>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
          <div className="rounded-xl border border-psy-border bg-psy-cream/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-psy-blue" />
              <span className="text-sm font-medium text-psy-ink">Nivel</span>
              <span className="ml-auto text-[11px] text-psy-muted">{levelLabel}</span>
            </div>
            <div className="mt-2 flex items-end gap-1">
              {Array.from({ length: 12 }).map((_, index) => {
                const active = Math.round(audioLevel * 9) >= index;
                return (
                  <span
                    key={index}
                    className={cn("w-2 rounded-full transition-all", active ? "bg-psy-blue" : "bg-psy-blue/15")}
                    style={{ height: 6 + (index % 4) * 5 }}
                  />
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-psy-muted">
              Ajusta la ganancia del sistema si está bajo o saturado.
            </p>
          </div>

          <div className="rounded-xl border border-psy-border bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] uppercase tracking-[0.2em] text-psy-muted">Confirmación IA</p>
              <span className="text-[11px] text-psy-muted">{diagnostics?.label || selectedDeviceLabel}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-psy-ink">{transcriptLabel}</p>
          </div>

          <div className="flex items-center justify-start lg:justify-end">
            {sampleUrl ? (
              <audio controls src={sampleUrl} className="h-9 w-full max-w-[250px]" />
            ) : (
              <span className="text-[11px] text-psy-muted">Sin muestra todavía</span>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-psy-red/20 bg-psy-red-light px-3 py-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-psy-red" />
            <p className="text-[11px] leading-relaxed text-psy-red">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}
