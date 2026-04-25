import Link from 'next/link'
import { CreditCard, Wallet, Landmark } from 'lucide-react'
import { PaymentPanel } from '@/components/finance/PaymentPanel'
import {
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

export const metadata = {
  title: 'Panel Financiero',
}

export default function FinancePage() {
  return (
    <PortalPage>
      <div className="space-y-6">
        <PortalHero
          eyebrow="Operacion financiera"
          title="Control financiero"
          description={
            <p>
              Gestiona cobros, saldos y el historial de pagos de tus pacientes en una capa mas clara y consistente con el nuevo dashboard.
            </p>
          }
          actions={[
            { href: '/reports', label: 'Ver informes' },
            { href: '/patients', label: 'Ver pacientes', variant: 'secondary' },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-green/15 bg-psy-green-light/80 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-green">Enfoque</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
                Cobro, saldo y trazabilidad en la misma vista.
              </h2>
              <p className="mt-3 text-sm leading-7 text-psy-muted">
                La prioridad aqui es identificar cobros pendientes, saldos abiertos y trazabilidad de cada movimiento.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Cobros', value: 'Centralizado', hint: 'una sola vista', accent: 'blue' },
            { label: 'Saldos', value: 'Visible', hint: 'seguimiento continuo', accent: 'green' },
            { label: 'Metodos', value: 'Multiples', hint: 'efectivo o transferencia', accent: 'amber' },
            { label: 'Registro', value: 'Trazable', hint: 'historial ordenado', accent: 'ink' },
          ]}
        />

        <PortalSection eyebrow="Caja activa" title="Pagos y movimientos">
          <PaymentPanel />
        </PortalSection>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Registrar pagos',
              copy: 'Registra ingresos asociados a sesiones y deja el saldo listo para revisarse sin calculos manuales.',
              icon: Wallet,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
            {
              title: 'Metodos admitidos',
              copy: 'Efectivo, transferencia o billeteras digitales dentro de una estructura unica y facil de auditar.',
              icon: Landmark,
              accent: 'bg-psy-amber-light text-psy-amber',
            },
            {
              title: 'Seguimiento de saldo',
              copy: 'La lectura financiera debe mostrar rapido cuanto falta por cobrar y en que paciente sigue abierto el saldo.',
              icon: CreditCard,
              accent: 'bg-psy-green-light text-psy-green',
            },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-[1.75rem] border border-psy-warm-border bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)] p-5 shadow-[0_14px_34px_rgba(13,34,50,0.05)] transition-transform duration-200 hover:-translate-y-0.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-psy-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-psy-muted">{item.copy}</p>
              </div>
            )
          })}
        </div>

      </div>
    </PortalPage>
  )
}
