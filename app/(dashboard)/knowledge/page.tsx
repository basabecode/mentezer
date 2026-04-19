import { createClient } from "@/lib/supabase/server";
import { BookOpen, FileText, CheckCircle } from "lucide-react";
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
    <div className="px-6 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-psy-ink font-semibold">Biblioteca clínica</h1>
        <p className="text-sm text-psy-muted mt-1">
          La IA razona con tus libros y los cita por libro, autor y página en cada análisis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-psy-muted" />
            <span className="text-xs text-psy-muted">Libros base</span>
          </div>
          <p className="font-mono text-xl font-semibold text-psy-ink">{totalSystemBooks}</p>
        </div>
        <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-psy-muted" />
            <span className="text-xs text-psy-muted">Enfoques activos</span>
          </div>
          <p className="font-mono text-xl font-semibold text-psy-ink">{activeGroupsCount}</p>
        </div>
        <div className="bg-psy-paper border border-psy-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-psy-muted" />
            <span className="text-xs text-psy-muted">Mis documentos</span>
          </div>
          <p className="font-mono text-xl font-semibold text-psy-ink">{personalReady}</p>
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
