"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCase } from "@/lib/cases/actions";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const OUTCOMES = [
  { value: "successful", label: "Remisión de síntomas" },
  { value: "partial", label: "Cumplimiento parcial" },
  { value: "failed", label: "Sin mejoría" },
] as const;

const INTERVENTIONS = [
  "TCC",
  "EMDR",
  "DBT",
  "Psicodinámica",
  "Sistémica",
  "Humanista",
  "Mindfulness",
  "Farmacológica",
] as const;

export default function NewCasePage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createCase, {});
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/cases"
            className="flex items-center gap-2 text-sm text-psy-blue hover:underline"
          >
            <ArrowLeft size={16} />
            Volver a casos
          </Link>
        </div>
        <Breadcrumbs />
        <h1 className="font-serif text-4xl font-bold text-psy-ink mt-4">Registrar Caso Clínico</h1>
        <p className="text-psy-muted mt-2">Documenta un caso cerrado exitosamente para alimentar la IA</p>
      </div>

      <form action={action} className="space-y-6 bg-psy-paper border border-psy-border rounded-2xl p-8">

        {/* Título */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-psy-ink">Título del caso</label>
          <input
            type="text"
            name="title"
            placeholder="Ej: Fobia social — tratamiento cognitivo-conductual exitoso"
            required
            className="w-full h-11 rounded-lg border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink placeholder:text-psy-muted/60 focus:border-psy-blue focus:ring-2 focus:ring-psy-blue/25 outline-none"
          />
          {state.errors?.title && <p className="text-xs text-psy-red">{state.errors.title}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-psy-ink">Descripción breve</label>
          <textarea
            name="description"
            placeholder="Resumen del caso y cómo fue tratado"
            rows={4}
            required
            className="w-full rounded-lg border border-psy-border bg-psy-cream px-4 py-3 text-sm text-psy-ink placeholder:text-psy-muted/60 focus:border-psy-blue focus:ring-2 focus:ring-psy-blue/25 outline-none resize-none"
          />
          {state.errors?.description && <p className="text-xs text-psy-red">{state.errors.description}</p>}
        </div>

        {/* Sesiones */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-psy-ink">Número de sesiones</label>
          <input
            type="number"
            name="sessions_count"
            placeholder="8"
            min="1"
            required
            className="w-full h-11 rounded-lg border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink placeholder:text-psy-muted/60 focus:border-psy-blue focus:ring-2 focus:ring-psy-blue/25 outline-none"
          />
        </div>

        {/* Resultado */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-psy-ink">Resultado del tratamiento</label>
          <select
            name="outcome"
            required
            className="w-full h-11 rounded-lg border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink focus:border-psy-blue focus:ring-2 focus:ring-psy-blue/25 outline-none"
          >
            <option value="">— Selecciona un resultado —</option>
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {state.errors?.outcome && <p className="text-xs text-psy-red">{state.errors.outcome}</p>}
        </div>

        {/* Intervenciones */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-psy-ink">Intervenciones utilizadas</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {INTERVENTIONS.map((intervention) => (
              <label key={intervention} className="flex items-center gap-2 p-3 border border-psy-border rounded-lg hover:bg-psy-cream/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="interventions"
                  value={intervention}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInterventions([...selectedInterventions, intervention]);
                    } else {
                      setSelectedInterventions(selectedInterventions.filter(i => i !== intervention));
                    }
                  }}
                  className="w-4 h-4 rounded border-psy-border text-psy-blue focus:ring-psy-blue/25"
                />
                <span className="text-sm text-psy-ink">{intervention}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="interventions_json" value={JSON.stringify(selectedInterventions)} />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Link
            href="/cases"
            className="flex h-11 items-center justify-center rounded-lg border border-psy-border bg-psy-paper px-6 text-sm font-medium text-psy-ink transition-colors hover:bg-psy-cream"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-psy-blue px-6 text-sm font-medium text-white transition-colors hover:bg-psy-blue/90 disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar caso"}
          </button>
        </div>

        {state.error && <p className="text-sm text-psy-red bg-psy-red/5 p-3 rounded-lg">{state.error}</p>}
      </form>
    </div>
  );
}
