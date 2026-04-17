import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  ready:      { label: "Listo",       icon: CheckCircle, color: "text-psy-green" },
  processing: { label: "Procesando",  icon: Clock,       color: "text-psy-amber" },
  pending:    { label: "Pendiente",   icon: Clock,       color: "text-psy-muted" },
  error:      { label: "Error",       icon: AlertCircle, color: "text-psy-red" },
};

export default async function KnowledgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from("knowledge_documents")
    .select("id, title, author, category, chunk_count, processing_status, uploaded_at, file_size_bytes")
    .eq("psychologist_id", user!.id)
    .order("uploaded_at", { ascending: false });

  const totalChunks = documents?.reduce((acc, d) => acc + (d.chunk_count ?? 0), 0) ?? 0;

  return (
    <div className="px-6 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Biblioteca clínica</h1>
          <p className="text-sm text-psy-muted mt-1">
            Tus libros y artículos clínicos — la IA razona con ellos en cada análisis de sesión.
          </p>
        </div>
        <Link
          href="/knowledge/upload"
          className="flex items-center gap-2 px-4 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
        >
          <Upload size={14} />
          Subir documento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Documentos", value: documents?.length ?? 0, icon: BookOpen },
          { label: "Fragmentos indexados", value: totalChunks, icon: FileText },
          { label: "Listos para IA", value: documents?.filter(d => d.processing_status === "ready").length ?? 0, icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-psy-paper border border-psy-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-psy-muted" />
              <span className="text-xs text-psy-muted">{label}</span>
            </div>
            <p className="font-mono text-xl font-semibold text-psy-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de documentos */}
      {documents && documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => {
            const status = STATUS_LABEL[doc.processing_status] ?? STATUS_LABEL.pending;
            const StatusIcon = status.icon;
            const sizeKb = doc.file_size_bytes ? Math.round(doc.file_size_bytes / 1024) : null;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-psy-paper border border-psy-border rounded-xl hover:bg-psy-cream transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-psy-blue-light flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-psy-blue" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-psy-ink truncate">{doc.title}</p>
                    <p className="text-xs text-psy-muted mt-0.5">
                      {doc.author ? `${doc.author} · ` : ""}
                      {doc.category ? `${doc.category} · ` : ""}
                      {sizeKb ? `${sizeKb} KB` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {doc.chunk_count != null && doc.chunk_count > 0 && (
                    <span className="text-xs text-psy-muted font-mono">{doc.chunk_count} frags.</span>
                  )}
                  <div className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={12} />
                    <span className="text-xs">{status.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-psy-blue-light flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-psy-blue" />
          </div>
          <h2 className="font-serif text-lg text-psy-ink font-semibold mb-2">Sin documentos aún</h2>
          <p className="text-sm text-psy-muted max-w-sm leading-relaxed mb-6">
            Sube tus libros clínicos en PDF. La IA los procesará y los usará como referencia en cada análisis de sesión, citando libro, autor y página.
          </p>
          <Link
            href="/knowledge/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 transition-colors"
          >
            <Upload size={14} />
            Subir primer documento
          </Link>
        </div>
      )}
    </div>
  );
}
