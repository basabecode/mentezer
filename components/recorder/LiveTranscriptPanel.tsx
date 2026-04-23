"use client";

import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface LiveTranscriptSegment {
  id: string;
  speaker: "Paciente" | "Psicologo" | "Otro";
  text: string;
  timestampLabel: string;
  live?: boolean;
}

interface LiveTranscriptPanelProps {
  segments: LiveTranscriptSegment[];
  statusLabel: string;
}

export function LiveTranscriptPanel({ segments, statusLabel }: LiveTranscriptPanelProps) {
  const visibleSegments = segments.slice(-4);

  return (
    <section className="rounded-[1.7rem] border border-psy-border bg-white p-4 shadow-[0_10px_22px_rgba(13,34,50,0.04)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-blue/80">Transcripcion en vivo</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-psy-ink">Lectura clinica reciente</h3>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-psy-green/20 bg-psy-green-light px-3 py-1.5 text-xs font-medium text-psy-green">
          <span className="h-2 w-2 rounded-full bg-current" />
          {statusLabel}
        </div>
      </div>

      <div className="mt-4 space-y-2" aria-live="polite">
        {visibleSegments.length > 0 ? (
          visibleSegments.map((segment) => (
            <article key={segment.id} className="rounded-[1.15rem] border border-psy-border bg-[#fbfcfc] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium",
                    segment.speaker === "Paciente"
                      ? "bg-[#f1ebff] text-[#7857d5]"
                      : segment.speaker === "Psicologo"
                        ? "bg-[#e9f5ff] text-[#3f7eae]"
                        : "bg-[#eef3f1] text-psy-muted",
                  )}
                >
                  {segment.speaker}
                </span>
                <span className="text-[11px] text-psy-muted">{segment.timestampLabel}</span>
                {segment.live && <span className="ml-auto text-[10px] font-medium text-psy-green">En vivo</span>}
              </div>
              <p className="mt-2 text-sm leading-6 text-psy-ink">{segment.text}</p>
            </article>
          ))
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-psy-border bg-[#fbfcfc] px-6 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6f9] text-psy-blue">
              <MessageSquareText size={18} />
            </div>
            <p className="mt-4 text-base font-medium tracking-tight text-psy-ink">Esperando lectura en vivo</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-psy-muted">
              Cuando el audio entre en captura, aqui apareceran los ultimos fragmentos con hablante y tiempo.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[1rem] border border-psy-border bg-white text-sm font-medium text-psy-ink transition-colors hover:bg-[#f8faf9]"
      >
        Ver transcripcion completa
      </button>
    </section>
  );
}
