import { createClient } from "@/lib/supabase/server";
import { BookOpen, FileText, CheckCircle, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { KnowledgeGroupCard } from "@/components/knowledge/KnowledgeGroupCard";
import { PersonalLibrary } from "@/components/knowledge/PersonalLibrary";
import { KnowledgeTabs } from "@/components/knowledge/KnowledgeTabs";

interface RawGroup {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  book_count: number;
}

interface RawDocument {
  id: string;
  title: string;
  author: string | null;
  category: string;
  chunk_count: number | null;
  processing_status: string;
  uploaded_at: string;
  file_size_bytes: number | null;
  ai_classification: { confidence: string; reasoning: string } | null;
  personal_label: string | null;
  group_id: string | null;
}

export default async function KnowledgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: allGroups },
    { data: activeGroupRows },
    { data: personalDocuments },
  ] = await Promise.all([
    supabase.from("knowledge_groups").select("id, slug, name, description, color, book_count").order("name"),
    supabase.from("psychologist_knowledge_groups").select("group_id, is_active").eq("psychologist_id", user!.id),
    supabase
      .from("knowledge_documents")
      .select("id, title, author, category, chunk_count, processing_status, uploaded_at, file_size_bytes, ai_classification, personal_label, group_id, source_type")
      .eq("psychologist_id", user!.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  const activeMap = new Map(
    (activeGroupRows ?? []).map((r) => [r.group_id, r.is_active])
  );

  const groups = (allGroups ?? []).map((g) => ({
    ...g,
    is_active: activeMap.get(g.id) ?? false,
  }));

  const totalSystemBooks = groups.reduce((acc, g) => acc + (g.book_count ?? 0), 0);
  const activeGroupsCount = groups.filter((g) => g.is_active).length;
  const personalReady = (personalDocuments ?? []).filter((d) => d.processing_status === "ready").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <Breadcrumbs />
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-psy-blue/10 text-psy-blue">
              <BookOpen size={18} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-psy-blue font-bold">
              Unidad de Conocimiento
            </p>
          </div>
          <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Biblioteca Clínica</h1>
          <p className="text-base text-psy-ink/60 mt-3 max-w-2xl leading-relaxed">
            Nuestra IA razona consultando <span className="text-psy-ink font-semibold">libros de referencia y tus propios documentos</span>, citando autor y página en cada análisis automatizado.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-psy-border rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-psy-cream flex items-center justify-center text-psy-muted">
              <BookOpen size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-psy-muted">Libros Base</span>
          </div>
          <p className="font-sora text-3xl font-bold text-psy-ink">{totalSystemBooks}</p>
        </div>
        <div className="bg-white border border-psy-border rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-psy-blue/5 flex items-center justify-center text-psy-blue">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-psy-muted">Enfoques</span>
          </div>
          <p className="font-sora text-3xl font-bold text-psy-ink">{activeGroupsCount}</p>
        </div>
        <div className="bg-white border border-psy-border rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-psy-cream flex items-center justify-center text-psy-muted">
              <FileText size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-psy-muted">Tus Docs</span>
          </div>
          <p className="font-sora text-3xl font-bold text-psy-ink">{personalReady}</p>
        </div>
      </div>

      {/* Tabs */}
      <KnowledgeTabs
        baseTab={
          <div className="space-y-2">
            <p className="text-xs text-psy-muted mb-3">
              Activa los enfoques clínicos que usas en tu práctica. La IA solo consultará los grupos activos.
            </p>
            <div className="grid gap-2">
              {groups.map((group) => (
                <KnowledgeGroupCard key={group.id} group={group as Parameters<typeof KnowledgeGroupCard>[0]["group"]} />
              ))}
            </div>
          </div>
        }
        personalTab={
          <PersonalLibrary
            initialDocuments={personalDocuments ?? []}
            groups={(allGroups as RawGroup[] ?? []).map((g) => ({ id: g.id, slug: g.slug, name: g.name }))}
          />
        }
      />
    </div>
  );
}
