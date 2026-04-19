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
    panel: "border-psy-ink/10 bg-white/80",
    label: "text-psy-muted",
    dot: "bg-psy-ink/40",
    tag: "border-psy-ink/10 bg-white text-psy-muted",
  },
  info: {
    panel: "border-psy-blue/20 bg-psy-blue-light",
    label: "text-psy-blue",
    dot: "bg-psy-blue",
    tag: "border-psy-blue/20 bg-white/70 text-psy-blue",
  },
  success: {
    panel: "border-psy-green/20 bg-psy-green-light",
    label: "text-psy-green",
    dot: "bg-psy-green",
    tag: "border-psy-green/20 bg-white/70 text-psy-green",
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
    <div className="report-surface rounded-3xl border border-psy-ink/10 bg-psy-paper/90 p-4 md:p-5">
      <div className="flex flex-col gap-3 border-b border-psy-ink/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
            {title}
          </p>
          {showSubtitle && subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-psy-ink/70">
              {subtitle}
            </p>
          ) : null}
        </div>

        {showHeaderStatus ? (
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              isComplete
                ? "bg-psy-green-light text-psy-green"
                : "bg-psy-blue-light text-psy-blue"
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
              className={`rounded-2xl border p-4 transition-all duration-300 ${tone.panel}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`font-mono text-xs uppercase tracking-widest ${tone.label}`}
                >
                  {field.label}
                </p>
                {showFieldStatus ? (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                    <span className="text-xs text-psy-ink/55">
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

              <p className="mt-2.5 text-sm leading-6 text-psy-ink md:text-sm">
                {showTypedText ? typedText : ""}
                {showTypedText && isCurrent && !isFieldComplete ? (
                  <span className="type-caret">|</span>
                ) : null}
              </p>

              {showTypedText && field.meta && isFieldComplete ? (
                <p className="mt-2 text-xs leading-5 text-psy-ink/60">
                  {field.meta}
                </p>
              ) : null}

              {showTypedText && field.tags?.length && isFieldComplete ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-widest ${tone.tag}`}
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
