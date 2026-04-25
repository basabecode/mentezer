"use client";

import { Bookmark, FilePenLine, Sparkles, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SessionQuickActionsProps {
  canMark: boolean;
  canSummarize: boolean;
  canFinalize: boolean;
  cueCount: number;
  noteCount: number;
  onAddCue: () => void;
  onAddNote: () => void;
  onGenerateSummary: () => void;
  onFinalize: () => void;
}

export function SessionQuickActions({
  canMark,
  canSummarize,
  canFinalize,
  cueCount,
  noteCount,
  onAddCue,
  onAddNote,
  onGenerateSummary,
  onFinalize,
}: SessionQuickActionsProps) {
  const items = [
    {
      label: "Marcar momento",
      helper: cueCount > 0 ? `${cueCount} marcas` : "Guardar hito clínico",
      icon: Bookmark,
      onClick: onAddCue,
      disabled: !canMark,
      tone: "border-psy-warm-border bg-[linear-gradient(180deg,oklch(97% 0.02 265)_0%,#ffffff_100%)]",
      iconTone: "bg-[#edf5f9] text-[#497d93]",
    },
    {
      label: "Agregar nota",
      helper: noteCount > 0 ? `${noteCount} notas` : "Capturar observación",
      icon: FilePenLine,
      onClick: onAddNote,
      disabled: false,
      tone: "border-[#ece2d6] bg-[linear-gradient(180deg,#fff8ef_0%,#ffffff_100%)]",
      iconTone: "bg-[#fff1de] text-[#bf7b32]",
    },
    {
      label: "Resumen IA",
      helper: canSummarize ? "Sintetizar lo capturado" : "Con transcripción",
      icon: Sparkles,
      onClick: onGenerateSummary,
      disabled: !canSummarize,
      tone: "border-[#e6dcff] bg-[linear-gradient(180deg,#f8f4ff_0%,#ffffff_100%)]",
      iconTone: "bg-[#efe6ff] text-[#7857d5]",
    },
    {
      label: "Finalizar",
      helper: canFinalize ? "Cerrar y procesar" : "Activo al grabar",
      icon: UploadCloud,
      onClick: onFinalize,
      disabled: !canFinalize,
      tone: "border-[#d8e8ef] bg-[linear-gradient(180deg,#eef8fc_0%,#ffffff_100%)]",
      iconTone: "bg-[#e5f3f9] text-[#3d7c96]",
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-[#eadfcf] bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)] p-3.5 shadow-[0_8px_20px_rgba(13,34,50,0.04)]">
      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ba7d3f]">Acciones</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex min-h-[76px] flex-col items-start justify-between rounded-[1rem] border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                item.tone,
              )}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", item.iconTone)}>
                <Icon size={14} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-psy-ink">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-psy-muted">{item.helper}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
