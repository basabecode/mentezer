import { PaymentPanel } from "@/components/finance/PaymentPanel";

export const metadata = {
  title: "Panel Financiero",
};

export default function FinancePage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      <PaymentPanel />

      {/* Instrucciones */}
      <div className="rounded-2xl border border-psy-border bg-psy-blue/5 p-6">
        <h3 className="font-serif text-lg font-semibold text-psy-ink">
          📋 Cómo usar el panel
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-psy-muted">
          <li>
            • <strong>Registrar pago:</strong> Haz clic en "Registrar pago" para
            agregar ingresos de sesiones
          </li>
          <li>
            • <strong>Moneda:</strong> Todos los valores están en USD
          </li>
          <li>
            • <strong>Métodos:</strong> Efectivo, transferencia, Nequi,
            Daviplata, tarjeta o exento
          </li>
          <li>
            • <strong>Filtros:</strong> Visualiza por semana o mes para
            análisis de tendencias
          </li>
          <li>
            • <strong>Datos:</strong> Los pagos no se pueden modificar una vez
            guardados (por auditoría)
          </li>
        </ul>
      </div>
    </div>
  );
}
