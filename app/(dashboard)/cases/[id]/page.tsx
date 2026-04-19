import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

const OUTCOME_CONFIG = {
  successful: { label: "Remisión de síntomas", icon: TrendingUp, color: "text-psy-green", bg: "bg-psy-green/5" },
  partial: { label: "Cumplimiento parcial", icon: Minus, color: "text-psy-amber", bg: "bg-psy-amber/5" },
  failed: { label: "Sin mejoría", icon: TrendingDown, color: "text-psy-red", bg: "bg-psy-red/5" },
} as const;

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caseData } = await supabase
    .from("clinical_cases")
    .select("*")
    .eq("id", id)
    .eq("psychologist_id", user!.id)
    .single();

  if (!caseData) notFound();

  const outcomeKey = caseData.outcome as keyof typeof OUTCOME_CONFIG;
  const outcome = OUTCOME_CONFIG[outcomeKey] ?? OUTCOME_CONFIG.partial;
  const OutcomeIcon = outcome.icon;
  const interventions = Array.isArray(caseData.interventions_used) ? caseData.interventions_used : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs />
        <div className="flex items-start justify-between gap-4 mt-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/cases"
                className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
            </div>
            <h1 className="font-sora text-4xl md:text-5xl font-bold tracking-tight text-psy-ink">
              {caseData.title}
            </h1>
            <p className="mt-3 text-base text-psy-ink/60 max-w-2xl leading-relaxed">
              "{caseData.description}"
            </p>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border shrink-0", outcome.bg)}>
            <OutcomeIcon size={16} className={outcome.color} />
            <span className={cn("text-sm font-bold uppercase tracking-wide", outcome.color)}>
              {outcome.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-psy-paper border border-psy-border rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-psy-muted block mb-2">
            Sesiones registradas
          </span>
          <p className="font-sora text-3xl font-bold text-psy-ink">{caseData.sessions_count || 0}</p>
        </div>

        <div className="bg-psy-paper border border-psy-border rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-psy-muted block mb-2">
            Resultado
          </span>
          <p className={cn("font-sora text-2xl font-bold", outcome.color)}>
            {outcome.label}
          </p>
        </div>

        <div className="bg-psy-paper border border-psy-border rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-psy-muted block mb-2">
            Creado
          </span>
          <p className="font-mono text-sm text-psy-ink font-bold">
            {new Date(caseData.created_at).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Intervenciones */}
      {interventions && interventions.length > 0 && (
        <div className="mb-10">
          <h2 className="font-sora text-2xl font-bold tracking-tight text-psy-ink mb-4">
            Intervenciones aplicadas
          </h2>
          <div className="flex flex-wrap gap-2">
            {(interventions as string[]).map((intervention, i: number) => (
              <div
                key={i}
                className="bg-psy-blue/5 border border-psy-blue/20 px-4 py-2 rounded-full text-sm font-medium text-psy-blue"
              >
                {intervention}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalles adicionales */}
      <div className="bg-psy-cream/30 border border-psy-border rounded-2xl p-6">
        <h2 className="font-sora text-lg font-bold tracking-tight text-psy-ink mb-4">
          Información del caso
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-psy-muted">ID del caso:</span>
            <span className="font-mono text-psy-ink">{id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-psy-muted">Fecha de creación:</span>
            <span className="text-psy-ink">
              {new Date(caseData.created_at).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex gap-3">
        <Link
          href="/cases"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-psy-paper border border-psy-border text-psy-ink font-medium transition hover:bg-psy-cream"
        >
          Volver a casos
        </Link>
      </div>
    </div>
  );
}
