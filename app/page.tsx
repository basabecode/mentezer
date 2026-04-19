'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ClinicalReportPlayback } from '@/components/marketing/ClinicalReportPlayback'
import { ScrollRevealInit } from '@/components/marketing/ScrollRevealInit'

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
  )
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
  )
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
  )
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
  )
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
  )
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
  )
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
  )
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
  )
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
  )
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
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  )
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
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
  )
}

const quickFacts = [
  { value: '14 días', label: 'de prueba real, sin tarjeta' },
  { value: '5 min', label: 'para dejar lista la cuenta' },
  { value: '< 2 min', label: 'para tener reporte post-sesión' },
  {
    value: 'Privacidad',
    label: 'clínica con estándar regulatorio LATAM y GDPR',
  },
]

const clarityPoints = [
  'Analiza sesiones con tu biblioteca clínica',
  'Te ayuda a cerrar mejor el día',
  'No reemplaza tu criterio profesional',
]

const demoTranscript = [
  'Paciente reporta cansancio sostenido y culpa al descansar.',
  'Aparece autoexigencia alta y miedo a perder control.',
  'Sugiere trabajar regulación y relación con el rendimiento.',
]

const demoResponse = [
  'Patrón central: regulación basada en rendimiento.',
  'Hipótesis clínica: descanso vivido como amenaza de pérdida de valor.',
  'Fuente útil: Beck, p. 112, activación ansiosa y autoevaluación rígida.',
]

const heroReportFields = [
  {
    id: 'subjective',
    label: 'Subjetivo',
    content:
      'Reporta cansancio sostenido, culpa al descansar y dificultad para desconectarse del trabajo al final del día.',
    tone: 'neutral' as const,
  },
  {
    id: 'analysis',
    label: 'Análisis clínico',
    content:
      'La IA detecta autoexigencia como regulador de valor personal y recupera una cita clínica útil para sostener la hipótesis exploratoria.',
    tone: 'info' as const,
  },
  {
    id: 'next-session',
    label: 'Próxima sesión',
    content:
      'Queda listo un siguiente paso claro: explorar descanso como pérdida de valor y registrar pensamientos automáticos.',
    tone: 'success' as const,
  },
]

const painPoints = [
  {
    title: 'Las notas se quedan para la noche',
    copy: 'Tu jornada termina tarde porque la sesión no termina cuando el paciente sale. Termina cuando logras reconstruirla.',
  },
  {
    title: 'Tu criterio clínico llega sin apoyo a tiempo',
    copy: 'Los autores que usas sí existen en tu práctica, pero no están a la mano justo cuando necesitas ordenar lo ocurrido.',
  },
  {
    title: 'Agenda, cuaderno y WhatsApp ya piden relevo',
    copy: 'Ese sistema aguanta al principio. Cuando crecen los pacientes, empieza a cobrarte en orden, energía y percepción profesional.',
  },
]

const deliverables = [
  {
    icon: <IconMic />,
    title: 'Sesión capturada',
    kicker: 'Registro base',
    copy: 'Grabas o subes audio y el caso queda listo para trabajarse sin reconstruir la sesión desde memoria parcial.',
    technical: 'Audio cifrado · timeline clínico · paciente vinculado',
    metric: 'Inicio del cierre inmediato',
    iconBg: 'bg-psy-blue-light',
    iconColor: 'text-psy-blue',
  },
  {
    icon: <IconBook />,
    title: 'Soporte bibliográfico',
    kicker: 'Rigor clínico',
    copy: 'El análisis trae citas de los libros que usas, con autor y página, dentro del mismo flujo de trabajo.',
    technical: 'Autor y página · búsqueda contextual · biblioteca activa',
    metric: 'Cita útil dentro del reporte',
    iconBg: 'bg-psy-amber-light',
    iconColor: 'text-psy-amber',
  },
  {
    icon: <IconSpark />,
    title: 'Decisión clínica',
    kicker: 'Acción siguiente',
    copy: 'Resumen, patrón central, hipótesis exploratoria y próximo paso quedan en una estructura que sí sirve para actuar.',
    technical: 'Hipótesis · riesgo · próxima sesión',
    metric: 'Próximo paso definido',
    iconBg: 'bg-psy-green-light',
    iconColor: 'text-psy-green',
  },
  {
    icon: <IconLock />,
    title: 'Privacidad clínica',
    kicker: 'Confianza institucional',
    copy: 'Audio cifrado, trazabilidad y una estructura pensada para trabajar con información sensible de forma seria.',
    technical: 'Cifrado AES-256 · acceso controlado · trazabilidad',
    metric: 'Seguridad visible para el profesional',
    iconBg: 'bg-psy-ink/10',
    iconColor: 'text-psy-ink',
  },
]

