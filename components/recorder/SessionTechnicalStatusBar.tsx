"use client";

import type { RecorderState } from "@/components/recorder/SessionRecorder";

interface SessionTechnicalStatusBarProps {
  recorderState: RecorderState;
  preflightReady: boolean;
  selectedDeviceId: string | null;
  lastSavedAt: string | null;
  transcriptCount: number;
}

function savedLabel(savedAt: string | null) {
  if (!savedAt) return "Sin borrador";
  return new Date(savedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function SessionTechnicalStatusBar({
  recorderState,
  preflightReady,
  selectedDeviceId,
  lastSavedAt,
  transcriptCount,
}: SessionTechnicalStatusBarProps) {
  const items = [
    {
      label: "Microfono",
      value: recorderState === "recording" || recorderState === "paused" ? "Activo" : "Listo",
      tone: recorderState === "recording" || recorderState === "paused" ? "text-[#95e1ff]" : "text-white/74",
      dot: recorderState === "recording" || recorderState === "paused" ? "bg-[#57c8f0]" : "bg-white/30",
    },
    {
      label: "Entrada",
      value: selectedDeviceId ? "Seleccionada" : "Por defecto",
      tone: "text-[#cfeaff]",
      dot: "bg-[#5fa6c2]",
    },
    {
      label: "Preflight",
      value: preflightReady ? "Validado" : "Pendiente",
      tone: preflightReady ? "text-[#9de0b8]" : "text-[#f3d58b]",
      dot: preflightReady ? "bg-[#67c08b]" : "bg-[#e6b54c]",
    },
    {
      label: "Transcripcion",
      value: transcriptCount > 0 ? `${transcriptCount} segmentos` : "Sin lectura",
      tone: transcriptCount > 0 ? "text-[#d8c7ff]" : "text-white/74",
      dot: transcriptCount > 0 ? "bg-[#9b7aff]" : "bg-white/30",
    },
    {
      label: "Borrador local",
      value: savedLabel(lastSavedAt),
      tone: lastSavedAt ? "text-[#ffd8a8]" : "text-white/74",
      dot: lastSavedAt ? "bg-[#d59a4a]" : "bg-white/30",
    },
    {
      label: "Storage",
      value: "Mock local",
      tone: "text-[#cfeaff]",
      dot: "bg-[#5fa6c2]",
    },
    {
      label: "Conexion",
      value: "Lista",
      tone: "text-[#9de0b8]",
      dot: "bg-[#67c08b]",
    },
  ];

  return (
    <section className="rounded-[1.6rem] border border-[#1a1d20] bg-[linear-gradient(180deg,#191d1f_0%,#131517_100%)] px-4 py-3.5 text-white shadow-[0_18px_34px_rgba(13,16,18,0.18)]">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
        {items.map((item) => (
          <div key={item.label} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.dot}`} />
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
            </div>
            <p className={`mt-1 text-sm font-medium ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
