import Link from "next/link";
import { ClinicalReportPlayback } from "@/components/marketing/ClinicalReportPlayback";
import { ScrollRevealInit } from "@/components/marketing/ScrollRevealInit";

function IconBrain() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69 3 3 0 0 1 .38-5.74 2.5 2.5 0 0 1 3.12-3.61" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69 3 3 0 0 0-.38-5.74 2.5 2.5 0 0 0-3.12-3.61" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3z" />
      <path d="m19 15 1 2.4 2.5.8-2.5.8L19 21l-1-2-2.5-.8 2.5-.8 1-2.4z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SectionFade({ from, to }: { from: string; to: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-12 w-full md:h-16"
      style={{
        background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
      }}
    />
  );
}

const quickFacts = [
  { value: "14 días", label: "de prueba real, sin tarjeta" },
  { value: "5 min", label: "para dejar lista la cuenta" },
  { value: "< 2 min", label: "para tener reporte post-sesión" },
  { value: "Privacidad", label: "clínica con estándar regulatorio LATAM y GDPR" },
];

const clarityPoints = [
  "Analiza sesiones con tu biblioteca clínica",
  "Te ayuda a cerrar mejor el día",
  "No reemplaza tu criterio profesional",
];

const demoTranscript = [
  "Paciente reporta cansancio sostenido y culpa al descansar.",
  "Aparece autoexigencia alta y miedo a perder control.",
  "Sugiere trabajar regulación y relación con el rendimiento.",
];

const demoResponse = [
  "Patrón central: regulación basada en rendimiento.",
  "Hipótesis clínica: descanso vivido como amenaza de pérdida de valor.",
  "Fuente útil: Beck, p. 112, activación ansiosa y autoevaluación rígida.",
];

const heroReportFields = [
  {
    id: "subjective",
    label: "Subjetivo",
    content:
      "Reporta cansancio sostenido, culpa al descansar y dificultad para desconectarse del trabajo al final del día.",
    tone: "neutral" as const,
  },
  {
    id: "analysis",
    label: "Análisis clínico",
    content:
      "La IA detecta autoexigencia como regulador de valor personal y recupera una cita clínica útil para sostener la hipótesis exploratoria.",
    tone: "info" as const,
  },
  {
    id: "next-session",
    label: "Próxima sesión",
    content:
      "Queda listo un siguiente paso claro: explorar descanso como pérdida de valor y registrar pensamientos automáticos.",
    tone: "success" as const,
  },
];

const painPoints = [
  {
    title: "Las notas se quedan para la noche",
    copy:
      "Tu jornada termina tarde porque la sesión no termina cuando el paciente sale. Termina cuando logras reconstruirla.",
  },
  {
    title: "Tu criterio clínico llega sin apoyo a tiempo",
    copy:
      "Los autores que usas sí existen en tu práctica, pero no están a la mano justo cuando necesitas ordenar lo ocurrido.",
  },
  {
    title: "Agenda, cuaderno y WhatsApp ya piden relevo",
    copy:
      "Ese sistema aguanta al principio. Cuando crecen los pacientes, empieza a cobrarte en orden, energía y percepción profesional.",
  },
];

const deliverables = [
  {
    icon: <IconMic />,
    title: "Sesión capturada",
    kicker: "Registro base",
    copy: "Grabas o subes audio y el caso queda listo para trabajarse sin reconstruir la sesión desde memoria parcial.",
    technical: "Audio cifrado · timeline clínico · paciente vinculado",
    metric: "Inicio del cierre inmediato",
    iconBg: "bg-[var(--psy-blue-light)]",
    iconColor: "text-[var(--psy-blue)]",
  },
  {
    icon: <IconBook />,
    title: "Soporte bibliográfico",
    kicker: "Rigor clínico",
    copy: "El análisis trae citas de los libros que usas, con autor y página, dentro del mismo flujo de trabajo.",
    technical: "Autor y página · búsqueda contextual · biblioteca activa",
    metric: "Cita útil dentro del reporte",
    iconBg: "bg-[var(--psy-amber-light)]",
    iconColor: "text-[var(--psy-amber)]",
  },
  {
    icon: <IconSpark />,
    title: "Decisión clínica",
    kicker: "Acción siguiente",
    copy: "Resumen, patrón central, hipótesis exploratoria y próximo paso quedan en una estructura que sí sirve para actuar.",
    technical: "Hipótesis · riesgo · próxima sesión",
    metric: "Próximo paso definido",
    iconBg: "bg-[var(--psy-green-light)]",
    iconColor: "text-[var(--psy-green)]",
  },
  {
    icon: <IconLock />,
    title: "Privacidad clínica",
    kicker: "Confianza institucional",
    copy: "Audio cifrado, trazabilidad y una estructura pensada para trabajar con información sensible de forma seria.",
    technical: "Cifrado AES-256 · acceso controlado · trazabilidad",
    metric: "Seguridad visible para el profesional",
    iconBg: "bg-[rgba(13,34,50,0.08)]",
    iconColor: "text-[rgba(13,34,50,0.88)]",
  },
];

