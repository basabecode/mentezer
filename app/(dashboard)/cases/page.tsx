import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Archive, TrendingUp, TrendingDown, Minus } from "lucide-react";

const OUTCOME_CONFIG = {
  successful: { label: "Remisión de síntomas", icon: TrendingUp,   color: "text-psy-green",  bg: "bg-psy-green/5" },
  partial:    { label: "Cumplimiento parcial", icon: Minus,        color: "text-psy-amber",  bg: "bg-psy-amber/5" },
  failed:     { label: "Sin mejoría",           icon: TrendingDown, color: "text-psy-red",    bg: "bg-psy-red/5" },
} as const;

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from("clinical_cases")
    .select("id, title, description, outcome, sessions_count, interventions_used, created_at")
    .eq("psychologist_id", user!.id)
    .order("created_at", { ascending: false });

  const successCount = cases?.filter(c => c.outcome === "successful").length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Casos de Éxito</h1>
            <p className="text-base text-psy-ink/60 mt-3 max-w-2xl leading-relaxed">
              Casos clínicos cerrados que alimentan nuestra <span className="text-psy-blue font-bold">Unidad de Inteligencia</span> para asistir en diagnósticos futuros.
            </p>
          </div>
          <Link
            href="/cases/new"
            className="lift-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-psy-blue px-6 text-sm font-bold text-white shadow-xl shadow-psy-blue/20 transition-all shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Nuevo caso clínico
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Casos totales", value: cases?.length ?? 0 },
          { label: "Tasa de remisión", value: cases?.length ? `${Math.round((successCount / cases.length) * 100)}%` : "0%" },
          { label: "Vectores Clínicos", value: cases?.filter(c => c.outcome !== "failed").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-psy-muted block mb-2">{label}</span>
            <p className="font-sora text-3xl font-bold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de casos */}
      {cases && cases.length > 0 ? (
      <div className="grid gap-4">
        {cases.map((c: any) => {
          const outcomeKey = c.outcome as keyof typeof OUTCOME_CONFIG;
          const outcome = OUTCOME_CONFIG[outcomeKey] ?? OUTCOME_CONFIG.partial;
          const OutcomeIcon = outcome.icon;
          const interventions = Array.isArray(c.interventions_used) ? c.interventions_used : [];

          return (
            <div
              key={c.id}
              className="group p-6 bg-psy-paper border border-psy-border rounded-2xl hover:border-psy-blue/30 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-psy-ink tracking-tight mb-1">{c.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-psy-muted uppercase tracking-wider">
                      ID: {c.id.split('-')[0]}
                    </span>
                    <span className="text-psy-border">•</span>
                    <span className="text-[11px] font-bold text-psy-muted">
                      {new Date(c.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
                    </span>
                  </div>
                </div>
                <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shrink-0", outcome.bg, outcome.color.replace('text-', 'border-').replace('ink', 'border'))}>
                  <OutcomeIcon size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">{outcome.label}</span>
                </div>
              </div>
              
              <p className="text-sm text-psy-ink/60 leading-relaxed line-clamp-2 mb-6 italic">
                "{c.description}"
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-psy-cream px-3 py-1 rounded-lg text-[11px] font-bold text-psy-ink/50 border border-psy-border">
                  {c.sessions_count} SESIONES REGISTRADAS
                </div>
                {interventions.map((int: string, i: number) => (
                   <div key={i} className="bg-psy-blue/5 px-3 py-1 rounded-lg text-[11px] font-bold text-psy-blue border border-psy-blue/10">
                     {int.toUpperCase()}
                   </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-psy-green-light flex items-center justify-center mb-4">
            <Archive size={24} className="text-psy-green" />
          </div>
          <h2 className="font-serif text-lg text-psy-ink font-semibold mb-2">Sin casos registrados</h2>
          <p className="text-sm text-psy-muted max-w-sm leading-relaxed mb-6">
            Registra casos clínicos cerrados exitosamente. La IA los usará como referencia para encontrar similitudes con pacientes nuevos.
          </p>
          <Link
            href="/cases/new"
            className="px-5 py-2.5 bg-psy-green text-white rounded-lg text-sm font-medium hover:bg-psy-green/90 transition-colors"
          >
            Registrar primer caso
          </Link>
        </div>
      )}
    </div>
  );
}
