import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, Activity, Shield, ArrowRight } from 'lucide-react'
import { HealthStatus } from '@/components/admin/HealthStatus'
import {
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: total },
    { count: activos },
    { count: trial },
    { data: recientes },
  ] = await Promise.all([
    supabase
      .from('psychologists')
      .select('*', { count: 'exact', head: true })
      .neq('is_platform_admin', true),
    supabase
      .from('psychologists')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'active')
      .neq('is_platform_admin', true),
    supabase
      .from('psychologists')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'trial')
      .neq('is_platform_admin', true),
    supabase
      .from('psychologists')
      .select('id, name, email, plan, account_status, created_at, trial_ends_at')
      .neq('is_platform_admin', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const suspendidos = (total ?? 0) - (activos ?? 0)
  const conversion = total ? Math.round((((total ?? 0) - (trial ?? 0)) / total) * 100) : 0

  const planColors: Record<string, string> = {
    trial: 'bg-psy-amber-light text-psy-amber',
    starter: 'bg-psy-blue-light text-psy-blue',
    professional: 'bg-psy-green-light text-psy-green',
    clinic: 'bg-psy-ink text-psy-paper',
  }

  return (
    <PortalPage>
      <div className="space-y-6">
        <PortalHero
          eyebrow="Operacion de plataforma"
          title="Panel admin"
          description={
            <p>
              Salud comercial y operativa en una sola capa: conversiones, clientes activos, cuentas en trial y señales de intervencion.
            </p>
          }
          actions={[
            {
              href: '/admin/clients/new',
              label: 'Nuevo cliente',
              icon: <Plus size={16} strokeWidth={2.3} />,
            },
            {
              href: '/admin/clients',
              label: 'Ver cartera completa',
              variant: 'secondary',
            },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-ink/10 bg-psy-ink p-5 text-psy-paper shadow-xl shadow-psy-ink/18">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-paper opacity-45">Conversion y riesgo</p>
              <p className="mt-3 font-sora text-3xl font-semibold tracking-tight">{conversion}%</p>
              <p className="mt-3 text-sm leading-7 text-psy-paper opacity-70">
                {trial ?? 0} cuenta{trial === 1 ? '' : 's'} en trial y {suspendidos} suspendida{suspendidos === 1 ? '' : 's'} para revisar esta semana.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Clientes totales', value: total ?? 0, hint: 'base registrada', accent: 'blue' },
            { label: 'Cuentas activas', value: activos ?? 0, hint: 'usando plataforma', accent: 'green' },
            { label: 'En trial', value: trial ?? 0, hint: 'pendientes de conversion', accent: 'amber' },
            { label: 'Suspendidos', value: suspendidos, hint: 'requieren revision', accent: 'red' },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <PortalSection
            eyebrow="Clientes recientes"
            title="Onboarding y cartera"
            action={
              <Link href="/admin/clients" className="text-sm font-medium text-psy-blue hover:underline">
                Ver todos
              </Link>
            }
          >
            <div className="grid gap-3">
              {(recientes ?? []).map(client => {
                const trialLeft = client.trial_ends_at
                  ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
                  : null
                const palette = planColors[client.plan] ?? planColors.trial

                return (
                  <Link
                    key={client.id}
                    href={`/admin/clients/${client.id}`}
                    className="hover-panel flex flex-col gap-4 rounded-[1.5rem] border border-psy-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-blue-light font-semibold text-psy-blue">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-psy-ink">{client.name}</p>
                        <p className="truncate text-xs text-psy-muted">{client.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {trialLeft !== null && trialLeft > 0 && trialLeft <= 3 ? (
                        <span className="rounded-full bg-psy-red-light px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-psy-red">
                          {trialLeft}d
                        </span>
                      ) : null}
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${palette}`}>
                        {client.plan}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                        client.account_status === 'active'
                          ? 'bg-psy-green-light text-psy-green'
                          : client.account_status === 'pending'
                            ? 'bg-psy-amber-light text-psy-amber'
                            : 'bg-psy-red-light text-psy-red'
                      }`}>
                        {client.account_status === 'active'
                          ? 'Activo'
                          : client.account_status === 'pending'
                            ? 'Pendiente'
                            : 'Suspendido'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </PortalSection>

          <div className="grid gap-6">
            <PortalSection eyebrow="Salud de plataforma" title="Estado actual">
              <HealthStatus />
            </PortalSection>

            <PortalSection eyebrow="Accion sugerida" title="Prioriza trial corto y cuentas suspendidas" className="bg-psy-ink text-psy-paper">
              <div className="space-y-4">
                <p className="text-sm leading-7 text-psy-paper opacity-75">
                  Si la conversion es la metrica a empujar esta semana, el frente mas claro esta en quienes estan terminando prueba y en cuentas que se quedaron a mitad de activacion.
                </p>
                <div className="grid gap-3">
                  <Link href="/admin/clients" className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-psy-ink">
                    <Users size={16} />
                    Revisar clientes
                  </Link>
                  <Link href="/admin/settings" className="lift-button inline-flex items-center justify-center gap-2 rounded-2xl border border-psy-paper/15 px-4 py-3 text-sm font-medium text-psy-paper opacity-85">
                    <Shield size={16} />
                    Configuracion admin
                  </Link>
                </div>
              </div>
            </PortalSection>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Base de clientes',
              copy: 'Lee altas, estados y plan sin mezclar la capa comercial con mensajes de relleno.',
              icon: Users,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
            {
              title: 'Conversión',
              copy: 'Las cuentas cercanas a vencer deben quedar visibles para accionar antes de perder conversión.',
              icon: ArrowRight,
              accent: 'bg-psy-amber-light text-psy-amber',
            },
            {
              title: 'Salud del sistema',
              copy: 'Estado técnico y acción operativa conviven, pero con jerarquía suficiente para no competir entre sí.',
              icon: Activity,
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
