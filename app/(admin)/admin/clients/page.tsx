import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, CheckCircle, Clock, XCircle, PlugZap, Users } from 'lucide-react'
import {
  PortalEmpty,
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

const STATUS_MAP = {
  active: { label: 'Activo', color: 'bg-psy-green-light text-psy-green', icon: CheckCircle },
  pending: { label: 'Pendiente', color: 'bg-psy-amber-light text-psy-amber', icon: Clock },
  suspended: { label: 'Suspendido', color: 'bg-psy-red-light text-psy-red', icon: XCircle },
} as const

export default async function AdminClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('psychologists')
    .select('id, name, email, plan, account_status, specialty, country, created_at, trial_ends_at')
    .neq('is_platform_admin', true)
    .order('created_at', { ascending: false })

  const clientIds = clients?.map(client => client.id) ?? []
  const { data: integrations } =
    clientIds.length > 0
      ? await supabase
          .from('psychologist_integrations')
          .select('psychologist_id, provider')
          .in('psychologist_id', clientIds)
          .eq('is_active', true)
      : { data: [] }

  const integrationsByClient = (integrations ?? []).reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.psychologist_id]) acc[item.psychologist_id] = []
    acc[item.psychologist_id].push(item.provider)
    return acc
  }, {})

  const activeCount = clients?.filter(client => client.account_status === 'active').length ?? 0
  const trialCount = clients?.filter(client => client.plan === 'trial').length ?? 0
  const integratedCount = Object.keys(integrationsByClient).length

  return (
    <PortalPage>
      <div className="space-y-6">
        <PortalHero
          eyebrow="Cartera activa"
          title="Clientes"
          description={
            <p>
              Psicologos registrados en la plataforma, con lectura mas clara de estado, plan e integraciones activas.
            </p>
          }
          actions={[
            {
              href: '/admin/clients/new',
              label: 'Nuevo cliente',
              icon: <Plus size={16} strokeWidth={2.3} />,
            },
            {
              href: '/admin',
              label: 'Volver al resumen',
              variant: 'secondary',
            },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-blue/15 bg-psy-blue-light/75 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Cobertura</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
                {integratedCount} cuenta{integratedCount === 1 ? '' : 's'} con integraciones.
              </h2>
              <p className="mt-3 text-sm leading-7 text-psy-muted">
                El objetivo aqui es volver mas evidente quien ya esta operativo y quien todavia necesita acompanamiento.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Clientes', value: clients?.length ?? 0, hint: 'base total', accent: 'blue' },
            { label: 'Activos', value: activeCount, hint: 'cuentas habilitadas', accent: 'green' },
            { label: 'En trial', value: trialCount, hint: 'pendientes de conversion', accent: 'amber' },
            { label: 'Con integraciones', value: integratedCount, hint: 'conexion activa', accent: 'ink' },
          ]}
        />

        <PortalSection eyebrow="Listado operativo" title="Clientes registrados">
          <div className="grid gap-3">
            {clients?.map(client => {
              const status = STATUS_MAP[client.account_status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending
              const StatusIcon = status.icon
              const clientIntegrations = integrationsByClient[client.id] ?? []
              const trialLeft = client.trial_ends_at
                ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
                : null

              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="hover-panel flex flex-col gap-4 rounded-2xl border bg-white p-5"
                  style={{ borderColor: 'var(--psy-warm-border)' }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-psy-blue-light font-semibold text-psy-blue">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-psy-ink">{client.name}</p>
                        <p className="truncate text-xs text-psy-muted">{client.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize bg-white text-psy-ink border border-psy-border">
                        {client.plan}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                      {trialLeft !== null && client.plan === 'trial' ? (
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-mono ${trialLeft <= 3 ? 'bg-psy-red-light text-psy-red' : 'bg-psy-cream text-psy-muted'}`}>
                          {trialLeft}d restantes
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {clientIntegrations.length === 0 ? (
                        <span className="text-xs text-psy-muted">Sin integraciones activas</span>
                      ) : (
                        clientIntegrations.map(provider => (
                          <span
                            key={provider}
                            className="rounded-lg border border-psy-blue/10 bg-psy-blue-light px-2 py-1 text-[10px] font-mono text-psy-blue"
                          >
                            {provider.replace('_', ' ')}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-xs font-mono text-psy-muted">
                      Registro {new Date(client.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              )
            })}

            {(!clients || clients.length === 0) && (
              <PortalEmpty
                title="Sin clientes registrados aun"
                description="Crea el primer cliente para empezar a poblar la cartera del panel admin."
                action={
                  <Link
                    href="/admin/clients/new"
                    className="lift-button inline-flex items-center gap-2 rounded-2xl bg-psy-ink px-5 py-3 text-sm font-semibold text-psy-paper"
                  >
                    <Users size={16} />
                    Crear primer cliente
                  </Link>
                }
              />
            )}
          </div>
        </PortalSection>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Estado comercial',
              copy: 'La mezcla de plan, estado y trial queda visible en una sola línea de lectura.',
              icon: Clock,
              accent: 'bg-psy-amber-light text-psy-amber',
            },
            {
              title: 'Integraciones',
              copy: 'Se distingue mejor quién ya conecta servicios externos y quién sigue sin configurar.',
              icon: PlugZap,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
            {
              title: 'Operación admin',
              copy: 'Una superficie más útil para escanear y actuar rápido sobre la cartera de clientes.',
              icon: Users,
              accent: 'bg-psy-green-light text-psy-green',
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
