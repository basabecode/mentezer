import Link from 'next/link'
import { BookOpen, CalendarDays, FileText, Mic, Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PortalPage } from '@/components/ui/portal-layout'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'BUENOS DIAS,'
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
  { href: '/sessions/new', label: 'Nueva sesion', icon: Mic, tone: 'border-[#dbe8ee] bg-[linear-gradient(180deg,#f4fafc_0%,#ffffff_100%)] text-[#4f899f]' },
  { href: '/patients/new', label: 'Nuevo paciente', icon: Users, tone: 'border-[#dce8dd] bg-[linear-gradient(180deg,#f7fbf7_0%,#ffffff_100%)] text-[#6e9170]' },
  { href: '/knowledge', label: 'Biblioteca', icon: BookOpen, tone: 'border-[#e4dcff] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] text-[#7b60d6]' },
  { href: '/reports', label: 'Informes', icon: FileText, tone: 'border-[#ece7d9] bg-[linear-gradient(180deg,#fdf9f1_0%,#ffffff_100%)] text-[#bf7b32]' },
]

function MetricTile({
  label,
  value,
  hint,
  dark = false,
}: {
  label: string
  value: string | number
  hint: string
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        dark
          ? 'border-psy-ink bg-psy-ink text-white shadow-[0_16px_32px_rgba(46,46,46,0.22)]'
          : 'border-psy-blue/15 bg-psy-blue-light text-psy-ink shadow-[0_8px_18px_rgba(62,129,151,0.08)]'
      }`}
    >
      <p className={`font-mono text-[9px] uppercase tracking-[0.28em] ${dark ? 'text-psy-paper opacity-60' : 'text-psy-blue'}`}>
        {label}
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className={`font-serif text-4xl font-bold leading-none tracking-tight ${dark ? 'text-psy-paper' : 'text-psy-ink'}`}>{value}</p>
        <p className={`pb-0.5 text-xs ${dark ? 'text-psy-paper opacity-60' : 'text-psy-muted'}`}>{hint}</p>
      </div>
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
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', user!.id)
      .eq('status', 'active'),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('psychologist_id', user!.id)
      .gte(
        'created_at',
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      ),
    supabase.from('ai_reports').select('*', { count: 'exact', head: true }).in('session_id', sessionIds),
    supabase.from('ai_reports').select('risk_signals').in('session_id', sessionIds).limit(20),
    supabase
      .from('patients')
      .select('id, name, created_at')
      .eq('psychologist_id', user!.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('sessions')
      .select('id, scheduled_at')
      .eq('psychologist_id', user!.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at')
      .limit(3),
  ])

  const highRisk = (riskReports ?? []).filter(report => {
    const signals = report.risk_signals as Array<{ severity: string }>
    return signals?.some(signal => signal.severity === 'high')
  }).length

  const psychName = user?.email?.split('@')[0] ?? 'psicologo'
  const displayName = psychName.split('.')[0].toLowerCase()

  const agendaRows = pendingSessions?.map((session, index) => ({
    id: session.id,
    time: formatTimeLabel(session.scheduled_at),
    day: formatDayTag(session.scheduled_at),
    patient: recentPatients?.[index]?.name ?? `Paciente ${index + 1}`,
    detail: `Sesion ${index + 1}`,
    active: index === 0,
  })) ?? []

  const patientRows =
    recentPatients?.map((patient, index) => ({
      id: patient.id,
      initials: patient.name
        .split(' ')
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join(''),
      name: patient.name,
      meta:
        index === 0
          ? 'Alta reciente'
          : index === 1
            ? 'Sesion 8 · TCC'
            : index === 2
              ? 'Seguimiento mensual'
              : 'En pausa',
    })) ?? []

  return (
    <PortalPage>
      <div className="space-y-4">
        <div className="px-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-psy-blue">
            {greeting()} <span className="ml-2 font-sans tracking-normal text-psy-ink">Panel</span>
          </p>
        </div>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_280px]">
          {/* Hero card — fondo oscuro como ancla visual */}
          <div className="rounded-2xl border border-psy-ink/90 bg-psy-ink px-4 py-5 text-psy-paper shadow-[0_20px_40px_rgba(46,46,46,0.20)] sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-psy-paper opacity-60">Panel activo</p>
                <h1 className="mt-2 font-serif text-[2.2rem] font-bold leading-none tracking-tight text-psy-paper sm:text-[2.8rem]">
                  {displayName}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-7 text-psy-paper opacity-70">
                  Panel operativo para atender, registrar y seguir cada sesion sin ruido visual.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-psy-blue px-4 py-2.5 text-sm font-semibold text-psy-paper shadow-[0_8px_18px_rgba(62,129,151,0.32)] transition hover:-translate-y-0.5"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Nueva sesion
                </Link>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 rounded-xl border border-psy-paper/15 bg-psy-paper/10 px-4 py-2.5 text-sm font-medium text-psy-paper opacity-90 backdrop-blur-sm transition hover:bg-psy-paper/15 hover:opacity-100"
                >
                  <CalendarDays size={15} strokeWidth={2.1} />
                  Agenda
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border border-psy-paper/10 bg-psy-paper/10 px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-paper opacity-60">Informes</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-psy-paper">{reportsTotal ?? 0}</p>
              </div>
              <div className="rounded-xl border border-psy-paper/10 bg-psy-paper/10 px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-paper opacity-60">Sesiones mes</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-psy-paper">{sessionsMonth ?? 0}</p>
              </div>
              <div className="rounded-xl border border-psy-amber/25 bg-psy-amber/15 px-3.5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-amber opacity-90">Alertas altas</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-psy-amber">{highRisk}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricTile label="Pacientes" value={totalPatients ?? 0} hint="activos" />
            <MetricTile label="Sesiones" value={sessionsMonth ?? 0} hint="este mes" dark />
          </div>
        </section>

        {/* Acciones rápidas — colores diferenciados por función */}
        <section className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.tone}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-psy-ink">{action.label}</span>
              </Link>
            )
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {/* Agenda — borde azul top */}
          <section className="overflow-hidden rounded-2xl border border-psy-border bg-white shadow-[0_8px_20px_rgba(13,34,50,0.04)]">
            <div className="border-b border-psy-blue/10 bg-psy-blue-light/60 px-4 py-3 sm:px-5">
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
                agendaRows.map(row => (
                  <div
                    key={row.id}
                    className={`rounded-xl border px-4 py-3.5 mb-2.5 last:mb-0 ${
                      row.active ? 'border-psy-blue/20 bg-psy-blue-light' : 'border-psy-border bg-psy-cream/50'
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
                ))
              ) : (
                <div className="rounded-xl border border-psy-border bg-psy-cream/50 px-4 py-5 text-sm leading-7 text-psy-muted">
                  No tienes sesiones programadas por ahora.
                </div>
              )}
            </div>
          </section>

          {/* Pacientes recientes — acento verde */}
          <section className="overflow-hidden rounded-2xl border border-psy-border bg-white shadow-[0_8px_20px_rgba(13,34,50,0.04)]">
            <div className="border-b border-psy-green/10 bg-psy-green-light/60 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-psy-green">Seguimiento</p>
                  <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-psy-ink">Pacientes recientes</h2>
                </div>
                <Link
                  href="/patients/new"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-psy-green text-white shadow-[0_8px_16px_rgba(127,155,121,0.28)] transition hover:-translate-y-0.5"
                >
                  <Plus size={15} strokeWidth={2.4} />
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {patientRows.length > 0 ? (
                <div className="grid gap-2">
                  {patientRows.map(row => (
                    <Link
                      key={row.id}
                      href={`/patients/${row.id}`}
                      className="grid items-center gap-3 rounded-xl border border-psy-border bg-psy-cream/40 px-3.5 py-3 transition hover:border-psy-green/20 hover:bg-psy-green-light/40 md:grid-cols-[auto_1fr_auto]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-psy-green-light text-sm font-bold text-psy-green">
                        {row.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-psy-ink">{row.name}</p>
                        <p className="mt-0.5 text-xs text-psy-muted">{row.meta}</p>
                      </div>
                      <span className="rounded-full bg-psy-green px-2.5 py-1 text-[10px] font-bold text-white">
                        Ver
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-psy-border bg-psy-cream/50 px-4 py-5 text-sm leading-7 text-psy-muted">
                  Aun no tienes pacientes recientes para mostrar.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </PortalPage>
  )
}
