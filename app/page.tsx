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
    return 'border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(59,111,160,0.15)] backdrop-blur-2xl'
  }

  if (tone === 'success') {
    return 'border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(74,124,89,0.15)] backdrop-blur-2xl'
  }

  return 'border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(0,0,0,0.1)] backdrop-blur-2xl'
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
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-psy-ink via-[#1C2C35] to-psy-ink p-6 md:p-8">
      {/* Blurred background orbs for inner glass effect */}
      <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-psy-blue/30 blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-psy-green/25 blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-psy-amber-light drop-shadow-sm">
            MENTEZER · Espacio clinico
          </p>
          <p className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-white drop-shadow-md">
            Ana R. · Sesion 8 · TCC
          </p>
        </div>
        <div className="rounded-full border border-psy-blue/40 bg-psy-blue/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-sm backdrop-blur-md">
          Respuesta IA
        </div>
      </div>

      <div className="relative z-10 mt-6 space-y-4">
        {heroReportFields.map((field, index) => {
          const isCurrent = index === activeIndex
          const isVisible = index <= activeIndex
          const typedText = isCurrent
            ? field.content.slice(0, Math.min(visibleChars, field.content.length))
            : isVisible
              ? field.content
              : ''

          return (
            <div key={field.id} className="group relative">
              {/* Glow Border (Blow Border) Effect */}
              <div className={`absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 blur-md ${isVisible ? 'group-hover:opacity-80' : ''} ${
                field.tone === 'info' ? 'bg-psy-blue' : field.tone === 'success' ? 'bg-psy-green' : 'bg-psy-amber'
              }`} />
              <div className={`absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 ${isVisible ? 'group-hover:opacity-100' : ''} ${
                field.tone === 'info' ? 'bg-psy-blue' : field.tone === 'success' ? 'bg-psy-green' : 'bg-psy-amber'
              }`} />

              {/* Glass Grid Panel */}
              <div
                className={`relative z-10 m-[1px] flex min-h-[96px] flex-col rounded-[calc(1.25rem-1px)] border px-5 py-4 transition-all duration-300 ${
                  isVisible
                    ? toneClasses(field.tone)
                    : 'border-white/10 bg-white/20 text-white/30 backdrop-blur-md'
                }`}
              >
                <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors duration-300 ${isVisible ? 'text-psy-muted' : 'text-white/30'}`}>
                  {field.label}
                </p>
                <p className={`mt-2 text-[15px] leading-relaxed font-medium transition-colors duration-300 ${isVisible ? 'text-psy-ink/90' : 'text-white/30'}`}>
                  {typedText}
                  {isCurrent && visibleChars < field.content.length ? (
                    <span className="type-caret text-psy-ink">|</span>
                  ) : null}
                </p>
              </div>
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

      <section className="px-4 pb-10 pt-24 md:px-6 md:pb-12 md:pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.02fr_0.98fr] md:items-center">
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="calm-button-primary rounded-full px-8 py-3.5 text-[15px] font-medium shadow-sm transition-all hover:scale-[1.02]"
              >
                Empezar prueba gratis
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-medium text-psy-ink/60 transition-colors hover:text-psy-ink"
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

        <div className="reveal-rise reveal-delay-3 mx-auto mt-8 grid max-w-6xl gap-2 rounded-3xl border border-psy-border bg-white/92 px-4 py-3 shadow-[0_18px_42px_rgba(74,144,164,0.12)] sm:grid-cols-2 lg:grid-cols-4">
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

      <section id="problema" className="bg-psy-ink px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
              Seguir igual tiene costo
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white md:text-5xl">
              El atraso no siempre se ve dramatico. A veces se ve como cansancio acumulado.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-psy-paper opacity-75">
              No se trata de moda tecnologica. Se trata de que tu forma de trabajar ya merece una estructura mejor que libreta, notas sueltas y memoria diferida.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.id}
                className={`reveal-rise rounded-2xl border border-psy-paper/10 bg-psy-paper/5 p-5 shadow-xl transition-all hover:bg-psy-paper/10 ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">
                  {item.id}
                </p>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-psy-paper/80">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flujo" className="bg-[#F7F9F9] px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">
              Lo que recibes
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-psy-ink md:text-5xl">
              Sales de una sesion con material para actuar, no con tareas pendientes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/75">
              Esa es la parte que mueve la compra. No la IA en abstracto. La sensacion concreta de terminar consulta sin quedarte debiendo media hora de reconstruccion clinica.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {deliverables.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={`group relative reveal-rise flex flex-col rounded-[2rem] transition-all duration-500 hover:-translate-y-2 ${
                    index === 0
                      ? 'reveal-delay-1'
                      : index === 1
                        ? 'reveal-delay-2'
                        : index === 2
                          ? 'reveal-delay-3'
                          : 'reveal-delay-4'
                  }`}
                >
                  {/* Glow Border Effect */}
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-psy-blue via-psy-green to-psy-amber opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-sm" />
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-psy-blue via-psy-green to-psy-amber opacity-20 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  {/* Glass Panel */}
                  <div className="relative z-10 m-[2px] flex h-full flex-col rounded-[calc(2rem-2px)] border border-white/60 bg-white/70 p-5 shadow-lg backdrop-blur-2xl transition-all duration-500 group-hover:bg-white/90">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${item.accent}`}>
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-psy-muted">
                          {item.kicker}
                        </p>
                        <h3 className="mt-1 font-serif text-[19px] font-semibold tracking-tight text-psy-ink">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 text-[14px] leading-relaxed text-psy-ink/80 font-medium">{item.copy}</p>

                    <div className="mt-auto pt-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-psy-ink/5 px-2.5 py-1.5 text-[11px] font-bold text-psy-ink">
                        {item.metric}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-psy-blue px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-paper opacity-80">
              La prueba importa
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Estos 14 dias no son una cortesia. Son el momento para ver si tu practica ya pidio este cambio.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {trialSteps.map((step, index) => (
              <div
                key={step.day}
                className={`reveal-rise flip-card-container h-[210px] w-full transition-all duration-300 hover:-translate-y-2 ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : index === 2
                        ? 'reveal-delay-3'
                        : 'reveal-delay-4'
                }`}
              >
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front flex flex-col justify-center rounded-2xl border border-white/15 bg-white/10 p-5 shadow-sm">
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-psy-amber-light">
                      {step.day}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-white">
                      {step.title}
                    </h3>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back flex flex-col justify-center rounded-2xl border border-psy-amber/40 bg-white/25 p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-[17px] leading-[1.6] text-white drop-shadow-sm font-medium">{step.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="relative bg-psy-cream px-4 py-16 md:px-6 md:py-24 overflow-hidden">
        {/* Colorful Blobs for Pricing Glassmorphism */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-psy-blue/15 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-psy-green/15 blur-[100px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-psy-amber/15 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl z-10">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green drop-shadow-sm">
              Precios
            </p>
            <h2 className="mt-4 font-sora text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-psy-ink drop-shadow-sm">
              Empieza con prueba real. Paga solo si ya te ordeno la practica.
            </h2>
            <p className="mt-6 text-lg leading-8 text-psy-ink/80 font-medium">
              La conversacion ya no es si la tecnologia cabe en psicologia. La conversacion es si quieres seguir administrando tu consulta como en 2017.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.name}
                className={`reveal-rise relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-3 ${
                  index === 0
                    ? 'reveal-delay-1'
                    : index === 1
                      ? 'reveal-delay-2'
                      : 'reveal-delay-3'
                } ${
                  plan.highlight
                    ? 'bg-psy-ink/85 border border-white/20 text-white shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-[32px]'
                    : 'bg-white/40 border border-white/60 text-psy-ink shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl'
                }`}
              >
                {/* Glare effect inside glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-widest ${plan.highlight ? 'text-psy-amber-light drop-shadow-sm' : 'text-psy-blue'}`}>
                      {plan.name}
                    </p>
                    <p className="mt-3 font-sora text-5xl font-bold tracking-tight">
                      {plan.price}
                      <span className={`ml-1 text-base font-medium ${plan.highlight ? 'text-white/60' : 'text-psy-ink/60'}`}>
                        /mes
                      </span>
                    </p>
                  </div>
                  {plan.highlight ? (
                    <div className="rounded-full border border-psy-green/30 bg-psy-green/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-psy-green-light backdrop-blur-md">
                      El que mas valida
                    </div>
                  ) : null}
                </div>

                <p className={`relative z-10 mt-6 text-[15px] leading-7 font-medium ${plan.highlight ? 'text-white/85' : 'text-psy-ink/80'}`}>
                  {plan.description}
                </p>

                <ul className="relative z-10 mt-8 space-y-4">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] font-medium">
                      <span className={`mt-0.5 ${plan.highlight ? 'text-psy-green-light drop-shadow-sm' : 'text-psy-green'}`}>
                        <Check size={18} strokeWidth={2.4} />
                      </span>
                      <span className={plan.highlight ? 'text-white/95' : 'text-psy-ink'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`relative z-10 mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[15px] font-bold transition-all hover:shadow-lg ${
                    plan.highlight
                      ? 'bg-white text-psy-ink hover:bg-psy-paper hover:scale-[1.02]'
                      : 'bg-psy-ink text-white hover:bg-black hover:scale-[1.02]'
                  }`}
                >
                  Empezar prueba de 14 dias
                  <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="relative bg-psy-cream px-4 py-16 md:px-6 md:py-24 overflow-hidden">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-psy-amber">
              Flujo de Garantías
            </p>
            <h2 className="mt-4 font-sora text-3xl font-bold tracking-tight text-psy-ink md:text-5xl">
              Certezas antes de empezar
            </h2>
            <p className="mt-4 text-lg text-psy-ink/60 font-medium max-w-2xl mx-auto">
              Si te lo estás preguntando, seguramente otro colega también.
            </p>
          </div>

          <div className="relative mt-12">
            {/* Horizontal Connection Line */}
            <div className="hidden lg:block absolute top-[19px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-psy-border to-transparent" />

            <div className="grid lg:grid-cols-3 gap-6 relative z-10">
              {faqs.map((faq, index) => (
                <div key={faq.question} className={`relative group reveal-rise ${index === 0 ? '' : index === 1 ? 'reveal-delay-1' : 'reveal-delay-2'}`}>
                  
                  {/* Light Glassmorphism Card without complex nodes */}
                  <article className="overflow-hidden rounded-[1.5rem] border border-psy-border bg-white p-6 md:p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(13,34,50,0.08)] hover:border-psy-blue/30">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-psy-blue opacity-80 mb-3 transition-colors duration-300 group-hover:text-psy-green">
                      Paso 0{index + 1}
                    </p>
                    <h3 className="font-sora text-[19px] leading-[1.3] font-bold tracking-tight text-psy-ink transition-colors duration-300 group-hover:text-psy-blue">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-[14px] leading-relaxed text-psy-ink/75 font-medium">
                      {faq.answer}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-psy-ink px-4 pb-20 pt-16 md:px-6 md:pb-32 md:pt-24 overflow-hidden">
        {/* Background Colorful Blobs for Glassmorphism Effect */}
        <div className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-psy-blue/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-psy-amber/30 blur-[100px] pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-psy-green/20 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          <div className="relative rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-white/15 to-white/5 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-[40px] md:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center relative">
              
              {/* Text Content */}
              <div className="lg:col-span-7 relative z-20">
                <p className="font-mono text-sm font-bold uppercase tracking-widest text-psy-amber-light drop-shadow-sm">
                  Decision
                </p>
                <h2 className="mt-4 font-sora text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-md">
                  Si tu practica ya pide un sistema mas moderno...
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 font-medium">
                  No estas validando una tendencia. Estas validando si vale la pena seguir cerrando sesiones con el metodo de siempre.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-psy-ink shadow-xl transition-all hover:-translate-y-1 hover:bg-psy-paper hover:shadow-2xl"
                  >
                    Probar MENTEZER ahora
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                    <span className="inline-flex items-center gap-2 text-white/95">
                      <CalendarDays size={16} />
                      Configuracion rapida
                    </span>
                    <span className="inline-flex items-center gap-2 text-white/95">
                      <Shield size={16} />
                      Sin tarjeta
                    </span>
                    <span className="inline-flex items-center gap-2 text-white/95">
                      <Clock3 size={16} />
                      Cierre mas ligero
                    </span>
                  </div>
                </div>
              </div>

              {/* Imagen Integrada en la Tarjeta */}
              <div className="lg:col-span-5 relative z-30 mt-6 lg:mt-0">
                <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:scale-105 hover:rotate-0 lg:rotate-3">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-psy-ink/40 via-transparent to-transparent pointer-events-none" />
                  <Image
                    src="/img/mentezer-context.png"
                    alt="MENTEZER en uso clinico"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
