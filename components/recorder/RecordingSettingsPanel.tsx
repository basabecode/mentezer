"use client";

import { SlidersHorizontal } from "lucide-react";

export interface RecordingSettings {
  audioQuality: "standard" | "high";
  format: "webm" | "wav";
  noiseCancellation: boolean;
  diarization: boolean;
  language: "es" | "en";
  safetyTrack: boolean;
  preRecordSeconds: 0 | 3 | 5;
}

interface RecordingSettingsPanelProps {
  settings: RecordingSettings;
  onChange: (settings: RecordingSettings) => void;
  preflightReady: boolean;
}

export function RecordingSettingsPanel({
  settings,
  onChange,
  preflightReady,
}: RecordingSettingsPanelProps) {
  const update = <K extends keyof RecordingSettings>(key: K, value: RecordingSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const toggles = [
    {
      key: "noiseCancellation" as const,
      label: "Cancelación de ruido",
      helper: "Reduce ruido ambiente y eco.",
      activeTone: "bg-[#eaf6fb] text-[#427e97]",
      inactiveTone: "bg-[#f4f7f8] text-[#6c7a82]",
    },
    {
      key: "diarization" as const,
      label: "Identificación de hablantes",
      helper: "Separa psicólogo y paciente.",
      activeTone: "bg-[#f1ebff] text-[#7857d5]",
      inactiveTone: "bg-[#f4f1f9] text-[#7e7393]",
    },
    {
      key: "safetyTrack" as const,
      label: "Pista de seguridad",
      helper: "Copia defensiva del audio.",
      activeTone: "bg-[#eef5ea] text-[#5e8a53]",
      inactiveTone: "bg-[#f4f6f2] text-[#6f7d6a]",
    },
  ];

  const chips = [
    {
      label: settings.audioQuality === "high" ? "Alta 48kHz" : "Standard 16kHz",
      tone: "border-[#d7eaf2] bg-white/95 text-[#417d96]",
    },
    {
      label: settings.format.toUpperCase(),
      tone: "border-[#ddd4f4] bg-white/95 text-[#7857d5]",
    },
    {
      label: settings.preRecordSeconds > 0 ? `${settings.preRecordSeconds}s pre` : "Sin pre",
      tone: "border-[#ece7d9] bg-white/95 text-[#8f6a2d]",
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-[#d8e8ef] bg-[linear-gradient(180deg,#f3f9fc_0%,#ffffff_100%)] p-4 shadow-[0_8px_18px_rgba(13,34,50,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-psy-blue/80">Configuración</p>
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${preflightReady ? "border-psy-green/20 bg-psy-green-light text-psy-green" : "border-psy-amber/20 bg-psy-amber-light text-psy-amber"}`}>
          <SlidersHorizontal size={12} />
          {preflightReady ? "Sistema listo" : "Chequeo pendiente"}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span key={chip.label} className={`rounded-full border px-2.5 py-1 text-[11px] ${chip.tone}`}>
            {chip.label}
          </span>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="rounded-[0.9rem] border border-[#d7e3e8] bg-white/90 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-psy-muted">Calidad</span>
          <select
            value={settings.audioQuality}
            onChange={(e) => update("audioQuality", e.target.value as RecordingSettings["audioQuality"])}
            className="mt-1.5 w-full bg-transparent text-sm font-medium text-psy-ink outline-none"
          >
            <option value="standard">Standard 16kHz</option>
            <option value="high">Alta 48kHz</option>
          </select>
        </label>

        <label className="rounded-[0.9rem] border border-[#d7e3e8] bg-white/90 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-psy-muted">Formato</span>
          <select
            value={settings.format}
            onChange={(e) => update("format", e.target.value as RecordingSettings["format"])}
            className="mt-1.5 w-full bg-transparent text-sm font-medium text-psy-ink outline-none"
          >
            <option value="webm">WEBM Opus</option>
            <option value="wav">WAV</option>
          </select>
        </label>

        <label className="rounded-[0.9rem] border border-[#d7e3e8] bg-white/90 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-psy-muted">Idioma</span>
          <select
            value={settings.language}
            onChange={(e) => update("language", e.target.value as RecordingSettings["language"])}
            className="mt-1.5 w-full bg-transparent text-sm font-medium text-psy-ink outline-none"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </label>

        <label className="rounded-[0.9rem] border border-[#d7e3e8] bg-white/90 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-psy-muted">Pregrabación</span>
          <select
            value={String(settings.preRecordSeconds)}
            onChange={(e) => update("preRecordSeconds", Number(e.target.value) as RecordingSettings["preRecordSeconds"])}
            className="mt-1.5 w-full bg-transparent text-sm font-medium text-psy-ink outline-none"
          >
            <option value="0">Desactivada</option>
            <option value="3">3 segundos</option>
            <option value="5">5 segundos</option>
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-2">
        {toggles.map((item) => {
          const enabled = settings[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => update(item.key, !enabled)}
              className={`flex items-center justify-between gap-4 rounded-[0.9rem] border px-3 py-2.5 text-left transition-colors ${enabled ? "border-[#d4e6ec] bg-white" : "border-[#e5ecef] bg-white/75 hover:bg-white/90"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${enabled ? item.activeTone : item.inactiveTone}`}>
                  {enabled ? "Activa" : "Inactiva"}
                </span>
                <div>
                  <p className="text-sm font-medium text-psy-ink">{item.label}</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-psy-muted">{item.helper}</p>
                </div>
              </div>

              <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-psy-blue" : "bg-psy-border"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${enabled ? "left-4" : "left-0.5"}`} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
