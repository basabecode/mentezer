import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Archive, TrendingUp, TrendingDown, Minus } from "lucide-react";

const OUTCOME_CONFIG = {
  successful: { label: "Exitoso",    icon: TrendingUp,   color: "text-psy-green",  bg: "bg-psy-green-light" },
  partial:    { label: "Parcial",    icon: Minus,        color: "text-psy-amber",  bg: "bg-psy-amber-light" },
  failed:     { label: "No logrado", icon: TrendingDown, color: "text-psy-red",    bg: "bg-psy-red-light" },
} as const;

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
    <div className="px-6 py-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Casos clínicos</h1>
          <p className="text-sm text-psy-muted mt-1">
            Casos cerrados que la IA usa como referencia para encontrar similitudes con pacientes actuales.
          </p>
        </div>
        <Link
          href="/cases/new"
          className="px-4 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
        >
          + Registrar caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total casos", value: cases?.length ?? 0 },
          { label: "Casos exitosos", value: successCount },
          { label: "Indexados para IA", value: cases?.filter(c => c.outcome !== "failed").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-xl p-4">
            <p className="text-xs text-psy-muted mb-1">{label}</p>
            <p className="font-mono text-xl font-semibold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de casos */}
      {cases && cases.length > 0 ? (
        <div className="space-y-2">
          {cases.map((c) => {
            const outcomeKey = c.outcome as keyof typeof OUTCOME_CONFIG;
            const outcome = OUTCOME_CONFIG[outcomeKey] ?? OUTCOME_CONFIG.partial;
            const OutcomeIcon = outcome.icon;
            const interventions = Array.isArray(c.interventions_used) ? c.interventions_used : [];

            return (
              <div
                key={c.id}
                className="p-4 bg-psy-paper border border-psy-border rounded-xl hover:bg-psy-cream transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-medium text-psy-ink">{c.title}</p>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${outcome.bg} shrink-0`}>
                    <OutcomeIcon size={11} className={outcome.color} />
                    <span className={`text-xs ${outcome.color} font-medium`}>{outcome.label}</span>
                  </div>
                </div>
                <p className="text-xs text-psy-muted line-clamp-2 leading-relaxed mb-3">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-psy-muted">
                  <span>{c.sessions_count} sesiones</span>
                  {interventions.length > 0 && (
                    <span>{interventions.length} intervenciones</span>
                  )}
                  <span>{new Date(c.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" })}</span>
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
