"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { createClient_admin } from "@/lib/admin/actions";

const initialState = null;

export default function NewClientPage() {
  const [state, action, pending] = useActionState(createClient_admin, initialState);

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clients" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-psy-ink font-semibold">Nuevo cliente</h1>
          <p className="text-xs text-psy-muted mt-0.5">
            Se creará la cuenta y se enviará un email con link para establecer contraseña.
          </p>
        </div>
      </div>

      <form action={action} className="space-y-5">
        {/* Datos del psicólogo */}
        <div className="bg-psy-paper border border-psy-border rounded-xl p-5 space-y-4">
          <h2 className="font-serif text-sm font-semibold text-psy-ink">Datos del psicólogo</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-psy-ink mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="psicologa@clinica.com"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-psy-ink mb-1">Nombre completo *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Dra. Laura Martínez"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">Tarjeta profesional</label>
              <input
                type="text"
                name="professional_license"
                placeholder="TP-12345678"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">Especialidad</label>
              <input
                type="text"
                name="specialty"
                placeholder="Psicología clínica"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">País</label>
              <select
                name="country"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              >
                <option value="CO">Colombia</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="PE">Perú</option>
                <option value="CL">Chile</option>
                <option value="VE">Venezuela</option>
                <option value="EC">Ecuador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">País</label>
              <select
                name="plan"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              >
                <option value="trial">Trial (gratuito)</option>
                <option value="starter">Starter — $29 USD/mes</option>
                <option value="professional">Professional — $59 USD/mes</option>
                <option value="clinic">Clinic — $149 USD/mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Período de trial */}
        <div className="bg-psy-paper border border-psy-border rounded-xl p-5">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-3">Período de prueba</h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="trial_days"
              defaultValue={14}
              min={1}
              max={90}
              className="w-24 px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm text-center focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
            />
            <span className="text-sm text-psy-muted">días de acceso completo</span>
          </div>
          <p className="text-xs text-psy-muted mt-2">
            El psicólogo recibirá un email con el link para activar su cuenta y establecer su contraseña.
          </p>
        </div>

        {state?.error && (
          <p className="text-xs text-psy-red bg-psy-red-light px-4 py-3 rounded-lg">{state.error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 disabled:opacity-50 transition-colors"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {pending ? "Creando cuenta..." : "Crear cliente"}
          </button>
          <Link
            href="/admin/clients"
            className="px-5 py-2.5 border border-psy-border text-psy-muted rounded-lg text-sm hover:text-psy-ink hover:bg-psy-paper transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
