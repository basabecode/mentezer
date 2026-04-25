'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MentezerLogo } from '@/components/brand/MentezerLogo'
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
  { value: '14 días', label: 'de prueba real, sin tarjeta' },
  { value: '5 min', label: 'para dejar lista la cuenta' },
  { value: '< 2 min', label: 'para tener reporte post-sesión' },
  { value: '0 datos', label: 'vendidos a terceros. Nunca.' },
]

const heroReportFields: ReportField[] = [
  {
    id: 'subjective',
    label: 'Subjetivo',
    content:
      'Reporta cansancio sostenido, culpa al descansar y dificultad para desconectarse del trabajo al final del día.',
    tone: 'neutral',
  },
  {
    id: 'analysis',
    label: 'Análisis clínico',
    content:
      'La IA detecta autoexigencia como regulador de valor personal y recupera una cita clínica útil para sostener la hipótesis exploratoria.',
    tone: 'info',
  },
  {
    id: 'next-session',
    label: 'Próxima sesión',
    content:
      'Queda listo un siguiente paso claro: explorar descanso como pérdida de valor y registrar pensamientos automáticos.',
    tone: 'success',
  },
]

const painPoints = [
  {
    id: '01',
    title: 'Las notas se quedan para la noche',
    copy: 'Tu jornada termina tarde porque la sesión no termina cuando el paciente sale. Termina cuando logras reconstruirla.',
  },
  {
    id: '02',
    title: 'Tu criterio clínico llega sin apoyo a tiempo',
    copy: 'Los autores que usas sí existen en tu práctica, pero no están a la mano justo cuando necesitas ordenar lo ocurrido.',
  },
  {
    id: '03',
    title: 'Agenda, cuaderno y WhatsApp ya piden relevo',
    copy: 'Ese sistema aguanta al principio. Cuando crecen los pacientes, empieza a cobrarte en orden, energía y percepción profesional.',
  },
]

const deliverables = [
  {
    title: 'Sesión capturada',
    kicker: 'Registro base',
    copy: 'Grabas o subes audio y el caso queda listo para trabajarse sin reconstruir la sesión desde memoria parcial.',
    metric: 'Cierre inmediato',
    icon: Mic,
    accent: 'bg-psy-blue-light text-psy-blue',
  },
  {
    title: 'Soporte bibliográfico',
    kicker: 'Rigor clínico',
    copy: 'El análisis trae citas de los libros que usas, con autor y página, dentro del mismo flujo de trabajo.',
    metric: 'Cita útil en el reporte',
    icon: BookOpen,
    accent: 'bg-psy-amber-light text-psy-amber',
  },
  {
    title: 'Decisión clínica',
    kicker: 'Acción siguiente',
    copy: 'Resumen, patrón central, hipótesis exploratoria y próximo paso quedan en una estructura que sí sirve para actuar.',
    metric: 'Próximo paso definido',
    icon: Sparkles,
    accent: 'bg-psy-green-light text-psy-green',
  },
  {
    title: 'Privacidad clínica',
    kicker: 'Confianza institucional',
    copy: 'Audio cifrado, trazabilidad y una estructura pensada para trabajar con información sensible de forma seria.',
    metric: 'Seguridad visible',
    icon: Lock,
    accent: 'bg-psy-ink/[0.07] text-psy-ink',
  },
]

const trialSteps = [
  {
    day: 'Día 1',
    title: 'Cargas tu primer caso real',
    copy: 'La prueba sirve porque no es un sandbox vacío. Entras con material verdadero y ves rápido si encaja.',
  },
  {
    day: 'Día 3',
    title: 'Comparas cómo cierras una sesión',
    copy: 'Ahí aparece la diferencia entre seguir escribiendo tarde y salir con una base mucho más armada.',
  },
  {
    day: 'Día 7',
    title: 'Se nota el orden',
    copy: 'Tu consulta empieza a sentirse más moderna para ti y más consistente para el paciente.',
  },
  {
    day: 'Día 14',
    title: 'Decides con criterio propio',
    copy: 'No compras por una promesa bonita. Compras porque ya viste si el cambio te quitó carga real.',
  },
]

