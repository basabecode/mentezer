'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Clock3,
  Lock,
  Menu,
  Mic,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'

type Tone = 'neutral' | 'info' | 'success'

type ReportField = {
  id: string
  label: string
  content: string
  tone: Tone
}

const quickFacts = [
  { value: '14 dias', label: 'de prueba real, sin tarjeta' },
  { value: '5 min', label: 'para dejar lista la cuenta' },
  { value: '< 2 min', label: 'para tener reporte post-sesion' },
  { value: 'Privacidad', label: 'clinica con enfoque serio y trazable' },
]

const clarityPoints = [
  'Analiza sesiones con tu biblioteca clinica',
  'Te ayuda a cerrar mejor el dia',
  'No reemplaza tu criterio profesional',
]

const heroReportFields: ReportField[] = [
  {
    id: 'subjective',
    label: 'Subjetivo',
    content:
      'Reporta cansancio sostenido, culpa al descansar y dificultad para desconectarse del trabajo al final del dia.',
    tone: 'neutral',
  },
  {
    id: 'analysis',
    label: 'Analisis clinico',
    content:
      'La IA detecta autoexigencia como regulador de valor personal y recupera una cita clinica util para sostener la hipotesis exploratoria.',
    tone: 'info',
  },
  {
    id: 'next-session',
    label: 'Proxima sesion',
    content:
      'Queda listo un siguiente paso claro: explorar descanso como perdida de valor y registrar pensamientos automaticos.',
    tone: 'success',
  },
]

const painPoints = [
  {
    id: '01',
    title: 'Las notas se quedan para la noche',
    copy:
      'Tu jornada termina tarde porque la sesion no termina cuando el paciente sale. Termina cuando logras reconstruirla.',
  },
  {
    id: '02',
    title: 'Tu criterio clinico llega sin apoyo a tiempo',
    copy:
      'Los autores que usas si existen en tu practica, pero no estan a la mano justo cuando necesitas ordenar lo ocurrido.',
  },
  {
    id: '03',
    title: 'Agenda, cuaderno y WhatsApp ya piden relevo',
    copy:
      'Ese sistema aguanta al principio. Cuando crecen los pacientes, empieza a cobrarte en orden, energia y percepcion profesional.',
  },
]

const deliverables = [
  {
    title: 'Sesion capturada',
    kicker: 'Registro base',
    copy:
      'Grabas o subes audio y el caso queda listo para trabajarse sin reconstruir la sesion desde memoria parcial.',
    technical: 'Audio cifrado · timeline clinico · paciente vinculado',
    metric: 'Inicio del cierre inmediato',
    icon: Mic,
    accent: 'bg-psy-blue-light text-psy-blue',
  },
  {
    title: 'Soporte bibliografico',
    kicker: 'Rigor clinico',
    copy:
      'El analisis trae citas de los libros que usas, con autor y pagina, dentro del mismo flujo de trabajo.',
    technical: 'Autor y pagina · busqueda contextual · biblioteca activa',
    metric: 'Cita util dentro del reporte',
    icon: BookOpen,
    accent: 'bg-psy-amber-light text-psy-amber',
  },
  {
    title: 'Decision clinica',
    kicker: 'Accion siguiente',
    copy:
      'Resumen, patron central, hipotesis exploratoria y proximo paso quedan en una estructura que si sirve para actuar.',
    technical: 'Hipotesis · riesgo · proxima sesion',
    metric: 'Proximo paso definido',
    icon: Sparkles,
    accent: 'bg-psy-green-light text-psy-green',
  },
  {
    title: 'Privacidad clinica',
    kicker: 'Confianza institucional',
    copy:
      'Audio cifrado, trazabilidad y una estructura pensada para trabajar con informacion sensible de forma seria.',
    technical: 'Cifrado · acceso controlado · trazabilidad',
    metric: 'Seguridad visible para el profesional',
    icon: Lock,
    accent: 'bg-psy-ink/8 text-psy-ink',
  },
]