const trialSteps = [
  {
    day: "Dia 1",
    title: "Cargas tu primer caso real",
    copy:
      "La prueba sirve porque no es un sandbox vacío. Entras con material verdadero y ves rápido si encaja.",
  },
  {
    day: "Dia 3",
    title: "Comparas cómo cierras una sesión",
    copy:
      "Ahí aparece la diferencia entre seguir escribiendo tarde y salir con una base mucho más armada.",
  },
  {
    day: "Dia 7",
    title: "Se nota el orden",
    copy:
      "Tu consulta empieza a sentirse más moderna para ti y más consistente para el paciente.",
  },
  {
    day: "Día 14",
    title: "Decides con criterio propio",
    copy:
      "No compras por una promesa bonita. Compras porque ya viste si el cambio te quitó carga real.",
  },
];

const plans = [
  {
    name: "Lite",
    price: "$19",
    description:
      "Para psicólogos en consulta privada que quieren ordenar su práctica sin perder tiempo.",
    features: [
      "Notas SOAP/DAP generadas con IA",
      "Hasta 3 enfoques clínicos activos",
      "Biblioteca base de 126 libros",
      "Prueba de 14 días gratis",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    description:
      "Para psicólogos clínicos y psiquiatras que necesitan documentación avanzada.",
    features: [
      "Todo lo incluido en Lite",
      "Grabación y transcripción de sesiones",
      "AIReport profundo con CIE-11",
      "Informes de derivación en PDF",
    ],
    highlight: true,
  },
  {
    name: "Clinic",
    price: "$149",
    description:
      "Para consultorios y equipos que necesitan coordinación y operación compartida.",
    features: [
      "Hasta 5 profesionales",
      "Panel administrativo central",
      "Facturación unificada",
      "Onboarding dedicado",
    ],
    highlight: false,
  },
];

const faqs = [
  {
    question: "¿Esto reemplaza mi criterio clínico?",
    answer:
      "No. Esa parte no se negocia. PsyAssist organiza, recupera contexto y te ayuda a cerrar mejor la sesión. La decisión sigue siendo tuya.",
  },
  {
    question: "¿La prueba de 14 días pide tarjeta?",
    answer:
      "No. La idea es validar uso real sin meter una barrera tonta al principio.",
  },
  {
    question: "¿Puedo trabajar con mis propios libros?",
    answer:
      "Sí. Ese es uno de los puntos fuertes. La plataforma no te obliga a pensar como otro profesional.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[var(--psy-ink)]">
      <ScrollRevealInit />

      <header className="fixed left-1/2 top-4 z-50 w-full max-w-6xl -translate-x-1/2 px-4">
        <nav className="flex items-center justify-between rounded-[1.6rem] border border-[rgba(13,34,50,0.08)] bg-white/90 px-4 py-3 shadow-[0_8px_32px_rgba(13,34,50,0.08)] backdrop-blur-md md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--psy-blue)] text-white shadow-[0_10px_24px_rgba(59,111,160,0.28)]">
              <IconBrain />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold tracking-tight">
                PsyAssist
              </p>
              <p className="hidden text-xs text-[var(--psy-muted)] sm:block">
                Consulta clínica más moderna, sin perder criterio
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-[rgba(13,34,50,0.07)] bg-white/45 p-1 md:flex">
            <Link
              href="/demo"
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--psy-blue)] transition hover:bg-white hover:text-[var(--psy-ink)]"
            >
              Demostración
            </Link>
            <a
              href="#problema"
              className="rounded-full px-4 py-2 text-sm text-[var(--psy-muted)] transition hover:bg-white hover:text-[var(--psy-ink)]"
            >
              Problema
            </a>
            <a
              href="#flujo"
              className="rounded-full px-4 py-2 text-sm text-[var(--psy-muted)] transition hover:bg-white hover:text-[var(--psy-ink)]"
            >
              Cómo funciona
            </a>
            <a
              href="#planes"
              className="rounded-full px-4 py-2 text-sm text-[var(--psy-muted)] transition hover:bg-white hover:text-[var(--psy-ink)]"
            >
              Precios
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm text-[var(--psy-muted)] transition hover:text-[var(--psy-ink)] sm:inline-flex"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="lift-button inline-flex items-center gap-2 rounded-full bg-[var(--psy-ink)] px-4 py-2.5 text-sm font-medium text-[var(--psy-paper)] transition hover:bg-[rgba(13,34,50,0.88)] md:px-5"
            >
              Prueba 14 días
              <IconArrow />
            </Link>
          </div>
        </nav>
      </header>

      <section className="bg-[#C8E6F2] px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32 lg:pb-20 lg:pt-36">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1fr] md:items-center lg:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal-rise">
            <h1 className="font-sans text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--psy-ink)] sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]">
              Tu consulta puede verse mucho más moderna sin perder tu criterio
              clínico.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[rgba(13,34,50,0.76)] md:text-lg">
              PsyAssist analiza sesiones con tu biblioteca clínica, ordena el
              cierre del día y reduce la dependencia de libreta, notas sueltas y
              memoria tardía.
            </p>

            <div className="mt-6 grid max-w-xl gap-2.5">
              {clarityPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-[1.1rem] border border-[rgba(13,34,50,0.08)] bg-white/55 px-4 py-3 text-sm text-[rgba(13,34,50,0.76)]"
                >
                  <span className="mt-0.5 text-[var(--psy-green)]">
                    <IconCheck />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-[1.35rem] bg-[var(--psy-blue)] px-6 py-4 text-sm font-medium text-white shadow-[0_18px_40px_rgba(59,111,160,0.28)] transition hover:-translate-y-0.5 hover:bg-[rgba(59,111,160,0.92)]"
              >
                Activar prueba de 14 días
                <IconArrow />
              </Link>
              <Link
                href="/demo"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-[1.35rem] border border-[rgba(13,34,50,0.10)] bg-[rgba(243,251,253,0.88)] px-6 py-4 text-sm font-medium text-[var(--psy-ink)] transition hover:bg-white"
              >
                <IconSpark />
                Ver demostración en vivo
              </Link>
            </div>

            {/* Tarjeta visible solo en mobile */}
            <div className="mt-8 block md:hidden">
              <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(13,34,50,0.10)] bg-[rgba(247,252,253,0.97)] p-4 shadow-[0_16px_48px_rgba(13,34,50,0.14)]">
                <div className="flex items-center justify-between border-b border-[rgba(13,34,50,0.07)] pb-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">PsyAssist clinical workspace</p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-[var(--psy-ink)]">Ana R. · Sesión 8 · TCC</p>
                  </div>
                  <div className="rounded-full border border-[rgba(13,34,50,0.08)] bg-white/80 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--psy-blue)]">Respuesta IA</div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Subjetivo", text: "Reporta cansancio sostenido y culpa al descansar.", tone: "bg-white border-[rgba(13,34,50,0.07)]" },
                    { label: "Análisis clínico", text: "Autoexigencia como regulador de valor personal — cita clínica recuperada.", tone: "bg-[var(--psy-blue-light)] border-[rgba(21,134,160,0.18)]" },
                    { label: "Próxima sesión", text: "Explorar descanso como pérdida de valor.", tone: "bg-[var(--psy-green-light)] border-[rgba(39,137,94,0.18)]" },
                  ].map((f) => (
                    <div key={f.label} className={`rounded-[1rem] border ${f.tone} px-3 py-2.5`}>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--psy-muted)]">{f.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--psy-ink)]">{f.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[var(--psy-muted)]">
                  <span className="rounded-full bg-[var(--psy-amber-light)] px-2 py-0.5 font-medium text-[var(--psy-ink)]">Antes: 45 min</span>
                  <span className="rounded-full bg-[var(--psy-blue-light)] px-2 py-0.5 font-medium text-[var(--psy-ink)]">Ahora: 28 seg.</span>
                  <span className="text-[var(--psy-green)]">Listo para cerrar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-rise reveal-delay-1 relative hidden md:block">
            <div className="absolute -left-6 top-10 h-36 w-36 rounded-full bg-[rgba(21,134,160,0.14)] blur-3xl" />
            <div className="absolute -bottom-6 right-8 h-28 w-28 rounded-full bg-[rgba(39,137,94,0.13)] blur-3xl" />

            <div className="card-hero-glow relative overflow-hidden rounded-[2rem] border border-[rgba(13,34,50,0.10)] bg-[rgba(247,252,253,0.97)] p-4 shadow-[0_28px_80px_rgba(13,34,50,0.16)] md:p-5">
              <div className="flex items-center justify-between border-b border-[rgba(13,34,50,0.07)] pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--psy-muted)]">
                    PsyAssist clinical workspace
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-[var(--psy-ink)]">
                    Ana R. · Sesión 8 · TCC
                  </h2>
                </div>
                <div className="rounded-full border border-[rgba(13,34,50,0.08)] bg-white/76 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--psy-blue)]">
                  Respuesta IA
                </div>
              </div>

              <div className="mt-4">
                <ClinicalReportPlayback
                  compact
                  resetKey="hero-report"
                  title="Reporte post-sesión"
                  subtitle=""
                  showSubtitle={false}
                  showHeaderStatus={false}
                  showFieldStatus={false}
                  initialDelayMs={900}
                  charDelayMs={34}
                  fieldPauseMs={1300}
                  charsPerTick={1}
                  fields={heroReportFields}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-[1.1rem] border border-[rgba(13,34,50,0.07)] bg-white/74 px-3 py-3 text-[11px] text-[var(--psy-muted)]">
                <span className="rounded-full bg-[var(--psy-amber-light)] px-2.5 py-1 font-medium text-[var(--psy-ink)]">
                  Antes: 45 min
                </span>
                <span className="rounded-full bg-[var(--psy-blue-light)] px-2.5 py-1 font-medium text-[var(--psy-ink)]">
                  Ahora: 28 seg.
                </span>
                <span>126 referencias activas</span>
                <span className="text-[var(--psy-green)]">Listo para cerrar consulta</span>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal-rise reveal-delay-2 mx-auto mt-10 grid max-w-6xl gap-2 rounded-[1.75rem] border border-[rgba(13,34,50,0.10)] bg-white px-4 py-3 shadow-[0_14px_40px_rgba(13,34,50,0.08)] sm:grid-cols-2 md:grid-cols-4 md:px-5 md:py-4">
          {quickFacts.map((item) => (
            <div
              key={item.value}
              className="flex items-center gap-3 rounded-[1.1rem] px-3 py-2.5 text-center md:text-left"
            >
              <p className="font-serif text-2xl font-semibold tracking-tight shrink-0">
                {item.value}
              </p>
              <p className="text-xs leading-5 text-[var(--psy-muted)]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionFade from="#C8E6F2" to="#FFFFFF" />

      <section id="problema" className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-amber)]">
              Seguir igual tiene costo
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              El atraso no siempre se ve dramático. A veces se ve como cansancio
              acumulado.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(13,34,50,0.76)]">
              No se trata de moda tecnológica. Se trata de que tu forma de
              trabajar ya merece una estructura mejor que libreta, notas sueltas
              y memoria diferida.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.title}
                className="hover-panel-green scroll-reveal rounded-[1.75rem] border border-[rgba(39,137,94,0.16)] bg-[var(--psy-green-light)] p-7 shadow-[0_12px_32px_rgba(39,137,94,0.10)]"
                data-reveal-delay={String(index * 90)}
              >
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-muted)]">
                  0{index + 1}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="#FFFFFF" to="#FAF4E4" />

      <section
        id="flujo"
        className="bg-[#FAF4E4] px-4 py-18 md:px-6 md:py-22"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-green)]">
              Lo que recibes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Sales de una sesión con material para actuar, no con tareas
              pendientes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[rgba(13,34,50,0.76)]">
              Esa es la parte que mueve la compra. No la IA en abstracto. La
              sensación concreta de terminar consulta sin quedarte debiendo media
              hora de reconstrucción clínica.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-[rgba(13,34,50,0.08)] bg-[var(--psy-ink)] p-6 text-[var(--psy-paper)] shadow-[0_24px_60px_rgba(13,34,50,0.18)]">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(223,243,248,0.55)]">
                Qué compra realmente el clínico
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  "Una estructura que ordena el cierre clínico en tiempo real.",
                  "Soporte técnico y bibliográfico visible, no escondido.",
                  "Una plataforma que sí parece herramienta profesional delante del paciente.",
                ].map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.1rem] border border-[rgba(223,243,248,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm leading-7 text-[rgba(223,243,248,0.82)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {deliverables.map((item, index) => (
              <div
                key={item.title}
                className="card-deliverable scroll-reveal rounded-[1.6rem] border border-[rgba(13,34,50,0.08)] bg-[rgba(255,255,255,0.94)] p-5 shadow-[0_10px_24px_rgba(13,34,50,0.06)]"
                data-reveal-delay={String(index * 80)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">
                      {item.kicker}
                    </p>
                    <h3 className="mt-1.5 font-serif text-[1.55rem] font-semibold tracking-tight text-[var(--psy-ink)]">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[rgba(13,34,50,0.82)]">
                  {item.copy}
                </p>

                <div className="mt-4 rounded-[1.15rem] border border-[rgba(13,34,50,0.07)] bg-[rgba(248,252,253,0.92)] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--psy-muted)]">
                    Señal técnica
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[rgba(13,34,50,0.68)]">
                    {item.technical}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[var(--psy-muted)]">
                  <span className="rounded-full bg-[rgba(13,34,50,0.05)] px-2.5 py-1 font-medium text-[var(--psy-ink)]">
                    {item.metric}
                  </span>
                  <span>Más orden clínico</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="#FAF4E4" to="#FFFFFF" />

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-amber)]">
              La prueba importa
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Estos 14 días no son una cortesía. Son el momento para ver si tu
              práctica ya pidió este cambio.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trialSteps.map((step, index) => (
              <div
                key={step.day}
                className="hover-panel-green scroll-reveal rounded-[1.75rem] border border-[rgba(39,137,94,0.16)] bg-[var(--psy-green-light)] p-6 shadow-[0_12px_32px_rgba(39,137,94,0.10)]"
                data-reveal-delay={String(index * 80)}
              >
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-amber)]">
                  {step.day}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="#FFFFFF" to="#C8E6F2" />

      <section className="bg-[#C8E6F2] px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-amber)]">
              Para quién encaja
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              No hace falta ser fan de la tecnología. Hace falta estar cansado de
              perder tiempo.
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="card-profile scroll-reveal rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white p-6 shadow-[0_8px_24px_rgba(13,34,50,0.06)]" data-reveal-delay="0">
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Psicólogo clínico individual
              </h3>
              <p className="mt-3 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                Si llevas agenda llena y cierras el día escribiendo a
                contrarreloj, aquí ganas claridad y tiempo sin perder tu criterio.
              </p>
            </div>
            <div className="card-profile scroll-reveal rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white p-6 shadow-[0_8px_24px_rgba(13,34,50,0.06)]" data-reveal-delay="90">
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Consultorio que quiere verse más serio
              </h3>
              <p className="mt-3 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                Cuando el paciente siente orden, seguimiento y velocidad, también
                percibe una práctica más moderna y confiable.
              </p>
            </div>
            <div className="card-profile scroll-reveal rounded-[1.5rem] border border-[rgba(13,34,50,0.08)] bg-white p-6 shadow-[0_8px_24px_rgba(13,34,50,0.06)]" data-reveal-delay="180">
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Equipo que ya no quiere operar por WhatsApp
              </h3>
              <p className="mt-3 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                Si varias personas tocan la agenda, los reportes y las
                derivaciones, necesitas sistema. No más parches pegados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionFade from="#C8E6F2" to="#FAF4E4" />

      <section id="planes" className="bg-[#FAF4E4] px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-green)]">
              Precios
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Empieza con prueba real. Paga solo si ya te ordenó la práctica.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[rgba(13,34,50,0.76)]">
              La conversación ya no es si la tecnología cabe en psicología. La
              conversación es si quieres seguir administrando tu consulta como en
              2017.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.name}
                className={`scroll-reveal rounded-[2rem] p-7 ${
                  plan.highlight
                    ? "card-pricing card-pricing-pro bg-[var(--psy-ink)] text-[var(--psy-paper)] shadow-[0_26px_70px_rgba(13,34,50,0.18)]"
                    : "card-pricing border border-[rgba(13,34,50,0.08)] bg-white/95 shadow-[0_14px_34px_rgba(13,34,50,0.08)]"
                }`}
                data-reveal-delay={String(index * 100)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm ${
                        plan.highlight
                          ? "text-[rgba(223,243,248,0.66)]"
                          : "text-[var(--psy-muted)]"
                      }`}
                    >
                      {plan.name}
                    </p>
                    <p className="mt-3 font-serif text-5xl font-semibold tracking-tight">
                      {plan.price}
                      <span
                        className={`ml-1 text-base font-normal ${
                          plan.highlight
                            ? "text-[rgba(223,243,248,0.66)]"
                            : "text-[var(--psy-muted)]"
                        }`}
                      >
                        /mes
                      </span>
                    </p>
                  </div>

                  {plan.highlight ? (
                    <div className="rounded-full bg-[var(--psy-green)] px-3 py-1 text-xs font-medium text-white">
                      El que más valida
                    </div>
                  ) : null}
                </div>

                <p
                  className={`mt-5 text-sm leading-7 ${
                    plan.highlight
                      ? "text-[rgba(223,243,248,0.78)]"
                      : "text-[rgba(13,34,50,0.76)]"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 ${
                          plan.highlight
                            ? "text-[var(--psy-green-light)]"
                            : "text-[var(--psy-green)]"
                        }`}
                      >
                        <IconCheck />
                      </span>
                      <span
                        className={
                          plan.highlight
                            ? "text-[rgba(223,243,248,0.86)]"
                            : "text-[var(--psy-ink)]"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`lift-button mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-[var(--psy-paper)] text-[var(--psy-ink)] hover:bg-white"
                      : "bg-[var(--psy-ink)] text-[var(--psy-paper)] hover:bg-[rgba(13,34,50,0.88)]"
                  }`}
                >
                  Empezar prueba de 14 días
                  <IconArrow />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="#FAF4E4" to="#FFFFFF" />

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--psy-amber)]">
              Dudas normales
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Si te lo estás preguntando, seguramente otro colega también.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <article
                key={faq.question}
                className="card-faq hover-panel-green scroll-reveal rounded-[1.5rem] border border-[rgba(39,137,94,0.16)] bg-[var(--psy-green-light)] p-6 shadow-[0_10px_24px_rgba(39,137,94,0.10)]"
                data-reveal-delay={String(index * 100)}
              >
                <h3 className="font-serif text-2xl font-semibold tracking-tight">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(13,34,50,0.76)]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[var(--psy-ink)] px-6 py-12 text-[var(--psy-paper)] shadow-[0_30px_90px_rgba(13,34,50,0.22)] md:px-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(223,243,248,0.55)]">
                Decisión
              </p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight md:text-6xl">
                Si tu práctica ya pide un sistema más moderno, esta prueba te lo
                va a dejar claro rápido.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(223,243,248,0.74)]">
                No estás validando una tendencia. Estás validando si vale la pena
                seguir cerrando sesiones con el método anterior.
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/register"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--psy-paper)] px-6 py-4 text-sm font-medium text-[var(--psy-ink)] transition hover:bg-white"
              >
                Crear cuenta y empezar prueba
                <IconArrow />
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[rgba(223,243,248,0.12)] px-5 py-3 text-xs text-[rgba(223,243,248,0.68)]">
                <span className="inline-flex items-center gap-2">
                  <IconCalendar />
                  Configuración rápida
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconShield />
                  Sin tarjeta
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconClock />
                  Prueba real
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
