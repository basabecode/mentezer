"use client";

import { useEffect, useState } from "react";

type FieldTone = "neutral" | "info" | "success";

export type ClinicalReportField = {
  id: string;
  label: string;
  content: string;
  meta?: string;
  tags?: string[];
  tone?: FieldTone;
};

type ClinicalReportPlaybackProps = {
  title?: string;
  subtitle?: string;
  processingLabel?: string;
  completeLabel?: string;
  fields: ClinicalReportField[];
  compact?: boolean;
  resetKey?: string | number;
  initialDelayMs?: number;
  charDelayMs?: number;
  fieldPauseMs?: number;
  charsPerTick?: number;
  showSubtitle?: boolean;
  showHeaderStatus?: boolean;
  showFieldStatus?: boolean;
};

const toneClasses: Record<
  FieldTone,
  { panel: string; label: string; dot: string; tag: string; glow: string }
> = {
  neutral: {
    panel: "border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(0,0,0,0.1)] backdrop-blur-2xl",
    label: "text-psy-muted",
    dot: "bg-psy-ink/60",
    tag: "border-psy-ink/20 bg-white/50 text-psy-ink",
    glow: "bg-psy-amber",
  },
  info: {
    panel: "border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(59,111,160,0.15)] backdrop-blur-2xl",
    label: "text-psy-blue",
    dot: "bg-psy-blue",
    tag: "border-psy-blue/30 bg-white/50 text-psy-blue",
    glow: "bg-psy-blue",
  },
  success: {
    panel: "border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(74,124,89,0.15)] backdrop-blur-2xl",
    label: "text-psy-green",
    dot: "bg-psy-green",
    tag: "border-psy-green/30 bg-white/50 text-psy-green",
    glow: "bg-psy-green",
  },
};

export function ClinicalReportPlayback({
  title = "Informe clínico estructurado",
  subtitle = "La IA organiza el cierre sin borrar tu criterio clínico.",
  processingLabel = "IA estructurando el reporte",
  completeLabel = "Reporte listo para revisar",
  fields,
  compact = false,
  resetKey,
  initialDelayMs,
  charDelayMs,
  fieldPauseMs,
  charsPerTick,
  showSubtitle = true,
  showHeaderStatus = true,
  showFieldStatus = true,
}: ClinicalReportPlaybackProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [typedTexts, setTypedTexts] = useState<string[]>(() =>
    fields.map(() => ""),
  );
  const [activeField, setActiveField] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let fieldIndex = 0;
    let charIndex = 0;

    const baseDelay = charDelayMs ?? (compact ? 26 : 30);
    const pauseDelay = fieldPauseMs ?? (compact ? 900 : 1100);
    const startDelay = initialDelayMs ?? (compact ? 700 : 850);
    const charsStep = charsPerTick ?? 1;

    setTypedTexts(fields.map(() => ""));
    setActiveField(0);
    setIsComplete(false);
    setHasStarted(false);

    const tick = () => {
      if (cancelled) return;

      if (fieldIndex >= fields.length) {
        setIsComplete(true);
        return;
      }

      const field = fields[fieldIndex];
      const nextIndex = Math.min(
        field.content.length,
        charIndex + charsStep,
      );

      setHasStarted(true);
      setActiveField(fieldIndex);
      setTypedTexts((prev) => {
        const next = [...prev];
        next[fieldIndex] = field.content.slice(0, nextIndex);
        return next;
      });

      if (nextIndex < field.content.length) {
        charIndex = nextIndex;
        timeoutId = setTimeout(tick, baseDelay);
        return;
      }

      fieldIndex += 1;
      charIndex = 0;
      timeoutId = setTimeout(tick, pauseDelay);
    };

    timeoutId = setTimeout(tick, startDelay);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    charDelayMs,
    charsPerTick,
    compact,
    fieldPauseMs,
    fields,
    hasMounted,
    initialDelayMs,
    resetKey,
  ]);

  return (
    <div className="report-surface relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-psy-ink via-[#1C2C35] to-psy-ink p-5 md:p-7">
      {/* Blurred background orbs for inner glass effect */}
      <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-psy-blue/30 blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-psy-green/25 blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-psy-amber-light drop-shadow-sm">
            {title}
          </p>
          {showSubtitle && subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80 font-medium">
              {subtitle}
            </p>
          ) : null}
        </div>

        {showHeaderStatus ? (
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-sm uppercase tracking-wide ${
              isComplete
                ? "border border-psy-green/40 bg-psy-green/20 text-white"
                : "border border-psy-blue/40 bg-psy-blue/20 text-white"
            }`}
          >
            {!isComplete ? (
              <span className="thinking-ring h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-current" />
            )}
            {isComplete ? completeLabel : processingLabel}
          </div>
        ) : null}
      </div>

      <div className={`relative z-10 mt-6 space-y-4 ${compact ? "md:space-y-3" : ""}`}>
        {fields.map((field, index) => {
          const tone = toneClasses[field.tone ?? "neutral"];
          const typedText = typedTexts[index] ?? "";
          const isFieldVisible = isComplete || index <= activeField;
          const isCurrent = !isComplete && index === activeField;
          const isFieldComplete = typedText.length === field.content.length;
          const showTypedText = hasMounted && hasStarted;

          return (
            <div key={field.id} className="group relative">
              {/* Glow Border (Blow Border) Effect */}
              <div className={`absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 blur-md ${isFieldVisible ? "group-hover:opacity-80" : ""} ${tone.glow}`} />
              <div className={`absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 ${isFieldVisible ? "group-hover:opacity-100" : ""} ${tone.glow}`} />

              {/* Glass Grid Panel */}
              <div
                className={`relative z-10 m-[1px] flex flex-col rounded-[calc(1.25rem-1px)] border p-4 md:p-5 transition-all duration-300 ${
                  isFieldVisible
                    ? tone.panel
                    : "border-white/10 bg-white/20 text-white/30 backdrop-blur-md"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={`font-mono text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors duration-300 ${isFieldVisible ? tone.label : "text-white/30"}`}
                  >
                    {field.label}
                  </p>
                  {showFieldStatus ? (
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isFieldVisible ? tone.dot : "bg-white/20"}`} />
                      <span className={`text-[11px] font-medium transition-colors duration-300 ${isFieldVisible ? "text-psy-ink/60" : "text-white/30"}`}>
                        {isFieldComplete
                          ? "Completo"
                          : isCurrent
                            ? "Escribiendo"
                            : "En cola"}
                      </span>
                    </div>
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${isFieldVisible ? tone.dot : "bg-white/20"}`} />
                  )}
                </div>

                <p className={`mt-3 text-[14px] leading-[1.6] md:text-[15px] font-medium transition-colors duration-300 ${isFieldVisible ? "text-psy-ink/90" : "text-white/30"}`}>
                  {showTypedText ? typedText : ""}
                  {showTypedText && isCurrent && !isFieldComplete ? (
                    <span className="type-caret text-psy-ink">|</span>
                  ) : null}
                </p>

                {showTypedText && field.meta && isFieldComplete ? (
                  <p className="mt-3 text-xs font-medium leading-5 text-psy-ink/60">
                    {field.meta}
                  </p>
                ) : null}

                {showTypedText && field.tags?.length && isFieldComplete ? (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {field.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${tone.tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