const trialSteps = [
  {
    day: 'Dia 1',
    title: 'Cargas tu primer caso real',
    copy: 'La prueba sirve porque no es un sandbox vacío. Entras con material verdadero y ves rápido si encaja.',
  },
  {
    day: 'Dia 3',
    title: 'Comparas cómo cierras una sesión',
    copy: 'Ahí aparece la diferencia entre seguir escribiendo tarde y salir con una base mucho más armada.',
  },
  {
    day: 'Dia 7',
    title: 'Se nota el orden',
    copy: 'Tu consulta empieza a sentirse más moderna para ti y más consistente para el paciente.',
  },
  {
    day: 'Día 14',
    title: 'Decides con criterio propio',
    copy: 'No compras por una promesa bonita. Compras porque ya viste si el cambio te quitó carga real.',
  },
]

const plans = [
  {
    name: 'Lite',
    price: '$19',
    description:
      'Para psicólogos en consulta privada que quieren ordenar su práctica sin perder tiempo.',
    features: [
      'Notas SOAP/DAP generadas con IA',
      'Hasta 3 enfoques clínicos activos',
      'Biblioteca base de 126 libros',
      'Prueba de 14 días gratis',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    description:
      'Para psicólogos clínicos y psiquiatras que necesitan documentación avanzada.',
    features: [
      'Todo lo incluido en Lite',
      'Grabación y transcripción de sesiones',
      'AIReport profundo con CIE-11',
      'Informes de derivación en PDF',
    ],
    highlight: true,
  },
  {
    name: 'Clinic',
    price: '$149',
    description:
      'Para consultorios y equipos que necesitan coordinación y operación compartida.',
    features: [
      'Hasta 5 profesionales',
      'Panel administrativo central',
      'Facturación unificada',
      'Onboarding dedicado',
    ],
    highlight: false,
  },
]

const faqs = [
  {
    question: '¿Esto reemplaza mi criterio clínico?',
    answer:
      'No. Esa parte no se negocia. MENTEZER organiza, recupera contexto y te ayuda a cerrar mejor la sesión. La decisión sigue siendo tuya.',
  },
  {
    question: '¿La prueba de 14 días pide tarjeta?',
    answer:
      'No. La idea es validar uso real sin meter una barrera tonta al principio.',
  },
  {
    question: '¿Puedo trabajar con mis propios libros?',
    answer:
      'Sí. Ese es uno de los puntos fuertes. La plataforma no te obliga a pensar como otro profesional.',
  },
]

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-psy-cream text-psy-ink">
      <ScrollRevealInit />

      <header className="fixed left-1/2 top-4 z-50 w-full max-w-6xl -translate-x-1/2 px-4">
        <nav className="flex items-center justify-between rounded-3xl border border-psy-warm-border bg-psy-warm/95 px-4 py-3 shadow-xl backdrop-blur-md md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-blue text-white shadow-lg">
              <IconBrain />
            </div>
            <div>
              <p className="font-sora text-lg font-semibold tracking-tight">
                MENTEZER
              </p>
              <p className="hidden text-xs text-psy-muted sm:block">
                Consulta clínica más moderna, sin perder criterio
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-psy-ink/10 bg-white/45 p-1 md:flex">
            <Link
              href="/demo"
              className="rounded-full px-4 py-2 text-sm font-medium text-psy-blue transition hover:bg-white hover:text-psy-ink"
            >
              Demostración
            </Link>
            <a
              href="#problema"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-white hover:text-psy-ink"
            >
              Problema
            </a>
            <a
              href="#flujo"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-white hover:text-psy-ink"
            >
              Cómo funciona
            </a>
            <a
              href="#planes"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-white hover:text-psy-ink"
            >
              Precios
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-sm text-psy-muted transition hover:text-psy-ink sm:inline-flex"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="lift-button inline-flex items-center gap-2 rounded-full bg-psy-ink px-4 py-2.5 text-sm font-medium text-psy-paper transition hover:bg-psy-ink/90 md:px-5"
            >
              <span className="hidden sm:inline">Prueba 14 días</span>
              <span className="sm:hidden">Empezar</span>
              <IconArrow />
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-warm-border text-psy-ink transition hover:bg-psy-warm-border/80 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute left-4 right-4 mt-3 overflow-hidden rounded-3xl border border-psy-warm-border bg-psy-warm p-4 shadow-2xl backdrop-blur-xl animate-menu-in md:hidden">
            <div className="grid gap-2">
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/demo"
                className="flex items-center justify-between rounded-2xl border border-psy-blue/10 bg-psy-blue/5 px-4 py-3.5 text-sm font-medium text-psy-blue"
              >
                Ver Demostración
                <IconSpark />
              </Link>
              <a
                onClick={() => setIsMobileMenuOpen(false)}
                href="#problema"
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-ink/5"
              >
                Problema
              </a>
              <a
                onClick={() => setIsMobileMenuOpen(false)}
                href="#flujo"
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-ink/5"
              >
                Cómo funciona
              </a>
              <a
                onClick={() => setIsMobileMenuOpen(false)}
                href="#planes"
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-ink/5"
              >
                Precios
              </a>
              <div className="mt-2 border-t border-psy-warm-border pt-4">
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/login"
                  className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-medium text-psy-ink active:bg-psy-ink/10"
                >
                  Ingresar a mi cuenta
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="bg-psy-cream px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32 lg:pb-20 lg:pt-36">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center lg:grid-cols-2">
          <div className="reveal-rise">
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-psy-ink sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
              Tu consulta puede verse mucho más moderna sin perder tu criterio
              clínico.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-psy-ink/75 md:text-lg">
              MENTEZER analiza sesiones con tu biblioteca clínica, ordena el
              cierre del día y reduce la dependencia de libreta, notas sueltas y
              memoria tardía.
            </p>

            <div className="mt-6 grid max-w-xl gap-2.5">
              {clarityPoints.map(point => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-psy-border bg-white/55 px-4 py-3 text-sm text-psy-ink/75"
                >
                  <span className="mt-0.5 text-psy-green">
                    <IconCheck />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-3xl bg-psy-blue px-6 py-4 text-sm font-medium text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-psy-blue/90"
              >
                Activar prueba de 14 días
                <IconArrow />
              </Link>
              <Link
                href="/demo"
                className="lift-button inline-flex items-center justify-center gap-2 rounded-3xl border border-psy-border bg-psy-paper/80 px-6 py-4 text-sm font-medium text-psy-ink transition hover:bg-white"
              >
                <IconSpark />
                Ver demostración en vivo
              </Link>
            </div>

            {/* Tarjeta visible solo en mobile */}
            <div className="mt-8 block md:hidden">
              <div className="overflow-hidden rounded-3xl border border-psy-border bg-psy-paper/90 p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-psy-border/70 pb-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                      MENTEZER clinical workspace
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-psy-ink">
                      Ana R. · Sesión 8 · TCC
                    </p>
                  </div>
                  <div className="rounded-full border border-psy-border bg-white/80 px-2.5 py-1 text-xs font-medium uppercase tracking-widest text-psy-blue">
                    Respuesta IA
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    {
                      label: 'Subjetivo',
                      text: 'Reporta cansancio sostenido y culpa al descansar.',
                      tone: 'bg-white border-psy-border/70',
                    },
                    {
                      label: 'Análisis clínico',
                      text: 'Autoexigencia como regulador de valor personal — cita clínica recuperada.',
                      tone: 'bg-psy-blue-light border-psy-blue/20',
                    },
                    {
                      label: 'Próxima sesión',
                      text: 'Explorar descanso como pérdida de valor.',
                      tone: 'bg-psy-green-light border-psy-green/20',
                    },
                  ].map(f => (
                    <div
                      key={f.label}
                      className={`rounded-2xl border ${f.tone} px-3 py-2.5`}
                    >
                      <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                        {f.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-psy-ink">
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-psy-muted">
                  <span className="rounded-full bg-psy-amber-light px-2 py-0.5 font-medium text-psy-ink">
                    Antes: 45 min
                  </span>
                  <span className="rounded-full bg-psy-blue-light px-2 py-0.5 font-medium text-psy-ink">
                    Ahora: 28 seg.
                  </span>
                  <span className="text-psy-green">
                    Listo para cerrar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-rise reveal-delay-1 relative hidden md:block">
            <div className="absolute -left-6 top-10 h-36 w-36 rounded-full bg-psy-blue/15 blur-3xl" />
            <div className="absolute -bottom-6 right-8 h-28 w-28 rounded-full bg-psy-green/15 blur-3xl" />

            <div className="card-hero-glow relative overflow-hidden rounded-3xl border border-psy-warm-border bg-psy-warm/90 p-4 shadow-2xl md:p-5">
              <div className="flex items-center justify-between border-b border-psy-border/70 pb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                    MENTEZER clinical workspace
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-psy-ink">
                    Ana R. · Sesión 8 · TCC
                  </h2>
                </div>
                <div className="rounded-full border border-psy-border bg-white/76 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-psy-blue">
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

              <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-psy-border/70 bg-white/74 px-3 py-3 text-xs text-psy-muted">
                <span className="rounded-full bg-psy-amber-light px-2.5 py-1 font-medium text-psy-ink">
                  Antes: 45 min
                </span>
                <span className="rounded-full bg-psy-blue-light px-2.5 py-1 font-medium text-psy-ink">
                  Ahora: 28 seg.
                </span>
                <span>126 referencias activas</span>
                <span className="text-psy-green">
                  Listo para cerrar consulta
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal-rise reveal-delay-2 mx-auto mt-10 grid max-w-6xl gap-2 rounded-3xl border border-psy-border bg-white/95 px-4 py-1.5 shadow-xl sm:grid-cols-2 md:grid-cols-4 md:px-5">
          {quickFacts.map(item => (
            <div
              key={item.value}
              className="flex items-center gap-3 rounded-2xl px-3 py-1.5 text-center md:text-left"
            >
              <p className="font-sora text-2xl font-semibold tracking-tight shrink-0">
                {item.value}
              </p>
              <p className="text-xs leading-5 text-psy-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionFade from="var(--psy-cream)" to="white" />

      <section id="problema" className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Seguir igual tiene costo
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              El atraso no siempre se ve dramático. A veces se ve como cansancio
              acumulado.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-psy-ink/75">
              No se trata de moda tecnológica. Se trata de que tu forma de
              trabajar ya merece una estructura mejor que libreta, notas sueltas
              y memoria diferida.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.title}
                className={`hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-7 shadow-xl ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                  0{index + 1}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-psy-ink/75">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="white" to="var(--psy-purple-light)" />

      <section id="flujo" className="bg-psy-purple-light px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">
              Lo que recibes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Sales de una sesión con material para actuar, no con tareas
              pendientes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/75">
              Esa es la parte que mueve la compra. No la IA en abstracto. La
              sensación concreta de terminar consulta sin quedarte debiendo
              media hora de reconstrucción clínica.
            </p>

            <div className="mt-8 rounded-3xl border border-psy-border bg-psy-ink p-6 text-psy-paper shadow-2xl">
              <p className="font-mono text-xs uppercase tracking-widest text-psy-paper/55">
                Qué compra realmente el clínico
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  'Una estructura que ordena el cierre clínico en tiempo real.',
                  'Soporte técnico y bibliográfico visible, no escondido.',
                  'Una plataforma que sí parece herramienta profesional delante del paciente.',
                ].map(point => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-psy-paper/80"
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
                className={`card-deliverable reveal-rise rounded-3xl border border-psy-border bg-white p-5 shadow-lg ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : index === 2 ? 'reveal-delay-3' : 'reveal-delay-4'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                      {item.kicker}
                    </p>
                    <h3 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-psy-ink/80">
                  {item.copy}
                </p>

                <div className="mt-4 rounded-2xl border border-psy-border/70 bg-psy-paper/80 px-4 py-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                    Señal técnica
                  </p>
                  <p className="mt-2 text-xs leading-6 text-psy-ink/70">
                    {item.technical}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-psy-muted">
                  <span className="rounded-full bg-psy-ink/5 px-2.5 py-1 font-medium text-psy-ink">
                    {item.metric}
                  </span>
                  <span>Más orden clínico</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="var(--psy-purple-light)" to="white" />

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
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
                className={`hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-xl ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : index === 2 ? 'reveal-delay-3' : 'reveal-delay-4'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
                  {step.day}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-psy-ink/75">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="white" to="var(--psy-cream)" />

      <section className="bg-psy-cream px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Para quién encaja
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              No hace falta ser fan de la tecnología. Hace falta estar cansado
              de perder tiempo.
            </h2>
          </div>

          <div className="grid gap-4">
            <div
              className="card-profile reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-lg"
            >
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Psicólogo clínico individual
              </h3>
              <p className="mt-3 text-sm leading-7 text-psy-ink/75">
                Si llevas agenda llena y cierras el día escribiendo a
                contrarreloj, aquí ganas claridad y tiempo sin perder tu
                criterio.
              </p>
            </div>
            <div
              className="card-profile reveal-rise reveal-delay-2 rounded-3xl border border-psy-border bg-white p-6 shadow-lg"
            >
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Consultorio que quiere verse más serio
              </h3>
              <p className="mt-3 text-sm leading-7 text-psy-ink/75">
                Cuando el paciente siente orden, seguimiento y velocidad,
                también percibe una práctica más moderna y confiable.
              </p>
            </div>
            <div
              className="card-profile reveal-rise reveal-delay-3 rounded-3xl border border-psy-border bg-white p-6 shadow-lg"
            >
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                Equipo que ya no quiere operar por WhatsApp
              </h3>
              <p className="mt-3 text-sm leading-7 text-psy-ink/75">
                Si varias personas tocan la agenda, los reportes y las
                derivaciones, necesitas sistema. No más parches pegados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionFade from="var(--psy-cream)" to="var(--psy-purple-light)" />

      <section id="planes" className="bg-psy-purple-light px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">
              Precios
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Empieza con prueba real. Paga solo si ya te ordenó la práctica.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/75">
              La conversación ya no es si la tecnología cabe en psicología. La
              conversación es si quieres seguir administrando tu consulta como
              en 2017.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.name}
                className={`reveal-rise rounded-3xl p-7 ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                } ${
                  plan.highlight
                    ? 'card-pricing card-pricing-pro bg-psy-ink text-psy-paper shadow-2xl'
                    : 'card-pricing border border-psy-ink/10 bg-white shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm ${
                        plan.highlight
                          ? 'text-psy-paper/65'
                          : 'text-psy-muted'
                      }`}
                    >
                      {plan.name}
                    </p>
                    <p className="mt-3 font-serif text-5xl font-semibold tracking-tight">
                      {plan.price}
                      <span
                        className={`ml-1 text-base font-normal ${
                          plan.highlight
                            ? 'text-psy-paper/65'
                            : 'text-psy-muted'
                        }`}
                      >
                        /mes
                      </span>
                    </p>
                  </div>

                  {plan.highlight ? (
                    <div className="rounded-full bg-psy-green px-3 py-1 text-xs font-medium text-white">
                      El que más valida
                    </div>
                  ) : null}
                </div>

                <p
                  className={`mt-5 text-sm leading-7 ${
                    plan.highlight
                      ? 'text-psy-paper/80'
                      : 'text-psy-ink/75'
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map(feature => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={`mt-0.5 ${
                          plan.highlight
                            ? 'text-psy-green-light'
                            : 'text-psy-green'
                        }`}
                      >
                        <IconCheck />
                      </span>
                      <span
                        className={
                          plan.highlight
                            ? 'text-psy-paper/85'
                            : 'text-psy-ink'
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
                      ? 'bg-psy-paper text-psy-ink hover:bg-white'
                      : 'bg-psy-ink text-psy-paper hover:bg-psy-ink/90'
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

      <SectionFade from="var(--psy-purple-light)" to="white" />

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
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
                className={`card-faq hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-lg ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                }`}
              >
                <h3 className="font-serif text-2xl font-semibold tracking-tight">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-psy-ink/75">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionFade from="white" to="var(--psy-cream)" />

      <section className="bg-psy-cream px-4 pb-24 pt-10 md:px-6 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-psy-ink to-[#1a3a52] p-4 text-psy-paper shadow-2xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-widest text-psy-paper/55">
                Decisión
              </p>
              <h2 className="mt-4 font-sora text-4xl font-semibold tracking-tight md:text-5xl lg:text-7xl">
                Si tu práctica ya pide un sistema más moderno...
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-psy-paper/75">
                No estás validando una tendencia. Estás validando si vale la
                pena seguir cerrando sesiones con el método de siempre.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-sm font-bold text-psy-ink transition hover:bg-psy-paper shadow-xl shadow-white/5"
                >
                  Probar MENTEZER ahora
                  <IconArrow />
                </Link>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-psy-paper/10 bg-white/5 px-5 py-4 text-xs text-psy-paper/70">
                  <span className="inline-flex items-center gap-2">
                    <IconCalendar />
                    Configuración rápida
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <IconShield />
                    Sin tarjeta
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl rotate-3">
                <div className="absolute inset-0 bg-gradient-to-t from-psy-ink/40 to-transparent" />
                <img 
                  src="/img/mentezer-context.png" 
                  alt="MENTEZER en uso clínico" 
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
