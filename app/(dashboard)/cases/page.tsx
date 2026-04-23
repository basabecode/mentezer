import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Archive, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { GlossaryNote } from '@/components/ui/GlossaryNote'
import { CASES_GLOSSARY_ITEMS } from '@/lib/clinical-glossary'
import {
  PortalEmpty,
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

const OUTCOME_CONFIG = {
  successful: { label: 'Remision de sintomas', icon: TrendingUp, color: 'text-psy-green', bg: 'bg-psy-green-light' },
  partial: { label: 'Cumplimiento parcial', icon: Minus, color: 'text-psy-amber', bg: 'bg-psy-amber-light' },
  failed: { label: 'Sin mejoria', icon: TrendingDown, color: 'text-psy-red', bg: 'bg-psy-red-light' },
} as const

export default async function CasesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: cases } = await supabase
    .from('clinical_cases')
    .select('id, title, description, outcome, sessions_count, interventions_used, created_at')
    .eq('psychologist_id', user!.id)
    .order('created_at', { ascending: false })

  const successCount = cases?.filter(item => item.outcome === 'successful').length ?? 0
  const reusableVectors = cases?.filter(item => item.outcome !== 'failed').length ?? 0
  const successRate = cases?.length ? `${Math.round((successCount / cases.length) * 100)}%` : '0%'

  return (
    <PortalPage size="lg">
      <div className="space-y-6">
        <PortalHero
          eyebrow="Inteligencia clinica"
          title="Casos clinicos"
          description={
            <p>
              Casos cerrados con valor de referencia para leer patrones, intervenciones y resultados comparables sin convertirlos en marketing de “exito”.
            </p>
          }
          actions={[
            {
              href: '/cases/new',
              label: 'Nuevo caso clinico',
              icon: <Plus size={16} strokeWidth={2.3} />,
            },
            {
              href: '/reports',
              label: 'Ver informes',
              variant: 'secondary',
            },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-green/15 bg-psy-green-light/80 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-green">Tasa de remision</p>
              <p className="mt-3 font-sora text-5xl font-bold tracking-tight text-psy-ink">{successRate}</p>
              <p className="mt-3 text-sm leading-7 text-psy-muted">
                Casos con remision o avance clinico util para revisar decisiones, secuencia de intervenciones y patron de salida.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Casos totales', value: cases?.length ?? 0, hint: 'registrados', accent: 'blue' },
            { label: 'Tasa de remision', value: successRate, hint: 'casos exitosos', accent: 'green' },
            { label: 'Vectores clinicos', value: reusableVectors, hint: 'material reutilizable', accent: 'amber' },
            { label: 'Casos fallidos', value: (cases?.length ?? 0) - reusableVectors, hint: 'sin mejoria', accent: 'red' },
          ]}
        />

        <PortalSection eyebrow="Repositorio clinico" title="Casos registrados">
          {cases && cases.length > 0 ? (
            <div className="grid gap-4">
              {cases.map(item => {
                const outcomeKey = item.outcome as keyof typeof OUTCOME_CONFIG
                const outcome = OUTCOME_CONFIG[outcomeKey] ?? OUTCOME_CONFIG.partial
                const OutcomeIcon = outcome.icon
                const interventions = Array.isArray(item.interventions_used)
                  ? item.interventions_used.filter((value): value is string => typeof value === 'string')
                  : []

                return (
                  <div
                    key={item.id}
                    className="hover-panel group rounded-[1.75rem] border border-psy-border bg-white p-6"
                  >
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold tracking-tight text-psy-ink">{item.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-psy-muted">
                          <span>ID {item.id.split('-')[0]}</span>
                          <span>•</span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide', outcome.bg, outcome.color)}>
                        <OutcomeIcon size={14} />
                        {outcome.label}
                      </div>
                    </div>

                    <p className="mb-5 text-sm leading-7 text-psy-muted">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-psy-border bg-psy-cream px-3 py-1 text-[11px] font-bold text-psy-muted">
                        {item.sessions_count} sesiones registradas
                      </span>
                      {interventions.map((intervention: string, index: number) => (
                        <span
                          key={`${intervention}-${index}`}
                          className="rounded-lg border border-psy-blue/10 bg-psy-blue-light px-3 py-1 text-[11px] font-bold text-psy-blue"
                        >
                          {intervention.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <PortalEmpty
              title="Sin casos registrados"
              description="Registra casos clinicos cerrados exitosamente. La IA podra usarlos como referencia para encontrar similitudes con pacientes nuevos."
              action={
                <Link
                  href="/cases/new"
                  className="lift-button inline-flex items-center gap-2 rounded-2xl bg-psy-ink px-5 py-3 text-sm font-semibold text-white"
                >
                  <Archive size={16} />
                  Registrar primer caso
                </Link>
              }
            />
          )}
        </PortalSection>

        <PortalSection eyebrow="Referencia rapida" title="Glosario asociado">
          <GlossaryNote
            items={CASES_GLOSSARY_ITEMS}
            description="Referencia rapida para las siglas clinicas que aparecen en los casos registrados y en sus intervenciones."
          />
        </PortalSection>
      </div>
    </PortalPage>
  )
}