const personas = [
  {
    title: 'Psicólogo clínico individual',
    copy: 'Si llevas agenda llena y cierras el día escribiendo a contrarreloj, aquí ganas claridad y tiempo sin perder tu criterio.',
  },
  {
    title: 'Consultorio que quiere verse más serio',
    copy: 'Cuando el paciente siente orden, seguimiento y velocidad, también percibe una práctica más moderna y confiable.',
  },
  {
    title: 'Equipo que ya no quiere operar por WhatsApp',
    copy: 'Si varias personas tocan la agenda, los reportes y las derivaciones, necesitas sistema. No más parches pegados.',
  },
]

const plans = [
  {
    name: 'Lite',
    price: '$19',
    description: 'Para psicólogos en consulta privada que quieren ordenar su práctica sin perder tiempo.',
    features: [
      'Notas SOAP/DAP generadas con IA',
      'Hasta 3 enfoques clínicos activos',
      'Biblioteca base de 126 libros',
      'Prueba de 14 días gratis',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'Para psicólogos clínicos y psiquiatras que necesitan documentación avanzada.',
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
    description: 'Para consultorios y equipos que necesitan coordinación y operación compartida.',
    features: [
      'Hasta 5 profesionales',
      'Panel administrativo central',
      'Facturación unificada',
      'Onboarding dedicado',
    ],
  },
]

const faqs = [
  {
    question: '¿Esto reemplaza mi criterio clínico?',
    answer: 'No. Esa parte no se negocia. MENTEZER organiza, recupera contexto y te ayuda a cerrar mejor la sesión. La decisión sigue siendo tuya.',
  },
  {
    question: '¿La prueba de 14 días pide tarjeta?',
    answer: 'No. La idea es validar uso real sin meter una barrera innecesaria al principio.',
  },
  {
    question: '¿Puedo trabajar con mis propios libros?',
    answer: 'Sí. Ese es uno de los puntos fuertes. La plataforma no te obliga a pensar como otro profesional.',
  },
]

function toneClasses(tone: Tone) {
  if (tone === 'info') return 'border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(59,111,160,0.15)] backdrop-blur-2xl'
  if (tone === 'success') return 'border-white/50 bg-white/80 text-psy-ink shadow-[0_8px_16px_rgba(74,124,89,0.15)] backdrop-blur-2xl'
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
    if (activeIndex < 0 || activeIndex >= heroReportFields.length) return

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
      <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-psy-blue/30 blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-psy-green/25 blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-psy-amber-light drop-shadow-sm">
            MENTEZER · Espacio clínico
          </p>
          <p className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-white drop-shadow-md">
            Ana R. · Sesión 8 · TCC
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
              <div className={`absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-500 blur-md ${isVisible ? 'group-hover:opacity-60' : ''} ${
                field.tone === 'info' ? 'bg-psy-blue' : field.tone === 'success' ? 'bg-psy-green' : 'bg-psy-amber'
              }`} />
              <div
                className={`relative z-10 m-[1px] flex min-h-[96px] flex-col rounded-[calc(1.25rem-1px)] border px-5 py-4 transition-all duration-300 ${
                  isVisible ? toneClasses(field.tone) : 'border-white/10 bg-white/20 text-white/30 backdrop-blur-md'
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

      {/* ─── NAV ─── */}
      <header className="fixed left-1/2 top-4 z-50 w-full max-w-7xl -translate-x-1/2 px-4">
        <nav className="calm-panel flex items-center justify-between px-4 py-3 md:px-5">
          <Link href="/" className="flex flex-col gap-0.5">
            <MentezerLogo variant="light" size="md" />
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-psy-border bg-white/75 p-1 md:flex">
            <Link href="/demo" className="rounded-full px-4 py-2 text-sm font-medium text-psy-blue transition hover:bg-psy-blue-light hover:text-psy-ink">
              Demostración
            </Link>
            <a href="#problema" className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink">
              Problema
            </a>
            <a href="#flujo" className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink">
              Cómo funciona
            </a>
            <a href="#planes" className="rounded-full px-4 py-2 text-sm text-psy-muted transition hover:bg-psy-blue-light hover:text-psy-ink">
              Precios
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-4 py-2 text-sm text-psy-muted transition hover:text-psy-ink sm:inline-flex">
              Ingresar
            </Link>
            <Link href="/register" className="calm-button-primary rounded-full px-4 py-2.5 text-sm font-medium md:px-5">
              <span className="hidden sm:inline">Prueba 14 días</span>
              <span className="sm:hidden">Empezar</span>
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(open => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-psy-border bg-white/70 text-psy-ink transition hover:bg-white md:hidden"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen ? (
          <div className="absolute left-4 right-4 mt-3 overflow-hidden rounded-3xl border border-psy-border bg-white/96 p-4 shadow-[0_18px_40px_rgba(74,144,164,0.16)] backdrop-blur-xl animate-menu-in md:hidden">
            <div className="grid gap-2">
              <Link href="/demo" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between rounded-2xl border border-psy-blue/20 bg-psy-blue-light px-4 py-3.5 text-sm font-medium text-psy-blue">
                Ver demostración <Sparkles size={16} />
              </Link>
              <a href="#problema" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light">Problema</a>
              <a href="#flujo" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light">Cómo funciona</a>
              <a href="#planes" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-psy-muted active:bg-psy-blue-light">Precios</a>
              <div className="mt-2 border-t border-psy-warm-border pt-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-medium text-psy-ink active:bg-psy-blue-light">
                  Ingresar a mi cuenta
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* ─── HERO ─── */}
      <section className="px-4 pb-10 pt-24 md:px-6 md:pb-12 md:pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.02fr_0.98fr] md:items-start">
          <div className="reveal-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-psy-border bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-psy-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-psy-green animate-pulse" />
              IA Clínica · Para profesionales de salud mental
            </div>

            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.02] tracking-tight text-psy-ink sm:text-5xl lg:text-[3.6rem]">
              Menos reconstrucción mental. Más criterio clínico en el momento correcto.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-psy-ink/70 md:text-lg">
              MENTEZER organiza agenda, sesión, biblioteca y cierre clínico en una interfaz serena. Te devuelve foco, orden y presencia profesional.
            </p>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="calm-button-primary rounded-full px-8 py-3.5 text-[15px] font-medium shadow-sm">
                Empezar prueba gratis
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-psy-border bg-white/70 px-6 py-3.5 text-[14px] font-medium text-psy-ink/65 transition-all hover:bg-white hover:text-psy-ink hover:border-psy-blue/30 hover:shadow-sm"
              >
                <Sparkles size={15} />
                Ver demostración
              </Link>
            </div>

            {/* Stats — debajo del CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-psy-border/40 bg-white/40 px-4 py-3 text-[11px] font-medium text-psy-muted shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-sm">
              <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <span className="opacity-60 line-through">Antes: 45m</span>
                <span className="text-psy-blue">Ahora: 28s</span>
              </div>
              <span className="h-3 w-[1px] bg-psy-border"></span>
              <span>126 referencias activas</span>
              <span className="h-3 w-[1px] bg-psy-border"></span>
              <span className="text-psy-ink">Listo para cerrar consulta</span>
            </div>
          </div>

          <div className="reveal-rise reveal-delay-2">
            <HeroReportCard />
          </div>
        </div>

        {/* Quick facts bar */}
        <div className="reveal-rise reveal-delay-3 mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-psy-warm-border bg-white/92 shadow-[0_18px_42px_rgba(74,144,164,0.10)]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {quickFacts.map((item, i) => (
              <div
                key={item.value}
                className={`flex items-center gap-3 px-5 py-4${i > 0 ? ' border-t lg:border-t-0 lg:border-l' : ''}`}
                style={{ borderColor: 'var(--psy-warm-border)' }}
              >
                <p className="font-mono text-xl tracking-tight text-psy-ink shrink-0">{item.value}</p>
                <p className="text-xs leading-5 text-psy-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEMA ─── */}
      <section id="problema" className="bg-psy-ink px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">Seguir igual tiene costo</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white md:text-5xl">
              El atraso no siempre se ve dramático. A veces se ve como cansancio acumulado.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-psy-paper/70">
              No se trata de moda tecnológica. Se trata de que tu forma de trabajar ya merece una estructura mejor que libreta, notas sueltas y memoria diferida.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.id}
                className={`reveal-rise rounded-2xl border border-psy-paper/10 bg-psy-paper/5 p-6 transition-all hover:bg-psy-paper/10 ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-psy-amber">{item.id}</p>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-psy-paper/75">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LO QUE RECIBES ─── */}
      <section id="flujo" className="bg-[#F7F9F9] px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-blue">Lo que recibes</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-psy-ink md:text-5xl">
              Sales de una sesión con material para actuar, no con tareas pendientes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-psy-ink/70">
              La sensación concreta de terminar consulta sin quedarte debiendo media hora de reconstrucción clínica.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={`card-deliverable reveal-rise flex flex-col rounded-2xl border border-psy-border bg-white p-5 shadow-sm ${
                    index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : index === 2 ? 'reveal-delay-3' : 'reveal-delay-4'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${item.accent}`}>
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-psy-muted">{item.kicker}</p>
                      <h3 className="mt-1 font-serif text-[18px] font-semibold tracking-tight text-psy-ink">{item.title}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-relaxed text-psy-ink/70">{item.copy}</p>

                  <div className="mt-auto pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-psy-border bg-psy-cream px-3 py-1.5 text-[11px] font-semibold text-psy-muted">
                      {item.metric}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PARA QUIÉN ─── */}
      <section className="bg-white px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-blue">Para quién es</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-psy-ink md:text-5xl">
              Diseñado para profesionales que ya quieren algo mejor.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {personas.map((persona, index) => (
              <div
                key={persona.title}
                className={`card-profile reveal-rise rounded-2xl border border-psy-border bg-psy-cream p-6 ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                }`}
              >
                <h3 className="font-serif text-[19px] font-semibold tracking-tight text-psy-ink">{persona.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-psy-ink/70">{persona.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14 DÍAS ─── */}
      <section className="bg-psy-blue px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-paper/70">La prueba importa</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Estos 14 días no son una cortesía. Son el momento para ver si tu práctica ya pidió este cambio.
            </h2>
          </div>

          {/* Desktop: flip cards */}
          <div className="hidden md:grid gap-4 md:grid-cols-4">
            {trialSteps.map((step, index) => (
              <div
                key={step.day}
                className={`reveal-rise flip-card-container h-[220px] w-full ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : index === 2 ? 'reveal-delay-3' : 'reveal-delay-4'
                }`}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-5">
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-psy-amber-light">{step.day}</p>
                    <div>
                      <h3 className="font-serif text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                      <p className="mt-2 text-[11px] text-white/35 tracking-wide">Pasa el cursor para ver más</p>
                    </div>
                  </div>
                  <div className="flip-card-back flex flex-col justify-center rounded-2xl border border-psy-amber/40 bg-white/20 p-5 backdrop-blur-sm">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-psy-amber-light mb-3">{step.day}</p>
                    <p className="text-[16px] leading-[1.65] text-white font-medium">{step.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: cards estáticas */}
          <div className="grid gap-3 md:hidden">
            {trialSteps.map(step => (
              <div key={`m-${step.day}`} className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-psy-amber-light">{step.day}</p>
                <h3 className="mt-2 font-serif text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/80">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="planes" className="relative bg-psy-cream px-4 py-16 md:px-6 md:py-24 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-psy-blue/15 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/4 -translate-y-1/4 rounded-full bg-psy-green/12 blur-[100px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-psy-amber/12 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl z-10">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-psy-green">Precios</p>
            <h2 className="mt-4 font-sora text-4xl font-bold tracking-tight md:text-5xl text-psy-ink">
              Empieza con prueba real. Paga solo si ya te ordenó la práctica.
            </h2>
            <p className="mt-6 text-lg leading-8 text-psy-ink/70">
              La conversación ya no es si la tecnología cabe en psicología. La conversación es si quieres seguir administrando tu consulta como en 2017.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.name}
                className={`reveal-rise relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 ${
                  index === 0 ? 'reveal-delay-1' : index === 1 ? 'reveal-delay-2' : 'reveal-delay-3'
                } ${
                  plan.highlight
                    ? 'bg-psy-ink/90 border border-white/20 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[32px]'
                    : 'bg-white/55 border border-white/70 text-psy-ink shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-widest ${plan.highlight ? 'text-psy-amber-light' : 'text-psy-blue'}`}>
                      {plan.name}
                    </p>
                    <p className="mt-3 font-sora text-5xl font-bold tracking-tight">
                      {plan.price}
                      <span className={`ml-1 text-base font-medium ${plan.highlight ? 'text-white/50' : 'text-psy-ink/50'}`}>/mes</span>
                    </p>
                  </div>
                  {plan.highlight ? (
                    <div className="rounded-full border border-psy-green/30 bg-psy-green/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-psy-green-light backdrop-blur-md">
                      Más elegido
                    </div>
                  ) : null}
                </div>

                <p className={`relative z-10 mt-5 text-[15px] leading-7 ${plan.highlight ? 'text-white/80' : 'text-psy-ink/70'}`}>
                  {plan.description}
                </p>

                <ul className="relative z-10 mt-7 space-y-3.5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-[14px]">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-psy-green-light' : 'text-psy-green'}`}>
                        <Check size={16} strokeWidth={2.5} />
                      </span>
                      <span className={plan.highlight ? 'text-white/90' : 'text-psy-ink/85'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`relative z-10 mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[14px] font-bold transition-all hover:shadow-lg hover:scale-[1.02] ${
                    plan.highlight ? 'bg-white text-psy-ink hover:bg-psy-paper' : 'bg-psy-ink text-white hover:bg-black'
                  }`}
                >
                  Empezar prueba de 14 días
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PREGUNTAS FRECUENTES ─── */}
      <section className="bg-white px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-psy-blue">
              Preguntas frecuentes
            </p>
            <h2 className="mt-4 font-sora text-3xl font-bold tracking-tight text-psy-ink md:text-4xl">
              Lo que suelen preguntar
            </h2>
            <p className="mt-4 text-base text-psy-ink/55 max-w-xl mx-auto">
              Si te lo estás preguntando, seguramente otro colega también.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {faqs.map((faq, index) => (
              <article
                key={faq.question}
                className={`card-faq reveal-rise rounded-2xl border border-psy-border bg-psy-cream p-6 md:p-7 ${
                  index === 0 ? '' : index === 1 ? 'reveal-delay-1' : 'reveal-delay-2'
                }`}
              >
                <h3 className="font-serif text-[18px] leading-[1.35] font-semibold text-psy-ink">
                  {faq.question}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-psy-ink/70">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative bg-psy-ink px-4 pb-20 pt-16 md:px-6 md:pb-32 md:pt-24 overflow-hidden">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-psy-blue/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-psy-amber/30 blur-[100px] pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-psy-green/20 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          <div className="relative rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-white/15 to-white/5 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-[40px] md:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

              <div className="lg:col-span-7 relative z-20">
                <p className="font-mono text-sm font-bold uppercase tracking-widest text-psy-amber-light">
                  Decisión
                </p>
                <h2 className="mt-4 font-sora text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Si tu práctica ya pide un sistema más moderno…
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
                  No estás validando una tendencia. Estás validando si vale la pena seguir cerrando sesiones con el método de siempre.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-psy-ink shadow-xl transition-all hover:-translate-y-1 hover:bg-psy-paper hover:shadow-2xl"
                  >
                    Probar MENTEZER ahora
                    <ArrowRight size={18} />
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-xs font-medium text-white/70 backdrop-blur-md">
                    <span className="inline-flex items-center gap-2"><CalendarDays size={14} /> Configuración rápida</span>
                    <span className="inline-flex items-center gap-2"><Shield size={14} /> Sin tarjeta</span>
                    <span className="inline-flex items-center gap-2"><Clock3 size={14} /> Cierre más ligero</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative z-30 mt-6 lg:mt-0">
                <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:scale-[1.03] lg:rotate-3 lg:hover:rotate-0">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-psy-ink/40 via-transparent to-transparent pointer-events-none" />
                  <Image
                    src="/img/mentezer-context.png"
                    alt="MENTEZER en uso clínico"
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

      {/* ─── FOOTER ─── */}
      <footer className="bg-psy-ink border-t border-white/8 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <MentezerLogo variant="dark" size="sm" />
            <span className="text-white/20 text-sm">·</span>
            <span className="text-xs text-white/35">Construido en Cali, Colombia 🇨🇴</span>
          </div>

          <nav className="flex items-center gap-5 text-xs text-white/40">
            <Link href="/legal/privacy" className="hover:text-white/65 transition-colors">Privacidad</Link>
            <Link href="/legal/terms" className="hover:text-white/65 transition-colors">Términos</Link>
            <Link href="/support" className="hover:text-white/65 transition-colors">Soporte</Link>
            <span className="text-white/20">© 2025 MENTEZER</span>
          </nav>
        </div>
      </footer>

    </main>
  )
}
