"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClinicalReportPlayback } from "@/components/marketing/ClinicalReportPlayback";

/* ─── Icons ─── */
function IconBrain() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69 3 3 0 0 1 .38-5.74 2.5 2.5 0 0 1 3.12-3.61" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69 3 3 0 0 0-.38-5.74 2.5 2.5 0 0 0-3.12-3.61" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3z" />
      <path d="m19 15 1 2.4 2.5.8-2.5.8L19 21l-1-2-2.5-.8 2.5-.8 1-2.4z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ThinkingBadge({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "green" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[var(--psy-green-light)] text-[var(--psy-green)]"
      : tone === "amber"
        ? "bg-[var(--psy-amber-light)] text-[var(--psy-amber)]"
        : "bg-[var(--psy-blue-light)] text-[var(--psy-blue)]";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium ${toneClass}`}>
      <span className="thinking-ring h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent" />
      {label}
    </div>
  );
}

function TypewrittenBlock({
  text,
  resetKey,
  className = "",
  charDelayMs = 18,
  startDelayMs = 220,
}: {
  text: string;
  resetKey: string | number;
  className?: string;
  charDelayMs?: number;
  startDelayMs?: number;
}) {
  const [value, setValue] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let index = 0;

    setValue("");

    const tick = () => {
      if (cancelled) return;
      const next = Math.min(text.length, index + 1);
      setValue(text.slice(0, next));

      if (next >= text.length) return;

      index = next;
      timeoutId = setTimeout(tick, charDelayMs);
    };

    timeoutId = setTimeout(tick, startDelayMs);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [charDelayMs, hasMounted, resetKey, startDelayMs, text]);

  return (
    <p className={className}>
      {value}
      {hasMounted && value.length < text.length ? (
        <span className="type-caret">|</span>
      ) : null}
    </p>
  );
}

/* ─── Demo data ─── */
const PATIENT = {
  name: "Carlos M.",
  age: 28,
  sessions: 5,
  approach: "TCC",
  issue: "Ansiedad laboral",
};

const RAW_NOTES = `Carlos vino bastante tenso hoy. Menciona que no pudo dormir bien los últimos 3 días. Dice que en el trabajo le asignaron un nuevo proyecto y siente que "no va a poder" con todo.

