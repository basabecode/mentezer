import { PaymentPanel } from "@/components/finance/PaymentPanel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Panel Financiero",
};

export default function FinancePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="mt-6">
          <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Control Financiero</h1>
          <p className="text-base text-psy-ink/60 mt-3 max-w-2xl">
            Gestiona cobros, saldos y el historial de pagos de tus pacientes de forma centralizada.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <PaymentPanel />

        {/* Instrucciones */}
        <div className="rounded-[2rem] border border-psy-border bg-white p-8 shadow-sm">
          <h3 className="font-sora text-lg font-bold text-psy-ink flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-psy-blue/10 text-psy-blue text-sm">📋</span>
            Guía de gestión
          </h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-psy-ink">Registrar pagos</p>
              <p className="text-xs text-psy-ink/50 leading-relaxed">Haz clic en el botón principal para agregar nuevos ingresos asociados a sesiones.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-psy-ink">Métodos admitidos</p>
              <p className="text-xs text-psy-ink/50 leading-relaxed">Efectivo, transferencia (Nequi, Daviplata), tarjeta bancaria o sesiones exentas.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-psy-ink">Seguimiento</p>
              <p className="text-xs text-psy-ink/50 leading-relaxed">Los saldos se calculan automáticamente restando los pagos realizados al valor de la sesión.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
