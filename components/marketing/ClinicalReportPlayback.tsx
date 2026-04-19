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
  { panel: string; label: string; dot: string; tag: string }
> = {
  neutral: {
    panel: "border-[rgba(13,34,50,0.08)] bg-white/78",
    label: "text-[var(--psy-muted)]",
    dot: "bg-[rgba(13,34,50,0.42)]",
    tag: "border-[rgba(13,34,50,0.10)] bg-white text-[var(--psy-muted)]",
  },
  info: {
    panel: "border-[rgba(21,134,160,0.18)] bg-[var(--psy-blue-light)]",
    label: "text-[var(--psy-blue)]",
    dot: "bg-[var(--psy-blue)]",
    tag: "border-[rgba(21,134,160,0.18)] bg-white/72 text-[var(--psy-blue)]",
  },
  success: {
    panel: "border-[rgba(39,137,94,0.18)] bg-[var(--psy-green-light)]",
    label: "text-[var(--psy-green)]",
    dot: "bg-[var(--psy-green)]",
    tag: "border-[rgba(39,137,94,0.18)] bg-white/72 text-[var(--psy-green)]",
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
    <div className="report-surface rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(248,252,253,0.94)] p-4 md:p-5">
      <div className="flex flex-col gap-3 border-b border-[rgba(13,34,50,0.07)] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--psy-muted)]">
            {title}
          </p>
          {showSubtitle && subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-[rgba(13,34,50,0.72)]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {showHeaderStatus ? (
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium ${
              isComplete
                ? "bg-[var(--psy-green-light)] text-[var(--psy-green)]"
                : "bg-[var(--psy-blue-light)] text-[var(--psy-blue)]"
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

      <div className={`mt-4 space-y-3 ${compact ? "md:space-y-2.5" : ""}`}>
        {fields.map((field, index) => {
          const tone = toneClasses[field.tone ?? "neutral"];
          const typedText = typedTexts[index] ?? "";
          const isCurrent = !isComplete && index === activeField;
          const isFieldComplete = typedText.length === field.content.length;
          const showTypedText = hasMounted && hasStarted;

          return (
            <div
              key={field.id}
              className={`rounded-[1.2rem] border p-4 transition-all duration-300 ${tone.panel}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.28em] ${tone.label}`}
                >
                  {field.label}
                </p>
                {showFieldStatus ? (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                    <span className="text-[11px] text-[rgba(13,34,50,0.56)]">
                      {isFieldComplete
                        ? "Completo"
                        : isCurrent
                          ? "Escribiendo"
                          : "En cola"}
                    </span>
                  </div>
                ) : (
                  <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                )}
              </div>

              <p className="mt-2.5 text-sm leading-6 text-[var(--psy-ink)] md:text-[15px]">
                {showTypedText ? typedText : ""}
                {showTypedText && isCurrent && !isFieldComplete ? (
                  <span className="type-caret">|</span>
                ) : null}
              </p>

              {showTypedText && field.meta && isFieldComplete ? (
                <p className="mt-2 text-xs leading-5 text-[rgba(13,34,50,0.58)]">
                  {field.meta}
                </p>
              ) : null}

              {showTypedText && field.tags?.length && isFieldComplete ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${tone.tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
