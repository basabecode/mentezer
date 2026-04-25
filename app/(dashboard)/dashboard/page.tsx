import Link from 'next/link'
import { BookOpen, CalendarDays, FileText, Mic, Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PortalPage } from '@/components/ui/portal-layout'
import { toPatientSlug } from '@/lib/patients/slug'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'BUENOS DÍAS,'
  if (h < 18) return 'BUENAS TARDES,'
  return 'BUENAS NOCHES,'
}

function formatDayTag(dateValue: string | null) {
  if (!dateValue) return 'Sin fecha'
  return new Date(dateValue).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
  })
}

function formatTimeLabel(dateValue: string | null) {
  if (!dateValue) return '--:--'
  return new Date(dateValue).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const quickActions = [
  { href: '/sessions/new',  label: 'Nueva sesión',   icon: Mic,      bg: 'bg-psy-blue-light',   text: 'text-psy-blue',  border: 'border-psy-blue/15'  },
  { href: '/patients/new',  label: 'Nuevo paciente', icon: Users,    bg: 'bg-psy-blue-light',   text: 'text-psy-blue',  border: 'border-psy-blue/15'  },
  { href: '/knowledge',     label: 'Biblioteca',     icon: BookOpen, bg: 'bg-psy-amber-light',  text: 'text-psy-amber', border: 'border-psy-amber/15' },
  { href: '/reports',       label: 'Informes',       icon: FileText, bg: 'bg-psy-ink/[0.06]',   text: 'text-psy-ink',   border: 'border-psy-ink/10'   },
]

function MetricTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string | number
  hint: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-[1.75rem] border px-5 py-5 ${
        accent
          ? 'border-psy-ink/80 bg-psy-ink text-white shadow-[0_12px_28px_rgba(46,46,46,0.18)]'
          : 'border-psy-blue/15 bg-psy-blue-light text-psy-ink shadow-[0_6px_16px_rgba(96,126,201,0.08)]'
      }`}
    >
      <p className={`font-mono text-[9px] uppercase tracking-[0.28em] ${accent ? 'text-white/40' : 'text-psy-blue'}`}>
        {label}
      </p>
      <p className={`mt-4 font-serif text-2xl font-semibold leading-none tracking-tight ${accent ? 'text-white' : 'text-psy-ink'}`}>
        {value}
      </p>
      <p className={`mt-2 text-xs ${accent ? 'text-white/50' : 'text-psy-muted'}`}>{hint}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sessionIds =
    (
      await supabase
        .from('sessions')
        .select('id')
        .eq('psychologist_id', user!.id)
    ).data?.map(session => session.id) ?? []

  const [
    { count: totalPatients },
    { count: sessionsMonth },
    { count: reportsTotal },
    { data: riskReports },
    { data: recentPatients },
    { data: pendingSessions },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('psychologist_id', user!.id).eq('status', 'active'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('psychologist_id', user!.id).gte(
      'created_at',
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    ),
    supabase.from('ai_reports').select('*', { count: 'exact', head: true }).in('session_id', sessionIds),
    supabase.from('ai_reports').select('risk_signals').in('session_id', sessionIds).limit(20),
    supabase.from('patients').select('id, name, created_at').eq('psychologist_id', user!.id).eq('status', 'active').order('created_at', { ascending: false }).limit(4),
    supabase.from('sessions').select('id, scheduled_at').eq('psychologist_id', user!.id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(3),
  ])

  const highRisk = (riskReports ?? []).filter(report => {
    const signals = report.risk_signals as Array<{ severity: string }>
    return signals?.some(signal => signal.severity === 'high')
  }).length

  const rawName = user?.email?.split('@')[0] ?? 'psicólogo'
  const displayName = rawName.replace(/[._\d]/g, ' ').trim().split(' ')[0]

  const agendaRows = pendingSessions?.map((session, index) => ({
    id: session.id,
    time: formatTimeLabel(session.scheduled_at),
    day: formatDayTag(session.scheduled_at),
    patient: recentPatients?.[index]?.name ?? `Paciente ${index + 1}`,
    detail: `Sesión ${index + 1}`,
    active: index === 0,
  })) ?? []

  const patientRows =
    recentPatients?.map((patient, index) => ({
      id: patient.id,
      slug: toPatientSlug(patient.name, patient.id),
      initials: patient.name.split(' ').slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join(''),
      name: patient.name,
      meta: index === 0 ? 'Alta reciente' : index === 1 ? 'Sesión 8 · TCC' : index === 2 ? 'Seguimiento mensual' : 'En pausa',
    })) ?? []

  return (
    <PortalPage>
      <div className="space-y-4">

        {/* Saludo */}
        <div className="px-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-psy-blue">
            {greeting()} <span className="ml-2 font-sans normal-case tracking-normal text-psy-ink/55">Panel clínico</span>
          </p>
        </div>

        {/* Hero + métricas */}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_260px]">

          {/* Hero card — gradiente ink oscuro en lugar de navy plano */}
          <div className="relative overflow-hidden rounded-[2rem] border border-psy-ink/85 bg-gradient-to-br from-psy-ink via-[#1a2535] to-[#1c2c40] px-5 py-5 shadow-[0_16px_40px_rgba(46,46,46,0.22)]">
            {/* Halo de color sutil */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-psy-blue/20 blur-[64px]" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-psy-blue/10 blur-[48px]" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/40">Panel activo</p>
                <h1 className="mt-2 font-serif text-[2.2rem] font-bold leading-none tracking-tight text-white capitalize sm:text-[2.6rem]">
                  {displayName}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/60">
                  Panel operativo para atender, registrar y seguir cada sesión sin ruido visual.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-psy-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Nueva sesión
                </Link>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  <CalendarDays size={15} strokeWidth={2.1} />
                  Agenda
                </Link>
              </div>
            </div>

            {/* Mini stats dentro del hero */}
            <div className="relative mt-5 grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Informes</p>
                <p className="mt-2 font-serif text-xl font-semibold tracking-tight text-white">{reportsTotal ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Sesiones mes</p>
                <p className="mt-2 font-serif text-xl font-semibold tracking-tight text-white">{sessionsMonth ?? 0}</p>
              </div>
              {/* Alertas: si hay riesgo alto resalta en amber, si no es neutral */}
              <div className={`rounded-xl border px-3.5 py-3 ${
                highRisk > 0
                  ? 'border-psy-amber/30 bg-psy-amber/[0.12]'
                  : 'border-white/10 bg-white/[0.07]'
              }`}>
                <p className={`font-mono text-[9px] uppercase tracking-[0.22em] ${highRisk > 0 ? 'text-psy-amber/80' : 'text-white/40'}`}>
                  Alertas altas
                </p>
                <p className={`mt-2 font-serif text-xl font-semibold tracking-tight ${highRisk > 0 ? 'text-psy-amber' : 'text-white'}`}>
                  {highRisk}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas laterales — ambas con mismo tratamiento base */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile label="Pacientes" value={totalPatients ?? 0} hint="activos en seguimiento" />
            <MetricTile label="Sesiones" value={sessionsMonth ?? 0} hint="registradas este mes" accent />
          </div>
        </section>

        {/* Acciones rápidas */}
        <section className="grid gap-2.5 grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.border}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.bg} ${action.text} transition group-hover:scale-105`}>
                  <Icon size={16} strokeWidth={2.1} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-psy-ink">{action.label}</span>
              </Link>
            )
          })}
        </section>

        {/* Agenda + Pacientes */}
        <section className="grid gap-4 xl:grid-cols-2">

          {/* Agenda */}
          <section className="overflow-hidden rounded-2xl border border-psy-border bg-white shadow-[0_6px_16px_rgba(96,126,201,0.06)]">
            <div className="border-b border-psy-border/70 bg-psy-blue-light/40 px-5 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-blue">Agenda inmediata</p>
                  <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-psy-ink">Lo próximo</h2>
                </div>
                <Link href="/schedule" className="text-xs font-semibold text-psy-blue hover:underline">
                  Ver todo →
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {agendaRows.length > 0 ? (
                <div className="space-y-2.5">
                  {agendaRows.map(row => (
                    <div
                      key={row.id}
                      className={`rounded-xl border px-4 py-3.5 ${
                        row.active
                          ? 'border-psy-blue/20 bg-psy-blue-light/60'
                          : 'border-psy-border/60 bg-psy-cream/40'
                      }`}
                    >
                      <div className="grid items-center gap-3 md:grid-cols-[72px_1fr_auto]">
                        <div>
                          <p className="font-mono text-2xl font-bold leading-none tracking-tight text-psy-blue">{row.time}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-psy-muted">{row.day}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold tracking-tight text-psy-ink">{row.patient}</p>
                          <p className="mt-0.5 text-xs text-psy-muted">TCC · {row.detail}</p>
                        </div>
                        {row.active ? (
                          <span className="rounded-full bg-psy-blue px-3 py-1 text-[10px] font-bold text-white">Próxima</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-psy-border/50 bg-psy-cream/40 px-4 py-5 text-sm leading-7 text-psy-muted">
                  No tienes sesiones programadas por ahora.
                </div>
              )}
            </div>
          </section>

          {/* Pacientes recientes */}
          <section className="overflow-hidden rounded-2xl border border-psy-border bg-white shadow-[0_6px_16px_rgba(96,126,201,0.06)]">
            <div className="border-b border-psy-border/70 bg-psy-blue-light/40 px-5 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-blue">Seguimiento</p>
                  <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-psy-ink">Pacientes recientes</h2>
                </div>
                <Link
                  href="/patients/new"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-psy-blue text-white shadow-[0_6px_14px_rgba(96,126,201,0.28)] transition hover:-translate-y-0.5"
                >
                  <Plus size={15} strokeWidth={2.4} />
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {patientRows.length > 0 ? (
                <div className="space-y-2">
                  {patientRows.map(row => (
                    <Link
                      key={row.id}
                      href={`/patients/${row.slug}`}
                      className="group grid items-center gap-3 rounded-xl border border-psy-border/50 bg-psy-cream/30 px-3.5 py-3 transition hover:border-psy-blue/20 hover:bg-psy-blue-light/30 md:grid-cols-[auto_1fr_auto]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-blue-light text-sm font-bold text-psy-blue transition group-hover:scale-105">
                        {row.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-psy-ink">{row.name}</p>
                        <p className="mt-0.5 text-xs text-psy-muted">{row.meta}</p>
                      </div>
                      <span className="rounded-full bg-psy-blue-light px-2.5 py-1 text-[10px] font-semibold text-psy-blue">
                        Ver
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-psy-border/50 bg-psy-cream/40 px-4 py-5 text-sm leading-7 text-psy-muted">
                  Aún no tienes pacientes recientes para mostrar.
                </div>
              )}
            </div>
          </section>
        </section>

      </div>
    </PortalPage>
  )
}
