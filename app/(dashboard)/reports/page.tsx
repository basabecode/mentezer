import { FileText, AlertTriangle, TrendingUp, Brain, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/server'
import {
  PortalEmpty,
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: sessionRows } = await supabase
    .from('sessions')
    .select('id, patient_id, patients(name)')
    .eq('psychologist_id', user!.id)

  const ids = sessionRows?.map(session => session.id) ?? []

  const { data: rawReports } =
    ids.length > 0
      ? await supabase
          .from('ai_reports')
          .select('id, summary, risk_signals, generated_at, session_id')
          .in('session_id', ids)
          .order('generated_at', { ascending: false })
          .limit(50)
      : { data: [] }

  const patientBySession = Object.fromEntries(
    (sessionRows ?? []).map(session => [
      session.id,
      (session.patients as unknown as { name: string } | null)?.name ?? 'Paciente',
    ])
  )

  const reports = (rawReports ?? []).map(report => ({
    ...report,
    patientName: patientBySession[report.session_id] ?? 'Paciente',
  }))

  const highRiskCount =
    reports?.filter(report =>
      Array.isArray(report.risk_signals) &&
      (report.risk_signals as Array<{ severity: string }>).some(signal => signal.severity === 'high')
    ).length ?? 0

  const lastSevenDays =
    reports?.filter(report => {
      const reportDate = new Date(report.generated_at)
      const now = new Date()
      const diff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7
    }).length ?? 0

  return (
    <PortalPage size="lg">
      <div className="space-y-6">
        <PortalHero
          eyebrow="Analisis automatizado"
          title="Informes de IA"
          description={
            <p>
              Analisis generados automaticamente para facilitar el seguimiento clinico, ahora en una capa visual mas clara y con mejor jerarquia de riesgo.
            </p>
          }
          actions={[
            {
              href: '/sessions/new',
              label: 'Nueva sesion',
            },
            {
              href: '/patients',
              label: 'Ver pacientes',
              variant: 'secondary',
            },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-amber/15 bg-psy-amber-light/75 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-amber">Riesgo visible</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
                {highRiskCount} informe{highRiskCount === 1 ? '' : 's'} con alerta alta.
              </h2>
              <p className="mt-3 text-sm leading-7 text-psy-muted">
                Prioriza estos informes antes de cerrar seguimiento o preparar una nueva decision clinica.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Total informes', value: reports?.length ?? 0, hint: 'acumulados', accent: 'blue' },
            { label: 'Alertas graves', value: highRiskCount, hint: 'prioridad alta', accent: 'red' },
            { label: 'Ultimos siete dias', value: lastSevenDays, hint: 'actividad reciente', accent: 'green' },
            { label: 'Sesiones analizadas', value: ids.length, hint: 'base de lectura', accent: 'ink' },
          ]}
        />

        <PortalSection eyebrow="Lectura asistida" title="Historial de informes">
          {reports && reports.length > 0 ? (
            <div className="grid gap-3">
              {reports.map(report => {
                const riskSignals = Array.isArray(report.risk_signals)
                  ? (report.risk_signals as Array<{ severity: string }>)
                  : []
                const hasHighRisk = riskSignals.some(signal => signal.severity === 'high')

                return (
                  <Link
                    key={report.id}
                    href={`/sessions/${report.session_id}`}
                    className="hover-panel group flex flex-col gap-4 rounded-[1.6rem] border border-psy-border bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105',
                        hasHighRisk ? 'bg-psy-red-light text-psy-red' : 'bg-psy-blue-light text-psy-blue'
                      )}
                    >
                      <Brain size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="truncate text-base font-bold text-psy-ink">{report.patientName}</h3>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-psy-cream px-3 py-1 text-[11px] font-bold text-psy-muted">
                          <Calendar size={12} />
                          {new Date(report.generated_at).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-psy-muted">
                        {report.summary}
                      </p>
                      {hasHighRisk ? (
                        <div className="mt-3 flex">
                          <span className="rounded-full bg-psy-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            Alerta de riesgo detectada
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <PortalEmpty
              title="Sin informes aun"
              description="Los informes IA se generan despues de analizar una sesion transcrita. Ve a una sesion y ejecuta el analisis para empezar a construir el historial."
              action={
                <Link
                  href="/sessions/new"
                  className="lift-button inline-flex items-center gap-2 rounded-2xl bg-psy-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  <FileText size={16} />
                  Generar primer informe
                </Link>
              }
            />
          )}
        </PortalSection>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Trazabilidad de riesgo',
              copy: 'Las señales de mayor gravedad deben leerse primero y quedar separadas del resumen general.',
              icon: AlertTriangle,
              accent: 'bg-psy-red-light text-psy-red',
            },
            {
              title: 'Lectura longitudinal',
              copy: 'Compara actividad reciente y vuelve a la sesión exacta sin perder continuidad entre paciente, riesgo y resumen.',
              icon: TrendingUp,
              accent: 'bg-psy-green-light text-psy-green',
            },
            {
              title: 'Salida operativa',
              copy: 'El objetivo no es decorar el informe sino dejar claro qué sesión revisar y qué lectura necesita segunda validación.',
              icon: FileText,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5" style={{ borderColor: 'var(--psy-warm-border)' }}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}>
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-psy-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-psy-muted">{item.copy}</p>
              </div>
            )
          })}
        </div>
      </div>
    </PortalPage>
  )
}
