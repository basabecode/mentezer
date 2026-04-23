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
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-psy-blue/10 bg-psy-blue-light px-5 py-4 text-sm font-semibold text-psy-blue/50"
                title="Disponible en v1.5"
              >
                <Plus size={18} strokeWidth={2.3} />
                Nueva cita
                <span className="rounded-full bg-psy-amber-light px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-psy-amber">
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
          <div className="rounded-[2rem] border border-psy-border bg-white px-5 py-8 text-center shadow-sm sm:px-8 sm:py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-psy-cream shadow-sm">
              <Lock size={32} className="text-psy-blue" />
            </div>
            <h3 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-psy-ink">
              Reserva y disponibilidad en una sola capa.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-psy-muted">
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
              <div key={item.title} className="rounded-[1.75rem] border border-[#dce8ed] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)] p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6f9] text-psy-blue">
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