Cuando le pregunté sobre el fin de semana, dijo que intentó descansar pero terminó revisando el correo. Se siente culpable cuando no trabaja. Aparece de nuevo el patrón de control y anticipación de falla.`;

const TRANSCRIPT_LINES = [
  "— Esta semana fue muy difícil. No dormí bien desde el lunes.",
  "— ¿Qué pasó el lunes específicamente?",
  "— Me avisaron que yo iba a liderar el nuevo proyecto. Y desde ahí...",
  "— ¿Cómo te sientes con eso?",
  "— Que no voy a poder. Que me van a ver fallar frente a todos.",
  "— ¿Y el fin de semana intentaste descansar?",
  "— Sí, pero terminé revisando el correo igual. Me siento culpable si no estoy disponible.",
];

const SOAP_NOTE = {
  S: "El paciente reporta insomnio de 3 noches asociado a la asignación de un nuevo proyecto laboral. Expresa dificultad para desconectarse durante el fin de semana y sentimientos de culpa al no estar en actividad productiva.",
  O: "Se presenta con tensión muscular visible, discurso acelerado y lenguaje centrado en rendimiento. Postura cerrada al hablar de expectativas ajenas.",
  A: "Se observa patrón persistente de regulación emocional basada en rendimiento. Hipótesis exploratoria: esquema de insuficiencia activado ante contextos de alta evaluación social.",
  P: "Continuar exploración del esquema de insuficiencia. Introducir registro de pensamientos automáticos ante situaciones de evaluación. Evaluar carga cognitiva actual con escala breve.",
};

const CITATION = {
  author: "Young et al. (2003)",
  page: "p. 88",
  text: "Esquema de insuficiencia/fracaso: creencia central de ser fundamentalmente incapaz de rendir al nivel percibido en los demás.",
};

const AI_REPORT = {
  patterns: [
    "Esquema de insuficiencia activado bajo presión evaluativa",
    "Culpa como señal de alarma ante la desconexión del rol laboral",
    "Anticipación catastrófica ante exposición pública al error",
  ],
  cie11: "QE84 — Dificultades asociadas al entorno laboral (hipótesis exploratoria)",
  risk: "Bajo",
  evolution: "Sesión 5 muestra mayor conciencia del patrón vs. Sesión 2. Progreso positivo en la identificación de disparadores.",
};

const LITE_REPORT_FIELDS = [
  {
    id: "subjective",
    label: "Subjetivo",
    content: SOAP_NOTE.S,
    meta: "Texto libre convertido a estructura clínica en segundos",
    tags: ["nota soap", "texto libre", "paciente activo"],
    tone: "neutral" as const,
  },
  {
    id: "analysis",
    label: "Análisis clínico",
    content: SOAP_NOTE.A,
    meta: `${CITATION.author}, ${CITATION.page} · soporte bibliográfico trazable`,
    tags: ["esquema", "cita clínica", "hipótesis"],
    tone: "info" as const,
  },
  {
    id: "plan",
    label: "Próxima sesión",
    content: SOAP_NOTE.P,
    meta: "Plan accionable listo para la siguiente consulta",
    tags: ["seguimiento", "tarea clínica", "continuidad"],
    tone: "success" as const,
  },
];

const PRO_REPORT_FIELDS = [
  {
    id: "subjective",
    label: "Subjetivo",
    content:
      "La transcripción confirma insomnio asociado a presión evaluativa, hipervigilancia laboral y culpa al desconectarse.",
    meta: "Fuente: audio de 52:17 ya transcrito y vinculado al caso",
    tags: ["audio", "transcripción", "caso activo"],
    tone: "neutral" as const,
  },
  {
    id: "analysis",
    label: "Análisis clínico",
    content:
      "PsyAssist detecta patrón persistente de regulación basada en rendimiento y sostiene la hipótesis con biblioteca clínica y evolución previa.",
    meta: `${CITATION.author}, ${CITATION.page} · CIE-11 exploratorio ${AI_REPORT.cie11}`,
    tags: ["cie-11", "biblioteca", "evolución"],
    tone: "info" as const,
  },
  {
    id: "next-session",
    label: "Próxima sesión",
    content:
      "Queda preparado un siguiente paso concreto: explorar esquema de insuficiencia, registrar pensamientos automáticos y decidir si conviene interconsulta.",
    meta: "Acción clínica inmediata con salida a derivación en PDF",
    tags: ["derivación", "plan", "seguimiento"],
    tone: "success" as const,
  },
];

const REFERRAL_PREVIEW = `Estimado/a colega:

Por medio de la presente, me dirijo a usted para solicitar valoración psiquiátrica del paciente Carlos M., de 28 años de edad, quien se encuentra en proceso terapéutico bajo mi cuidado desde hace 5 semanas.

