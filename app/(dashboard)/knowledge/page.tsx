import { createClient } from '@/lib/supabase/server'
import { BookOpen, FileText, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'
import { KnowledgeGroupCard } from '@/components/knowledge/KnowledgeGroupCard'
import { PersonalLibrary } from '@/components/knowledge/PersonalLibrary'
import { KnowledgeTabs } from '@/components/knowledge/KnowledgeTabs'
import {
  PortalHero,
  PortalPage,
  PortalSection,
  PortalStatGrid,
} from '@/components/ui/portal-layout'

interface RawGroup {
  id: string
  slug: string
  name: string
  description: string
  color: string
  book_count: number
}

export default async function KnowledgePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: allGroups },
    { data: activeGroupRows },
    { data: personalDocuments },
  ] = await Promise.all([
    supabase
      .from('knowledge_groups')
      .select('id, slug, name, description, color, book_count')
      .order('name'),
    supabase
      .from('psychologist_knowledge_groups')
      .select('group_id, is_active')
      .eq('psychologist_id', user!.id),
    supabase
      .from('knowledge_documents')
      .select(
        'id, title, author, category, chunk_count, processing_status, uploaded_at, file_size_bytes, ai_classification, personal_label, group_id, source_type'
      )
      .eq('psychologist_id', user!.id)
      .order('uploaded_at', { ascending: false }),
  ])

  const activeMap = new Map((activeGroupRows ?? []).map(row => [row.group_id, row.is_active]))

  const groups = (allGroups ?? []).map(group => ({
    ...group,
    is_active: activeMap.get(group.id) ?? false,
  }))

  const totalSystemBooks = groups.reduce((acc, group) => acc + (group.book_count ?? 0), 0)
  const activeGroupsCount = groups.filter(group => group.is_active).length
  const personalReady =
    (personalDocuments ?? []).filter(document => document.processing_status === 'ready').length ?? 0

  return (
    <PortalPage>
      <div className="space-y-6">
        <PortalHero
          eyebrow="Unidad de conocimiento"
          title="Biblioteca clinica"
          description={
            <p>
              Nuestra IA razona consultando <span className="font-semibold text-psy-ink">libros de referencia y tus propios documentos</span>, con una capa mas clara para activar enfoques y subir material propio.
            </p>
          }
          actions={[
            {
              href: '/knowledge/upload',
              label: 'Subir documento',
              icon: <Upload size={16} strokeWidth={2.2} />,
            },
            {
              href: '/sessions/new',
              label: 'Ir a sesion',
              variant: 'secondary',
            },
          ]}
          aside={
            <div className="rounded-[1.8rem] border border-psy-ink/8 bg-psy-ink p-5 text-white shadow-xl shadow-psy-ink/18">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Biblioteca activa</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                {activeGroupsCount} enfoque{activeGroupsCount === 1 ? '' : 's'} conectado{activeGroupsCount === 1 ? '' : 's'}.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Activa solo los enfoques que realmente utilizas para mantener la respuesta de IA mas acotada y mas defendible clinicamente.
              </p>
            </div>
          }
        />

        <PortalStatGrid
          stats={[
            { label: 'Libros base', value: totalSystemBooks, hint: 'catalogo del sistema', accent: 'blue' },
            { label: 'Enfoques activos', value: activeGroupsCount, hint: 'consultados por IA', accent: 'green' },
            { label: 'Tus documentos listos', value: personalReady, hint: 'procesados y citables', accent: 'amber' },
            { label: 'Documentos propios', value: personalDocuments?.length ?? 0, hint: 'subidos por ti', accent: 'ink' },
          ]}
        />

        <PortalSection eyebrow="Razonamiento asistido" title="Base bibliografica y material propio">
          <KnowledgeTabs
            baseTab={
              <div className="space-y-3">
                <p className="text-sm leading-7 text-psy-muted">
                  Activa los enfoques clinicos que usas en tu practica. La IA solo consultara los grupos activos dentro de tu flujo de analisis.
                </p>
                <div className="grid gap-3">
                  {groups.map(group => (
                    <KnowledgeGroupCard
                      key={group.id}
                      group={group as Parameters<typeof KnowledgeGroupCard>[0]['group']}
                    />
                  ))}
                </div>
              </div>
            }
            personalTab={
              <PersonalLibrary
                initialDocuments={personalDocuments ?? []}
                groups={((allGroups as RawGroup[] | null) ?? []).map(group => ({
                  id: group.id,
                  slug: group.slug,
                  name: group.name,
                }))}
              />
            }
          />
        </PortalSection>

        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: 'Enfoques activos',
              copy: 'Deja visibles solo las corrientes que forman parte de tu práctica para evitar citas o marcos que no vas a usar.',
              icon: BookOpen,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
            {
              title: 'Documentos propios',
              copy: 'Protocolos, notas estructuradas y materiales internos deben complementar la base teórica, no competir con ella.',
              icon: FileText,
              accent: 'bg-psy-amber-light text-psy-amber',
            },
            {
              title: 'Uso en sesión',
              copy: 'La utilidad real aquí es saber con rapidez qué conocimiento está disponible antes de cerrar una lectura o generar un informe.',
              icon: Sparkles,
              accent: 'bg-psy-blue-light text-psy-blue',
            },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5" style={{ borderColor: 'var(--psy-warm-border)' }}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}>
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-psy-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-psy-muted">{item.copy}</p>
              </div>
            )
          })}
        </div>
      </div>
    </PortalPage>
  )
}
