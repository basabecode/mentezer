import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, AlertTriangle, Clock, UserRound, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { PortalEmpty, PortalPage, PortalSection } from '@/components/ui/portal-layout'
import { toPatientSlug } from '@/lib/patients/slug'

function formatCreated(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
  })
}

export default async function PatientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, name, age, gender, reason, status, consent_signed_at, created_at')
    .eq('psychologist_id', user!.id)
    .order('created_at', { ascending: false })

  const activeCount = patients?.filter(patient => patient.status === 'active').length ?? 0
  const pendingConsent = patients?.filter(patient => !patient.consent_signed_at).length ?? 0
  const createdThisMonth =
    patients?.filter(patient => {
      const createdAt = new Date(patient.created_at)
      const now = new Date()
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length ?? 0

  return (
    <PortalPage>
      <div className="space-y-5">

        {/* Header hero */}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_260px]">
          <div className="rounded-[2rem] border bg-white px-5 py-5 shadow-[0_12px_32px_rgba(13,34,50,0.05)]" style={{ borderColor: 'var(--psy-warm-border)' }}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-blue">Seguimiento clínico</p>
                <h1 className="mt-2 font-serif text-[2rem] font-bold tracking-tight text-psy-ink sm:text-[2.5rem]">Pacientes</h1>
                <p className="mt-2 max-w-xl text-sm leading-7 text-psy-muted">
                  Fichas activas, consentimientos y nuevas altas desde una sola vista operativa.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/patients/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-psy-ink px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(46,46,46,0.18)] transition hover:-translate-y-0.5"
                >
                  <Plus size={15} strokeWidth={2.3} />
                  Registrar paciente
                </Link>
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm font-medium text-psy-ink transition hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ borderColor: 'var(--psy-warm-border)' }}
                >
                  <FileText size={15} strokeWidth={2.1} />
                  Nueva sesión
                </Link>
              </div>
            </div>

            {/* Stat row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-psy-blue/15 bg-psy-blue-light px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-blue">Pacientes</p>
                <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-psy-ink">{patients?.length ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-psy-muted">base registrada</p>
              </div>
              <div className="rounded-2xl border border-psy-blue/15 bg-psy-blue-light px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-blue">Activos</p>
                <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-psy-ink">{activeCount}</p>
                <p className="mt-0.5 text-[11px] text-psy-muted">en seguimiento</p>
              </div>
              <div className="rounded-2xl border border-psy-amber/15 bg-psy-amber-light px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-psy-amber">Sin consentimiento</p>
                <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-psy-ink">{pendingConsent}</p>
                <p className="mt-0.5 text-[11px] text-psy-muted">requieren revisión</p>
              </div>
            </div>
          </div>

          {/* Aside métricas */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-psy-amber/15 bg-psy-amber-light px-5 py-4 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-amber">Pendientes</p>
              <p className="mt-3 font-serif text-4xl font-bold tracking-tight text-psy-ink">{pendingConsent}</p>
              <p className="mt-1.5 text-sm text-psy-muted">sin consentimiento</p>
            </div>
            <div className="rounded-[1.75rem] border border-psy-blue/15 bg-psy-blue-light px-5 py-4 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-psy-blue">Altas del mes</p>
              <p className="mt-3 font-serif text-4xl font-bold tracking-tight text-psy-ink">{createdThisMonth}</p>
              <p className="mt-1.5 text-sm text-psy-muted">nuevas fichas</p>
            </div>
          </div>
        </section>

        {/* Lista */}
        <PortalSection
          eyebrow="Listado principal"
          title="Seguimiento activo"
          action={
            <Link href="/patients/new" className="text-sm font-medium text-psy-blue hover:underline">
              Agregar paciente
            </Link>
          }
        >
          <div className="space-y-2.5">
            {patients?.map(patient => (
              <Link
                key={patient.id}
                href={`/patients/${toPatientSlug(patient.name, patient.id)}`}
                className="group grid gap-3 rounded-2xl border bg-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-psy-blue/20 hover:shadow-[0_8px_20px_rgba(13,34,50,0.06)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                style={{ borderColor: 'var(--psy-warm-border)' }}
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-psy-blue/15 bg-psy-blue-light text-sm font-bold text-psy-blue transition group-hover:scale-105">
                    {patient.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold tracking-tight text-psy-ink">{patient.name}</h3>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          patient.status === 'active'
                            ? 'border-psy-blue/15 bg-psy-blue-light text-psy-blue'
                            : patient.status === 'paused'
                              ? 'border-psy-amber/15 bg-psy-amber-light text-psy-amber'
                              : 'bg-psy-cream text-psy-muted',
                        )}
                        style={patient.status === 'closed' ? { borderColor: 'var(--psy-warm-border)' } : {}}
                      >
                        {patient.status === 'active' ? 'Activo' : patient.status === 'paused' ? 'Pausado' : 'Cerrado'}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-psy-muted">{patient.reason || 'Sin motivo registrado'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-psy-muted">
                      <span className="inline-flex items-center gap-1 rounded-full border border-psy-blue/15 bg-psy-blue-light px-2.5 py-1">
                        <Clock size={11} />
                        {formatCreated(patient.created_at)}
                      </span>
                      {!patient.consent_signed_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-psy-red/15 bg-psy-red-light px-2.5 py-1 text-psy-red">
                          <AlertTriangle size={11} />
                          Falta consentimiento
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-end">
                  <span className="rounded-full border border-psy-blue/15 bg-psy-blue-light px-3 py-1 text-xs font-semibold text-psy-blue transition group-hover:bg-psy-blue group-hover:text-white">
                    Ver ficha
                  </span>
                </div>
              </Link>
            ))}

            {(!patients || patients.length === 0) && (
              <PortalEmpty
                title="No tienes pacientes registrados"
                description="Registra tu primer paciente para comenzar el seguimiento clínico con una ficha más estructurada."
                action={
                  <Link
                    href="/patients/new"
                    className="inline-flex items-center gap-2 rounded-2xl bg-psy-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(46,46,46,0.16)]"
                  >
                    <UserRound size={16} />
                    Crear primer paciente
                  </Link>
                }
              />
            )}
          </div>
        </PortalSection>

      </div>
    </PortalPage>
  )
}
