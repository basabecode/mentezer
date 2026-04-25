import Link from 'next/link'
import { Calendar, Clock, Plus, Lock, BellRing, CalendarDays } from 'lucide-react'
import {
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

export default function SchedulePage() {
  return (
    <PortalPage size="lg">
      <div className="space-y-6">
        <PortalHero
          eyebrow="Planificacion clinica"
          title="Agenda clinica"
          description={
            <p>
              Planifica disponibilidad, recordatorios y sincronizacion de agenda desde una base mas limpia y lista para evolucionar a reservas reales.
            </p>
          }
          actions={[
            {
              href: '/patients',
              label: 'Ver pacientes',
              variant: 'secondary',
            },
            {
              href: '/sessions/new',
              label: 'Nueva sesion',
            },
          ]}
          aside={
            <div className="group relative">
              <button
                disabled
                className="flex items-center gap-2 rounded-2xl border border-psy-blue/10 bg-psy-blue-light px-4 py-2.5 text-sm font-medium text-psy-blue/60"
                title="Disponible en v1.5"
              >
                <Plus size={16} strokeWidth={2.3} />
                Nueva cita
                <span className="ml-1 rounded-full bg-psy-amber-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-psy-amber">
                  v1.5
                </span>
              </button>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Booking online', value: 'v1.5', hint: 'en desarrollo', accent: 'blue' },
            { label: 'Sync calendarios', value: 'Google', hint: 'bidireccional', accent: 'green' },
            { label: 'Recordatorios', value: 'Automaticos', hint: 'flujo planeado', accent: 'amber' },
            { label: 'Estado', value: 'Prototipo', hint: 'base visual lista', accent: 'ink' },
          ]}
        />

        <PortalSection eyebrow="Roadmap funcional" title="Version 1.5 en desarrollo">
          <div className="rounded-2xl border border-psy-border bg-white px-5 py-6 text-center shadow-sm sm:px-8 sm:py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-psy-cream shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
              <Lock size={24} className="text-psy-blue/60" />
            </div>
            <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-psy-ink">
              Reserva y disponibilidad en una sola capa.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-psy-muted">
              Esta capa queda lista para disponibilidad, recordatorios y sincronizacion sin depender de tarjetas de relleno ni mensajes ambiguos.
            </p>
          </div>
        </PortalSection>

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { icon: CalendarDays, title: 'Calendario Mentezer', desc: 'Vista semanal de alto rendimiento para leer ocupacion y huecos utiles.' },
            { icon: Clock, title: 'Gestion de bloques', desc: 'Configura horarios de atencion, pausas y ventanas de disponibilidad.' },
            { icon: BellRing, title: 'Recordatorios', desc: 'Mensajes previos a cita para reducir ausencias y ordenar mejor la semana.' },
            { icon: Calendar, title: 'Sincronizacion', desc: 'Google Calendar primero; luego expansion a otros proveedores.' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-[1.75rem] border border-psy-warm-border bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)] p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-psy-blue-light text-psy-blue">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-psy-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-psy-muted">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </PortalPage>
  )
}
