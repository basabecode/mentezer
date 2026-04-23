import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Shield, Bell, CreditCard, Lock, ChevronRight } from 'lucide-react'
import {
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: psychologist } = await supabase
    .from('psychologists')
    .select('name, professional_license, specialty, country, plan, trial_ends_at')
    .eq('id', user!.id)
    .single()

  const trialDaysLeft = psychologist?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(psychologist.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null

  return (
    <PortalPage size="lg">
      <div className="space-y-6">
        <PortalHero
          eyebrow="Cuenta profesional"
          title="Configuracion"
          description={
            <p>
              Perfil profesional, privacidad y estado del plan en una presentacion mas clara y consistente con el resto del portal.
            </p>
          }
          actions={[
            {
              href: '/settings/privacy',
              label: 'Privacidad',
              variant: 'secondary',
            },
            {
              href: '/support',
              label: 'Soporte',
            },
          ]}
          aside={
            <div className={`rounded-[1.8rem] border p-5 ${trialDaysLeft !== null && trialDaysLeft > 5 ? 'border-psy-blue/15 bg-psy-blue-light/75' : 'border-psy-amber/15 bg-psy-amber-light/75'}`}>
              <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${trialDaysLeft !== null && trialDaysLeft > 5 ? 'text-psy-blue' : 'text-psy-amber'}`}>
                Plan actual
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
                {psychologist?.plan ?? 'trial'}
              </h2>
              <p className="mt-2 text-sm leading-7 text-psy-muted">
                {trialDaysLeft !== null
                  ? `${trialDaysLeft} dias restantes antes de revisar continuidad del plan.`
                  : 'Estado del plan disponible cuando exista trial activo.'}
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Plan', value: psychologist?.plan ?? 'trial', hint: 'estado actual', accent: 'blue' },
            { label: 'Pais', value: psychologist?.country ?? '-', hint: 'region configurada', accent: 'green' },
            { label: 'Especialidad', value: psychologist?.specialty ?? '-', hint: 'perfil profesional', accent: 'amber' },
            { label: 'Licencia', value: psychologist?.professional_license ? 'Cargada' : 'Pendiente', hint: 'credencial visible', accent: 'ink' },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr]">
          <PortalSection eyebrow="Perfil profesional" title="Datos de cuenta">
            <div className="grid gap-4">
              {[
                { label: 'Nombre completo', value: psychologist?.name, icon: User },
                { label: 'Tarjeta profesional', value: psychologist?.professional_license, icon: CreditCard },
                { label: 'Especialidad', value: psychologist?.specialty, icon: User },
                { label: 'Pais', value: psychologist?.country, icon: User },
                { label: 'Email', value: user?.email, icon: User },
              ].map(item => {
                if (!item.value) return null
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-[1.5rem] border border-psy-border bg-psy-cream/35 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-psy-blue shadow-sm">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-psy-muted">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-psy-ink">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </PortalSection>

          <div className="grid gap-6">
            <PortalSection eyebrow="Privacidad" title="Datos y cumplimiento">
              <div className="rounded-[1.5rem] border border-psy-border bg-psy-blue-light/55 p-5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 text-psy-blue" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-psy-ink">Proteccion de datos clinicos</p>
                    <p className="mt-2 text-sm leading-7 text-psy-muted">
                      MENTEZER cumple con la Ley 1581 de Colombia. Los datos clinicos permanecen cifrados y aislados por profesional mediante RLS.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                <Link href="/legal/terms" className="hover-panel flex items-center justify-between rounded-2xl border border-psy-border bg-white px-4 py-3 text-sm text-psy-ink">
                  Terminos de uso
                  <ChevronRight size={16} className="text-psy-muted" />
                </Link>
                <Link href="/legal/privacy" className="hover-panel flex items-center justify-between rounded-2xl border border-psy-border bg-white px-4 py-3 text-sm text-psy-ink">
                  Politica de privacidad
                  <ChevronRight size={16} className="text-psy-muted" />
                </Link>
              </div>
            </PortalSection>

            <PortalSection eyebrow="Cuenta" title="Ajustes pendientes">
              <div className="grid gap-3">
                <div className="rounded-[1.5rem] border border-psy-border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 text-psy-amber" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-psy-ink">Notificaciones clinicas</p>
                      <p className="mt-2 text-sm leading-7 text-psy-muted">
                        Alertas de riesgo alto, recordatorios de citas y reportes pendientes en una misma capa de seguimiento.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-psy-border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 text-psy-blue" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-psy-ink">Edicion de perfil</p>
                      <p className="mt-2 text-sm leading-7 text-psy-muted">
                        Queda preparada la capa para editar datos profesionales y preferencias sin romper la jerarquia del portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PortalSection>
          </div>
        </div>
      </div>
    </PortalPage>
  )
}