Motivo de consulta: ansiedad laboral con componente de insomnio sostenido (3 episodios en las últimas 2 semanas) y patrón cognitivo de insuficiencia que no ha remitido con intervención psicológica inicial...`;

/* ─── Step definitions ─── */
type Version = "lite" | "pro";

const LITE_STEPS = [
  { id: 1, label: "Contexto", title: "La sesión acaba de terminar" },
  { id: 2, label: "Notas", title: "Escribes lo que pasó" },
  { id: 3, label: "Análisis", title: "PsyAssist analiza" },
  { id: 4, label: "Resultado", title: "Tu nota SOAP, lista" },
  { id: 5, label: "Listo", title: "Consulta cerrada" },
];

const PRO_STEPS = [
  { id: 1, label: "Contexto", title: "La sesión acaba de terminar" },
  { id: 2, label: "Grabación", title: "Grabaste la sesión" },
  { id: 3, label: "Transcripción", title: "PsyAssist transcribe" },
  { id: 4, label: "AIReport", title: "Análisis clínico profundo" },
  { id: 5, label: "Derivación", title: "Interconsulta en un clic" },
  { id: 6, label: "Listo", title: "Consulta cerrada" },
];

/* ─── Animated loading dots ─── */
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--psy-blue)]"
          style={{ animation: `wave-breathe 1.4s ease-in-out ${i * 200}ms infinite` }}
        />
      ))}
    </span>
  );
}

/* ─── Step content: Lite ─── */
function LiteStep({ step, isAnimating }: { step: number; isAnimating: boolean }) {
  const cls = `transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`;

  if (step === 1) return (
    <div className={cls}>
      <div className="mb-5 flex items-center gap-3 rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white/60 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--psy-blue-light)] text-[var(--psy-blue)] font-bold text-lg">
          {PATIENT.name[0]}
        </div>
        <div>
          <p className="font-medium text-[var(--psy-ink)]">{PATIENT.name} · {PATIENT.age} años</p>
          <p className="text-xs text-[var(--psy-muted)]">{PATIENT.issue} · Sesión {PATIENT.sessions} · {PATIENT.approach}</p>
        </div>
        <div className="ml-auto rounded-full bg-[var(--psy-green-light)] px-2.5 py-1 text-[11px] font-medium text-[var(--psy-green)]">
          Activo
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-[rgba(192,122,24,0.16)] bg-[var(--psy-amber-light)] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--psy-amber)]">Situación actual (sin PsyAssist)</p>
        <p className="mt-3 text-sm leading-7 text-[var(--psy-ink)]">
          Son las <strong>7:04 pm</strong>. Carlos acaba de salir. Tienes 2 pacientes más antes de las 9. El cuaderno está abierto con 3 líneas sueltas y ya no recuerdas bien el orden de lo que pasó.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--psy-amber)]">
          <span className="h-2 w-2 rounded-full bg-[var(--psy-amber)]" />
          Tiempo estimado para completar la nota: <strong className="ml-1">40-50 min</strong>
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className={cls}>
      <p className="mb-3 text-sm text-[var(--psy-muted)]">Escribes en texto libre, sin estructura ni formato especial:</p>
      <div className="rounded-[1.5rem] border border-[rgba(13,34,50,0.10)] bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[rgba(13,34,50,0.07)] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--psy-red)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--psy-amber)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--psy-green)]" />
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--psy-muted)]">Nueva nota · Carlos M. · Sesión 5</span>
          </div>
          <ThinkingBadge label="Escritura en curso" />
        </div>
        <TypewrittenBlock
          resetKey={`lite-notes-${step}`}
          text={RAW_NOTES}
          className="whitespace-pre-line text-sm leading-7 text-[var(--psy-ink)]"
          charDelayMs={12}
          startDelayMs={180}
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[var(--psy-muted)]">238 palabras · texto libre</p>
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--psy-blue)] px-3 py-1.5 text-xs font-medium text-white">
            <IconSpark /> Analizar con PsyAssist
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className={cls}>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--psy-blue-light)] text-[var(--psy-blue)]">
          <IconBrain />
        </div>
        <p className="text-base font-medium text-[var(--psy-ink)]">Analizando notas <LoadingDots /></p>
        <div className="mt-5">
          <ThinkingBadge label="IA organizando la nota" />
        </div>
        <div className="mt-6 w-full max-w-sm space-y-3 text-left">
          {[
            { label: "Leyendo notas de sesión", done: true },
            { label: "Buscando en tu biblioteca clínica", done: true },
            { label: "Young et al. (2003) — esquemas cognitivos", done: true },
            { label: "Generando nota SOAP", done: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-xs text-[var(--psy-muted)]">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.done ? "bg-[var(--psy-green-light)] text-[var(--psy-green)]" : "bg-[var(--psy-blue-light)] text-[var(--psy-blue)]"}`}>
                {item.done ? <IconCheck /> : <LoadingDots />}
              </span>
              {item.label}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[1rem] border border-[rgba(21,134,160,0.16)] bg-[var(--psy-blue-light)] px-4 py-3 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-blue)]">
            Informe en preparación
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--psy-ink)]">
            La IA está ordenando subjetivo, análisis clínico y plan de sesión para entregarte una nota usable, no un bloque de texto suelto.
          </p>
        </div>
        <p className="mt-5 text-xs text-[var(--psy-muted)]">Esto tarda menos de 30 segundos</p>
      </div>
    </div>
  );

  if (step === 4) return (
    <div className={`${cls} space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--psy-muted)]">Nota SOAP generada automáticamente</p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--psy-green)]">
          <IconCheck /> Lista en 26 seg.
        </div>
      </div>
      <ClinicalReportPlayback
        compact
        resetKey={`lite-${step}`}
        title="Nota SOAP en construcción"
        subtitle=""
        processingLabel="IA organizando la nota"
        completeLabel="Nota SOAP lista"
        showSubtitle={false}
        initialDelayMs={800}
        charDelayMs={24}
        fieldPauseMs={1100}
        charsPerTick={1}
        fields={LITE_REPORT_FIELDS}
      />
      <div className="rounded-[1rem] border border-[rgba(13,34,50,0.07)] bg-white/70 px-4 py-3">
        <p className="text-xs leading-5 text-[var(--psy-muted)]">
          Cita utilizada: <span className="font-medium text-[var(--psy-ink)]">{CITATION.author}, {CITATION.page}</span> — {CITATION.text}
        </p>
      </div>
    </div>
  );

  if (step === 5) return (
    <div className={cls}>
      <div className="mb-5 rounded-[1.5rem] border border-[rgba(39,137,94,0.20)] bg-[var(--psy-green-light)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--psy-green)] text-white">
          <IconCheck />
        </div>
        <p className="font-semibold text-[var(--psy-ink)]">Sesión cerrada — 7:04 pm</p>
        <p className="mt-1 text-sm text-[var(--psy-muted)]">Nota guardada, paciente actualizado, próxima sesión definida</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { label: "Tiempo total", value: "26 seg.", sub: "vs. 45 min antes" },
          { label: "Riesgo", value: "Bajo", sub: "evaluado automáticamente" },
          { label: "Próxima sesión", value: "Definida", sub: "registro pensamientos" },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.25rem] border border-[rgba(13,34,50,0.07)] bg-white/65 p-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">{item.label}</p>
            <p className="mt-1.5 text-base font-semibold text-[var(--psy-ink)]">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-[var(--psy-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

/* ─── Step content: Pro ─── */
function ProStep({ step, isAnimating }: { step: number; isAnimating: boolean }) {
  const cls = `transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`;

  if (step === 1) return (
    <div className={cls}>
      <div className="mb-5 flex items-center gap-3 rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white/60 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--psy-blue-light)] text-[var(--psy-blue)] font-bold text-lg">
          {PATIENT.name[0]}
        </div>
        <div>
          <p className="font-medium text-[var(--psy-ink)]">{PATIENT.name} · {PATIENT.age} años</p>
          <p className="text-xs text-[var(--psy-muted)]">{PATIENT.issue} · Sesión {PATIENT.sessions} · {PATIENT.approach}</p>
        </div>
        <div className="ml-auto rounded-full bg-[var(--psy-green-light)] px-2.5 py-1 text-[11px] font-medium text-[var(--psy-green)]">
          Activo
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-[rgba(21,134,160,0.15)] bg-[var(--psy-blue-light)] p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--psy-blue)]">Con PsyAssist Pro</p>
          <ThinkingBadge label="Grabación completada" />
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--psy-ink)]">
          Grababas la sesión en segundo plano. Carlos ni lo notó. Al salir, el audio ya está subido y cifrándose. No tienes que escribir nada si no quieres.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--psy-blue)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--psy-red)]" />
          Grabación activa durante toda la sesión · Audio cifrado AES-256
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {["Sesión guardada", "Paciente vinculado", "Audio protegido"].map((item) => (
            <div
              key={item}
              className="rounded-[0.95rem] border border-white/65 bg-white/45 px-3 py-2 text-xs text-[var(--psy-ink)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className={cls}>
      <p className="mb-3 text-sm text-[var(--psy-muted)]">Audio de 52 minutos capturado y cifrado:</p>
      <div className="rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white/65 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--psy-red-light)] text-[var(--psy-red)]">
              <IconMic />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--psy-ink)]">Carlos M. — Sesión 5</p>
              <p className="text-xs text-[var(--psy-muted)]">52:17 · Hoy 7:04 pm</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--psy-green)]">
            <IconShield /> Cifrado
          </div>
        </div>
        <div className="flex items-end gap-1">
          {[14, 28, 20, 38, 26, 44, 18, 32, 24, 40, 16, 30, 22, 36, 14, 28, 42, 20, 34, 18].map((h, i) => (
            <span key={i} className="wave-bar flex-1 rounded-full bg-[linear-gradient(180deg,var(--psy-blue),var(--psy-green-light))] opacity-70" style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[var(--psy-muted)]">Audio protegido · Solo tú tienes acceso</p>
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--psy-blue)] px-3 py-1.5 text-xs font-medium text-white">
            <IconSpark /> Transcribir y analizar
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-[rgba(21,134,160,0.12)] bg-[var(--psy-blue-light)] px-4 py-3">
          <span className="text-xs text-[var(--psy-blue)]">Preparando Whisper + análisis clínico</span>
          <ThinkingBadge label="Procesando" />
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className={cls}>
      <p className="mb-3 text-sm text-[var(--psy-muted)]">Whisper transcribe el audio en español clínico:</p>
      <div className="rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white/65 p-5 space-y-2.5 max-h-72 overflow-y-auto">
        {TRANSCRIPT_LINES.map((line, i) => (
          <div key={i} className={`flex gap-2.5 text-sm leading-6 ${i % 2 === 0 ? "text-[var(--psy-ink)]" : "text-[var(--psy-muted)] pl-4"}`}>
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-[var(--psy-muted)]">{String(i + 1).padStart(2, "0")}</span>
            <span>{line}</span>
          </div>
        ))}
        <div className="flex gap-2.5 text-sm text-[var(--psy-muted)]">
          <span className="font-mono text-[10px] mt-0.5">08</span>
          <span className="flex items-center gap-1">Transcribiendo <LoadingDots /></span>
        </div>
      </div>
      <div className="mt-3 rounded-[1rem] border border-[rgba(21,134,160,0.16)] bg-[var(--psy-blue-light)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-blue)]">Análisis en cola</p>
            <p className="mt-2 text-xs leading-5 text-[var(--psy-ink)]">
              En cuanto termina la transcripción, el sistema empieza a llenar subjetivo, análisis clínico y próxima sesión en el mismo expediente.
            </p>
          </div>
          <ThinkingBadge label="Pensando" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-[var(--psy-muted)]">Precisión &gt; 92% en español clínico · 126 libros indexados disponibles</p>
    </div>
  );

  if (step === 4) return (
    <div className={`${cls} space-y-3`}>
      <ClinicalReportPlayback
        compact
        resetKey={`pro-${step}`}
        title="AIReport en construcción"
        subtitle=""
        processingLabel="IA pensando con biblioteca clínica"
        completeLabel="AIReport listo"
        showSubtitle={false}
        initialDelayMs={850}
        charDelayMs={24}
        fieldPauseMs={1180}
        charsPerTick={1}
        fields={PRO_REPORT_FIELDS}
      />
      <div className="rounded-[1.25rem] border border-[rgba(21,134,160,0.18)] bg-[var(--psy-blue-light)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--psy-blue)]">Patrones identificados</p>
          <ThinkingBadge label="Modelo razonando" />
        </div>
        <div className="mt-2.5 space-y-2">
          {AI_REPORT.patterns.map((p) => (
            <div key={p} className="flex items-start gap-2 text-sm leading-6 text-[var(--psy-ink)]">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--psy-blue)]" />
              {p}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.25rem] border border-[rgba(13,34,50,0.07)] bg-white/65 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">CIE-11 (hipótesis)</p>
          <p className="mt-1.5 text-xs font-medium text-[var(--psy-ink)] leading-5">{AI_REPORT.cie11}</p>
        </div>
        <div className="rounded-[1.25rem] border border-[rgba(39,137,94,0.16)] bg-[var(--psy-green-light)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-green)]">Evolución</p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--psy-ink)]">{AI_REPORT.evolution}</p>
        </div>
      </div>
      <div className="rounded-[1.25rem] border border-[rgba(13,34,50,0.07)] bg-white/65 p-3 text-[11px] text-[var(--psy-muted)]">
        ⚠️ Este análisis es una herramienta de apoyo. El diagnóstico y decisiones clínicas son responsabilidad exclusiva del profesional.
      </div>
    </div>
  );

  if (step === 5) return (
    <div className={cls}>
      <p className="mb-3 text-sm text-[var(--psy-muted)]">Informe de interconsulta generado con un clic:</p>
      <div className="rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white/65 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--psy-ink)]">
            <IconFile />
            <span className="text-sm font-medium">Derivación a Psiquiatría</span>
          </div>
          <ThinkingBadge label="Borrador IA" tone="amber" />
        </div>
        <div className="rounded-[1rem] border border-[rgba(13,34,50,0.06)] bg-[var(--psy-cream)] p-4">
          <TypewrittenBlock
            resetKey={`referral-${step}`}
            text={REFERRAL_PREVIEW}
            className="whitespace-pre-line text-xs leading-6 text-[var(--psy-ink)]"
            charDelayMs={10}
            startDelayMs={260}
          />
          <p className="mt-2 text-xs text-[var(--psy-muted)]">... continúa por 400 palabras más</p>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-xl border border-[rgba(13,34,50,0.08)] bg-white/70 px-4 py-2.5 text-center text-xs font-medium text-[var(--psy-ink)]">Editar</div>
          <div className="flex-1 rounded-xl bg-[var(--psy-blue)] px-4 py-2.5 text-center text-xs font-medium text-white">Aprobar y enviar PDF</div>
        </div>
      </div>
    </div>
  );

  if (step === 6) return (
    <div className={cls}>
      <div className="mb-5 rounded-[1.5rem] border border-[rgba(39,137,94,0.20)] bg-[var(--psy-green-light)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--psy-green)] text-white">
          <IconCheck />
        </div>
        <p className="font-semibold text-[var(--psy-ink)]">Consulta cerrada — 7:06 pm</p>
        <p className="mt-1 text-sm text-[var(--psy-muted)]">Nota SOAP, AIReport, derivación y paciente actualizado</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { label: "Tiempo total", value: "2 min", sub: "vs. 60 min antes" },
          { label: "Documentos", value: "3", sub: "SOAP + AIReport + Derivación" },
          { label: "Riesgo evaluado", value: "Bajo", sub: "sin intervención urgente" },
          { label: "CIE-11", value: "QE84", sub: "hipótesis documentada" },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.25rem] border border-[rgba(13,34,50,0.07)] bg-white/65 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">{item.label}</p>
            <p className="mt-1.5 text-base font-semibold text-[var(--psy-ink)]">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-[var(--psy-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

/* ─── Main page ─── */
export default function DemoPage() {
  const [version, setVersion] = useState<Version>("lite");
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = version === "lite" ? LITE_STEPS : PRO_STEPS;
  const totalSteps = steps.length;
  const isLast = step === totalSteps;

  useEffect(() => {
    setStep(1);
  }, [version]);

  function goTo(next: number) {
    if (next < 1 || next > totalSteps) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStep(next);
      setIsAnimating(false);
    }, 200);
  }

  return (
    <main className="min-h-screen bg-[var(--psy-cream)]">
      {/* Nav */}
      <header className="fixed left-1/2 top-4 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
        <nav className="flex items-center justify-between rounded-[1.6rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(243,251,253,0.90)] px-4 py-3 shadow-[0_14px_40px_rgba(13,34,50,0.08)] backdrop-blur-md md:px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--psy-blue)] text-white shadow-[0_6px_16px_rgba(21,134,160,0.28)]">
              <IconBrain />
            </div>
            <span className="font-semibold text-[var(--psy-ink)] tracking-tight">PsyAssist</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden px-4 py-2 text-sm text-[var(--psy-muted)] hover:text-[var(--psy-ink)] sm:inline-flex">
              Volver al inicio
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--psy-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-[rgba(13,34,50,0.88)]">
              Probar gratis <IconArrow />
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 md:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(13,34,50,0.08)] bg-white/60 px-4 py-2 text-xs text-[var(--psy-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--psy-green)] animate-pulse" />
            Demostración interactiva con datos de ejemplo
          </div>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-[var(--psy-ink)] md:text-5xl">
            Así funciona una sesión real
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--psy-muted)]">
            Elige la versión que más se parece a tu práctica y ve paso a paso qué pasa desde que el paciente entra hasta que la consulta queda cerrada.
          </p>
        </div>

        {/* Version tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-[rgba(13,34,50,0.08)] bg-white/60 p-1">
            {(["lite", "pro"] as Version[]).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
                  version === v
                    ? "bg-[var(--psy-ink)] text-white shadow-sm"
                    : "text-[var(--psy-muted)] hover:text-[var(--psy-ink)]"
                }`}
              >
                {v === "lite" ? "Lite — $19/mes" : "Pro — $49/mes"}
              </button>
            ))}
          </div>
        </div>

        {/* Version pill context */}
        <div className="mb-6 mx-auto max-w-2xl rounded-[1.5rem] border border-[rgba(13,34,50,0.07)] bg-white/55 p-4">
          {version === "lite" ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
              <span className="shrink-0 rounded-xl bg-[var(--psy-blue-light)] px-3 py-1 text-xs font-medium text-[var(--psy-blue)]">Lite</span>
              <span className="text-[var(--psy-muted)]">Psicólogo clínico en consulta privada · Escribe notas en texto libre · Obtiene nota SOAP con cita bibliográfica en &lt;30 segundos</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
              <span className="shrink-0 rounded-xl bg-[var(--psy-blue)] px-3 py-1 text-xs font-medium text-white">Pro</span>
              <span className="text-[var(--psy-muted)]">Psicólogo clínico avanzado o psiquiatra · Graba sesión · Obtiene AIReport, CIE-11 e informe de derivación en &lt;2 minutos</span>
            </div>
          )}
        </div>

        {/* Main demo card */}
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[2rem] border border-[rgba(13,34,50,0.10)] bg-[rgba(243,251,253,0.95)] shadow-[0_24px_70px_rgba(13,34,50,0.10)]">
            {/* Step indicator */}
            <div className="border-b border-[rgba(13,34,50,0.07)] px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--psy-muted)]">
                  Paso {step} de {totalSteps}
                </p>
                <p className="text-xs font-medium text-[var(--psy-muted)]">
                  {steps[step - 1]?.title}
                </p>
              </div>
              <div className="flex gap-1.5">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(s.id)}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s.id < step
                        ? "bg-[var(--psy-green)]"
                        : s.id === step
                        ? "bg-[var(--psy-blue)]"
                        : "bg-[rgba(13,34,50,0.10)]"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-0.5">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(s.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition ${
                      s.id === step
                        ? "bg-[var(--psy-blue-light)] text-[var(--psy-blue)]"
                        : "text-[var(--psy-muted)] hover:text-[var(--psy-ink)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              {version === "lite" ? (
                <LiteStep step={step} isAnimating={isAnimating} />
              ) : (
                <ProStep step={step} isAnimating={isAnimating} />
              )}
            </div>

            {/* Navigation */}
            <div className="border-t border-[rgba(13,34,50,0.07)] px-6 py-4 flex items-center justify-between gap-3">
              <button
                onClick={() => goTo(step - 1)}
                disabled={step === 1}
                className="rounded-xl border border-[rgba(13,34,50,0.10)] px-4 py-2.5 text-sm text-[var(--psy-muted)] transition hover:text-[var(--psy-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              {!isLast ? (
                <button
                  onClick={() => goTo(step + 1)}
                  className="flex items-center gap-2 rounded-xl bg-[var(--psy-blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[rgba(21,134,160,0.88)]"
                >
                  Siguiente paso <IconArrow />
                </button>
              ) : (
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-[var(--psy-ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[rgba(13,34,50,0.88)]"
                >
                  Empezar prueba de 14 días <IconArrow />
                </Link>
              )}
            </div>
          </div>

          {/* Bottom nudge */}
          <p className="mt-6 text-center text-sm text-[var(--psy-muted)]">
            Demo con datos ficticios · Sin tarjeta ·{" "}
            <Link href="/register" className="font-medium text-[var(--psy-blue)] hover:underline">
              Crea tu cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