const trialSteps = [
  {
    day: 'Dia 1',
    title: 'Cargas tu primer caso real',
    copy:
      'La prueba sirve porque no es un sandbox vacio. Entras con material verdadero y ves rapido si encaja.',
  },
  {
    day: 'Dia 3',
    title: 'Comparas como cierras una sesion',
    copy:
      'Ahi aparece la diferencia entre seguir escribiendo tarde y salir con una base mucho mas armada.',
  },
  {
    day: 'Dia 7',
    title: 'Se nota el orden',
    copy:
      'Tu consulta empieza a sentirse mas moderna para ti y mas consistente para el paciente.',
  },
  {
    day: 'Dia 14',
    title: 'Decides con criterio propio',
    copy:
      'No compras por una promesa bonita. Compras porque ya viste si el cambio te quito carga real.',
  },
]

const personas = [
  {
    title: 'Psicologo clinico individual',
    copy:
      'Si llevas agenda llena y cierras el dia escribiendo a contrarreloj, aqui ganas claridad y tiempo sin perder tu criterio.',
  },
  {
    title: 'Consultorio que quiere verse mas serio',
    copy:
      'Cuando el paciente siente orden, seguimiento y velocidad, tambien percibe una practica mas moderna y confiable.',
  },
  {
    title: 'Equipo que ya no quiere operar por WhatsApp',
    copy:
      'Si varias personas tocan la agenda, los reportes y las derivaciones, necesitas sistema. No mas parches pegados.',
  },
]

