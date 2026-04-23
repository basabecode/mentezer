import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Shield, PlugZap, FileSearch } from 'lucide-react'
import { PortalHero, PortalPage, PortalSection, PortalStatGrid } from '@/components/ui/portal-layout'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: admin } = await supabase
    .from('psychologists')
    .select('is_platform_admin')
    .eq('id', user?.id!)
    .single()

  if (!admin?.is_platform_admin) {
    redirect('/dashboard')
  }

  return (
    <PortalPage size="lg">
      <div className="space-y-6">
        <PortalHero
          eyebrow="Configuracion de plataforma"
          title="Admin settings"
          description={
            <p>
              Gestiona la configuracion global de MENTEZER con una superficie mas consistente con el nuevo sistema visual del dashboard y del portal clinico.
            </p>
          }
          aside={
            <div className="rounded-[1.8rem] border border-psy-ink/10 bg-psy-ink p-5 text-white shadow-xl shadow-psy-ink/18">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Estado</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">Panel base listo</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                La estructura visual ya permite crecer hacia auditoria, integraciones y politicas de seguridad sin romper consistencia.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Email', value: 'v1', hint: 'notificaciones base', accent: 'blue' },
            { label: 'Auditoria', value: 'v1', hint: 'logs y trazabilidad', accent: 'green' },
            { label: 'APIs', value: 'Roadmap', hint: 'integraciones externas', accent: 'amber' },
            { label: 'Seguridad', value: 'Activa', hint: 'politicas globales', accent: 'ink' },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: 'Email',
              copy: 'Configuracion de notificaciones por correo y comunicaciones operativas del sistema.',
              icon: Mail,
            },
            {
              title: 'Auditoria',
              copy: 'Logs de actividad del sistema y trazabilidad de acciones relevantes del portal.',
              icon: FileSearch,
            },
            {
              title: 'APIs',
              copy: 'Gestion de integraciones externas, credenciales y proveedores conectados.',
              icon: PlugZap,
            },
            {
              title: 'Seguridad',
              copy: 'Politicas de seguridad, cumplimiento y endurecimiento general de la plataforma.',
              icon: Shield,
            },
          ].map(item => {
            const Icon = item.icon
            return (
              <PortalSection key={item.title} eyebrow="Modulo" title={item.title}>
                <div className="rounded-[1.5rem] border border-psy-border bg-psy-cream/35 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-psy-blue shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm leading-7 text-psy-muted">{item.copy}</p>
                      <button className="mt-4 cursor-not-allowed rounded-2xl border border-psy-blue/20 bg-psy-blue-light px-4 py-2 text-sm font-medium text-psy-blue/70 opacity-80">
                        En desarrollo
                      </button>
                    </div>
                  </div>
                </div>
              </PortalSection>
            )
          })}
        </div>
      </div>
    </PortalPage>
  )
}