const plans = [
  {
    name: 'Lite',
    price: '$19',
    description:
      'Para psicologos en consulta privada que quieren ordenar su practica sin perder tiempo.',
    features: [
      'Notas SOAP/DAP generadas con IA',
      'Hasta 3 enfoques clinicos activos',
      'Biblioteca base de 126 libros',
      'Prueba de 14 dias gratis',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    description:
      'Para psicologos clinicos y psiquiatras que necesitan documentacion avanzada.',
    features: [
      'Todo lo incluido en Lite',
      'Grabacion y transcripcion de sesiones',
      'AIReport profundo con CIE-11',
      'Informes de derivacion en PDF',
    ],
    highlight: true,
  },
  {
    name: 'Clinic',
    price: '$149',
    description:
      'Para consultorios y equipos que necesitan coordinacion y operacion compartida.',
    features: [
      'Hasta 5 profesionales',
      'Panel administrativo central',
      'Facturacion unificada',
      'Onboarding dedicado',
    ],
  },
]

const faqs = [
  {
    question: 'Esto reemplaza mi criterio clinico?',
    answer:
      'No. Esa parte no se negocia. MENTEZER organiza, recupera contexto y te ayuda a cerrar mejor la sesion. La decision sigue siendo tuya.',
  },
  {
    question: 'La prueba de 14 dias pide tarjeta?',
    answer:
      'No. La idea es validar uso real sin meter una barrera innecesaria al principio.',
  },
  {
    question: 'Puedo trabajar con mis propios libros?',
    answer:
      'Si. Ese es uno de los puntos fuertes. La plataforma no te obliga a pensar como otro profesional.',
  },
]

function toneClasses(tone: Tone) {
  if (tone === 'info') {
    return 'border-psy-blue/20 bg-psy-blue-light/80 text-psy-ink'
  }

  if (tone === 'success') {
    return 'border-psy-green/20 bg-psy-green-light/85 text-psy-ink'
  }

  return 'border-psy-border/80 bg-white/90 text-psy-ink'
}

function HeroReportCard() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [visibleChars, setVisibleChars] = useState(0)

  useEffect(() => {
    const startTimer = window.setTimeout(() => setActiveIndex(0), 700)
    return () => window.clearTimeout(startTimer)
  }, [])

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= heroReportFields.length) {
      return
    }

    const current = heroReportFields[activeIndex]
    let cursor = 0

    const typingTimer = window.setInterval(() => {
      cursor += 2
      setVisibleChars(cursor)

      if (cursor >= current.content.length) {
        window.clearInterval(typingTimer)
        if (activeIndex < heroReportFields.length - 1) {
          window.setTimeout(() => {
            setActiveIndex(previous => previous + 1)
            setVisibleChars(0)
          }, 650)
        }
      }
    }, 28)

    return () => window.clearInterval(typingTimer)
  }, [activeIndex])

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(62,129,151,0.55)_0%,rgba(74,144,164,0.32)_25%,rgba(232,242,245,0.92)_55%,#fff_100%)] p-5 shadow-[0_24px_56px_rgba(62,129,151,0.15)] md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_38%)]" />
      <div className="relative flex items-start justify-between gap-4 border-b border-white/50 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/80">
            MENTEZER · Espacio clinico
          </p>
          <p className="mt-1 font-serif text-lg font-semibold tracking-tight text-white md:text-xl">
            Ana R. · Sesion 8 · TCC
          </p>
        </div>
        <div className="rounded-full border border-white/55 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-psy-blue">
          Respuesta IA
        </div>
      </div>

      <div className="relative mt-4 space-y-3">
        {heroReportFields.map((field, index) => {
          const isCurrent = index === activeIndex
          const isVisible = index <= activeIndex
          const typedText = isCurrent
            ? field.content.slice(0, Math.min(visibleChars, field.content.length))
            : isVisible
              ? field.content
              : ''

          return (
            <div
              key={field.id}
              className={`min-h-[96px] rounded-2xl border px-4 py-3 transition-all duration-300 ${
                isVisible
                  ? toneClasses(field.tone)
                  : 'border-white/35 bg-white/30 text-psy-ink/35'
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-psy-muted">
                {field.label}
              </p>
              <p className="mt-2 text-sm leading-7 md:text-[15px] md:leading-7">
                {typedText}
                {isCurrent && visibleChars < field.content.length ? (
                  <span className="type-caret">|</span>
                ) : null}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-psy-cream text-psy-ink">
      <header className="fixed left-1/2 top-4 z-50 w-full max-w-6xl -translate-x-1/2 px-4">
        <nav className="calm-panel flex items-center justify-between px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-blue-light text-psy-blue shadow-sm">
              <Brain size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-sora text-lg font-semibold tracking-tight text-psy-ink">
                MENTEZER
              </p>
              <p className="hidden text-xs text-psy-muted sm:block">
                Calma profesional para tu practica clinica
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-psy-border bg-white/75 p-1 md:flex">
            <Link
              href="/demo"
              className="rounded-full px-4 py-2 text-sm font-medium text-psy-blue transition hover:bg-psy-blue-light hover:text-psy-ink"
            >
              Demostracion
            </Link>
            <a
              href="#problema"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink"
            >
              Problema
            </a>
            <a
              href="#flujo"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink"
            >
              Como funciona
            </a>
            <a
              href="#planes"
              className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink"
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
              className="calm-button-primary rounded-full px-4 py-2.5 text-sm font-medium md:px-5"
            >
              <span className="hidden sm:inline">Prueba 14 dias</span>
              <span className="sm:hidden">Empezar</span>
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(open => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-psy-border bg-white/70 text-psy-ink transition hover:bg-white md:hidden"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen ? (
          <div className="absolute left-4 right-4 mt-3 overflow-hidden rounded-3xl border border-psy-border bg-white/96 p-4 shadow-[0_18px_40px_rgba(74,144,164,0.16)] backdrop-blur-xl animate-menu-in md:hidden">
            <div className="grid gap-2">
              <Link
                href="/demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-psy-blue/12 bg-psy-blue-light px-4 py-3.5 text-sm font-medium text-psy-blue"
              >
                Ver demostracion
                <Sparkles size={16} />
              </Link>
              <a
                href="#problema"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light"
              >
                Problema
              </a>
              <a
                href="#flujo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light"
              >
                Como funciona
              </a>
              <a
                href="#planes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light"
              >
                Precios
              </a>
              <div className="mt-2 border-t border-psy-warm-border pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-medium text-psy-ink active:bg-psy-blue-light"
                >
                  Ingresar a mi cuenta
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section className="px-4 pb-14 pt-28 md:px-6 md:pb-18 md:pt-32 lg:pb-20 lg:pt-36">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.02fr_0.98fr] md:items-center">
          <div className="reveal-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-psy-border bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-psy-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-psy-green animate-pulse" />
              Calma profesional para tu practica clinica
            </div>

            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[0.98] tracking-tight text-psy-ink sm:text-5xl lg:text-7xl">
              Menos reconstruccion mental. Mas criterio clinico en el momento correcto.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-psy-ink/75 md:text-lg">
              MENTEZER organiza agenda, sesion, biblioteca y cierre clinico en una interfaz serena. No compra humo tecnico: te devuelve foco, orden y presencia profesional.
            </p>

            <div className="mt-7 grid max-w-xl gap-2.5">
              {clarityPoints.map(point => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-psy-border bg-white/80 px-4 py-3 text-sm text-psy-ink/80 shadow-sm"
                >
                  <span className="mt-0.5 text-psy-green">
                    <Check size={15} strokeWidth={2.4} />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="calm-button-primary rounded-3xl px-6 py-4 text-sm font-medium"
              >
                Activar prueba de 14 dias
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/demo"
                className="calm-button-secondary rounded-3xl px-6 py-4 text-sm font-medium"
              >
                <Sparkles size={16} />
                Ver demostracion en vivo
              </Link>
            </div>
          </div>

          <div className="reveal-rise reveal-delay-2">
            <HeroReportCard />
            <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-psy-border bg-white/88 px-4 py-3 text-xs text-psy-muted shadow-sm">
              <span className="rounded-full bg-psy-amber-light px-2.5 py-1 font-medium text-psy-ink">
                Antes: 45 min
              </span>
              <span className="rounded-full bg-psy-blue-light px-2.5 py-1 font-medium text-psy-ink">
                Ahora: 28 seg.
              </span>
              <span>126 referencias activas</span>
              <span className="text-psy-green">Listo para cerrar consulta</span>
            </div>
          </div>
        </div>

        <div className="reveal-rise reveal-delay-3 mx-auto mt-10 grid max-w-6xl gap-2 rounded-3xl border border-psy-border bg-white/92 px-4 py-3 shadow-[0_18px_42px_rgba(74,144,164,0.12)] sm:grid-cols-2 lg:grid-cols-4">
          {quickFacts.map(item => (
            <div
              key={item.value}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-center md:text-left"
            >
              <p className="font-sora text-2xl font-semibold tracking-tight text-psy-ink shrink-0">
                {item.value}
              </p>
              <p className="text-xs leading-5 text-psy-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="problema" className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Seguir igual tiene costo
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              El atraso no siempre se ve dramatico. A veces se ve como cansancio acumulado.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-psy-ink/75">
              No se trata de moda tecnologica. Se trata de que tu forma de trabajar ya merece una estructura mejor que libreta, notas sueltas y memoria diferida.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.id}
                className={`hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-7 shadow-xl ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                  {item.id}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-psy-ink/75">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flujo" className="bg-psy-purple-light px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">
              Lo que recibes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Sales de una sesion con material para actuar, no con tareas pendientes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/75">
              Esa es la parte que mueve la compra. No la IA en abstracto. La sensacion concreta de terminar consulta sin quedarte debiendo media hora de reconstruccion clinica.
            </p>

            <div className="mt-8 rounded-3xl border border-psy-border bg-psy-ink p-6 text-psy-paper shadow-2xl">
              <p className="font-mono text-xs uppercase tracking-widest text-psy-paper/55">
                Que compra realmente el clinico
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  'Una estructura que ordena el cierre clinico en tiempo real.',
                  'Soporte tecnico y bibliografico visible, no escondido.',
                  'Una plataforma que si parece herramienta profesional delante del paciente.',
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
            {deliverables.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={`card-deliverable reveal-rise rounded-3xl border border-psy-border bg-white p-5 shadow-lg ${
                    index === 0
                      ? 'reveal-delay-1'
                      : index === 1
                        ? 'reveal-delay-2'
                        : index === 2
                          ? 'reveal-delay-3'
                          : 'reveal-delay-4'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
                      <Icon size={18} strokeWidth={1.8} />
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

                  <p className="mt-4 text-sm leading-7 text-psy-ink/80">{item.copy}</p>

                  <div className="mt-4 rounded-2xl border border-psy-border/70 bg-psy-paper/80 px-4 py-3">
                    <p className="font-mono text-xs uppercase tracking-widest text-psy-muted">
                      Senal tecnica
                    </p>
                    <p className="mt-2 text-xs leading-6 text-psy-ink/70">{item.technical}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-psy-muted">
                    <span className="rounded-full bg-psy-ink/5 px-2.5 py-1 font-medium text-psy-ink">
                      {item.metric}
                    </span>
                    <span>Mas orden clinico</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              La prueba importa
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Estos 14 dias no son una cortesia. Son el momento para ver si tu practica ya pidio este cambio.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trialSteps.map((step, index) => (
              <div
                key={step.day}
                className={`hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-xl ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : index === 2
                        ? 'reveal-delay-3'
                        : 'reveal-delay-4'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
                  {step.day}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-psy-ink/75">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-psy-cream px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Para quien encaja
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              No hace falta ser fan de la tecnologia. Hace falta estar cansado de perder tiempo.
            </h2>
          </div>

          <div className="grid gap-4">
            {personas.map((person, index) => (
              <div
                key={person.title}
                className={`card-profile reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-lg ${
                  index === 0
                    ? ''
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                }`}
              >
                <h3 className="font-serif text-2xl font-semibold tracking-tight">
                  {person.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-psy-ink/75">{person.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="bg-psy-purple-light px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">
              Precios
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Empieza con prueba real. Paga solo si ya te ordeno la practica.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/75">
              La conversacion ya no es si la tecnologia cabe en psicologia. La conversacion es si quieres seguir administrando tu consulta como en 2017.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.name}
                className={`reveal-rise rounded-3xl p-7 ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                } ${
                  plan.highlight
                    ? 'card-pricing card-pricing-pro bg-psy-ink text-psy-paper shadow-2xl'
                    : 'card-pricing border border-psy-ink/10 bg-white shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm ${plan.highlight ? 'text-psy-paper/65' : 'text-psy-muted'}`}>
                      {plan.name}
                    </p>
                    <p className="mt-3 font-serif text-5xl font-semibold tracking-tight">
                      {plan.price}
                      <span className={`ml-1 text-base font-normal ${plan.highlight ? 'text-psy-paper/65' : 'text-psy-muted'}`}>
                        /mes
                      </span>
                    </p>
                  </div>
                  {plan.highlight ? (
                    <div className="rounded-full bg-psy-green px-3 py-1 text-xs font-medium text-white">
                      El que mas valida
                    </div>
                  ) : null}
                </div>

                <p className={`mt-5 text-sm leading-7 ${plan.highlight ? 'text-psy-paper/80' : 'text-psy-ink/75'}`}>
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 ${plan.highlight ? 'text-psy-green-light' : 'text-psy-green'}`}>
                        <Check size={15} strokeWidth={2.4} />
                      </span>
                      <span className={plan.highlight ? 'text-psy-paper/85' : 'text-psy-ink'}>
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
                  Empezar prueba de 14 dias
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-18 md:px-6 md:py-22">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Dudas normales
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Si te lo estas preguntando, seguramente otro colega tambien.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <article
                key={faq.question}
                className={`card-faq hover-panel-green reveal-rise rounded-3xl border border-psy-border bg-white p-6 shadow-lg ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                }`}
              >
                <h3 className="font-serif text-2xl font-semibold tracking-tight">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-psy-ink/75">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-psy-cream px-4 pb-24 pt-10 md:px-6 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-psy-blue via-[#6ea6b6] to-[#aac7a3] p-5 text-white shadow-[0_26px_60px_rgba(74,144,164,0.22)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-widest text-psy-paper/55">
                Decision
              </p>
              <h2 className="mt-4 font-sora text-4xl font-semibold tracking-tight md:text-5xl lg:text-7xl">
                Si tu practica ya pide un sistema mas moderno...
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-psy-paper/80">
                No estas validando una tendencia. Estas validando si vale la pena seguir cerrando sesiones con el metodo de siempre.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="calm-button-secondary inline-flex rounded-2xl bg-white px-8 py-5 text-sm font-bold text-psy-ink shadow-xl shadow-white/10"
                >
                  Probar MENTEZER ahora
                  <ArrowRight size={16} />
                </Link>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-psy-paper/10 bg-white/5 px-5 py-4 text-xs text-psy-paper/75">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} />
                    Configuracion rapida
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Shield size={16} />
                    Sin tarjeta
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={16} />
                    Cierre mas ligero
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl lg:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-t from-psy-ink/40 to-transparent" />
                <Image
                  src="/img/mentezer-context.png"
                  alt="MENTEZER en uso clinico"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 36vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
