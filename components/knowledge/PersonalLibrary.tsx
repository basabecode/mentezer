"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, BookOpen, CheckCircle, Clock, AlertCircle, ChevronDown, X } from "lucide-react";

type AiClassification = { confidence?: string; reasoning?: string } | null;

interface KnowledgeDocument {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  chunk_count: number | null;
  processing_status: string;
  uploaded_at: string;
  file_size_bytes: number | null;
  ai_classification: AiClassification | unknown;
  personal_label: string | null;
  group_id: string | null;
  source_type?: string;
}

interface KnowledgeGroup {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  initialDocuments: KnowledgeDocument[];
  groups: KnowledgeGroup[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ready:      { label: "Indexado",    color: "text-psy-green" },
  processing: { label: "Procesando", color: "text-psy-amber" },
  pending:    { label: "Pendiente",  color: "text-psy-muted" },
  error:      { label: "Error",      color: "text-psy-red" },
};

function StatusIcon({ status }: { status: string }) {
  if (status === "ready")      return <CheckCircle size={12} />;
  if (status === "error")      return <AlertCircle size={12} />;
  return <Clock size={12} />;
}

function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging
          ? "border-psy-blue bg-psy-blue-light"
          : "border-psy-border bg-psy-paper hover:border-psy-blue/50 hover:bg-psy-blue-light/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
      />
      <Upload size={24} className="mx-auto mb-3 text-psy-blue" />
      <p className="text-sm font-medium text-psy-ink">
        Arrastra un PDF o haz clic para seleccionar
      </p>
      <p className="text-xs text-psy-muted mt-1">PDF o TXT · máx 50 MB</p>
    </div>
  );
}

function ProcessingProgress({ status }: { status: string }) {
  const steps = ["Extrayendo texto", "Clasificando", "Generando embeddings", "Listo"];
  const currentStep = status === "ready" ? 3 : status === "processing" ? 1 : status === "error" ? -1 : 0;

  if (status === "ready" || status === "error") return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      {steps.slice(0, 3).map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={`h-1 rounded-full transition-all ${
              i <= currentStep ? "bg-psy-blue w-8" : "bg-psy-border w-4"
            }`}
          />
          {i < 2 && <div className="w-px h-2 bg-psy-border" />}
        </div>
      ))}
      <span className="text-xs text-psy-muted ml-1">{steps[currentStep] ?? "Procesando"}...</span>
    </div>
  );
}

export function PersonalLibrary({ initialDocuments, groups }: Props) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Polling para documentos en procesamiento
  useEffect(() => {
    const processingDocs = documents.filter((d) => d.processing_status === "processing");
    if (processingDocs.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of processingDocs) {
        try {
          const res = await fetch(`/api/knowledge/${doc.id}/status`);
          if (!res.ok) continue;
          const { data } = await res.json();
          if (data.processing_status !== doc.processing_status) {
            setDocuments((prev) =>
              prev.map((d) => (d.id === doc.id ? { ...d, ...data } : d))
            );
          }
        } catch {
          // ignorar errores de polling
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^.]+$/, "").replace(/_/g, " "));

    try {
      const res = await fetch("/api/knowledge/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error ?? "Error al subir el archivo");
        return;
      }

      const newDoc: KnowledgeDocument = {
        id: json.data.id,
        title: json.data.title,
        author: null,
        category: "Clasificando...",
        chunk_count: null,
        processing_status: "processing",
        uploaded_at: new Date().toISOString(),
        file_size_bytes: file.size,
        ai_classification: null,
        personal_label: null,
        group_id: null,
      };
      setDocuments((prev) => [newDoc, ...prev]);
    } catch {
      setUploadError("Error de conexión al subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  async function handleGroupChange(docId: string, groupId: string | null) {
    const res = await fetch(`/api/knowledge/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...data } : d)));
    }
  }

  return (
    <div className="space-y-4">
      {uploading ? (
        <div className="border-2 border-dashed border-psy-blue rounded-xl p-8 text-center bg-psy-blue-light/30">
          <Clock size={24} className="mx-auto mb-3 text-psy-blue animate-pulse" />
          <p className="text-sm text-psy-blue font-medium">Subiendo documento...</p>
        </div>
      ) : (
        <UploadZone onUpload={handleUpload} />
      )}

      {uploadError && (
        <div className="flex items-center justify-between p-3 bg-psy-red/10 border border-psy-red/20 rounded-lg">
          <p className="text-sm text-psy-red">{uploadError}</p>
          <button onClick={() => setUploadError(null)}>
            <X size={14} className="text-psy-red" />
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={32} className="mx-auto mb-3 text-psy-muted" />
          <p className="text-sm text-psy-muted">
            Sube tus libros, investigaciones o protocolos personales.
            La IA los usará como referencia exclusiva para ti.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const status = STATUS_LABEL[doc.processing_status] ?? STATUS_LABEL.pending;
            const sizeKb = doc.file_size_bytes ? Math.round(doc.file_size_bytes / 1024) : null;
            const currentGroup = groups.find((g) => g.id === doc.group_id);

            return (
            <div key={doc.id} className="rounded-xl border border-psy-border bg-psy-paper p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-psy-blue-light flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen size={14} className="text-psy-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-psy-ink truncate">{doc.title}</p>
                      <p className="text-xs text-psy-muted mt-0.5">
                        {sizeKb ? `${sizeKb} KB` : ""}
                        {doc.chunk_count ? ` · ${doc.chunk_count} frags.` : ""}
                      </p>
                      <ProcessingProgress status={doc.processing_status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 max-sm:justify-between">
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon status={doc.processing_status} />
                      <span className="text-xs">{status.label}</span>
                    </div>
                  </div>
                </div>

                {doc.processing_status === "ready" && (
                  <div className="mt-3 pt-3 border-t border-psy-border">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-psy-muted mb-1">Grupo asignado por IA</p>
                        <p className="text-xs text-psy-ink font-medium">
                          {currentGroup?.name ?? doc.personal_label ?? doc.category ?? "Sin clasificar"}
                          {(doc.ai_classification as AiClassification)?.confidence && (
                            <span className="ml-1 text-psy-muted font-normal">
                              ({(doc.ai_classification as AiClassification)?.confidence})
                            </span>
                          )}
                        </p>
                        {(doc.ai_classification as AiClassification)?.reasoning && (
                          <p className="text-xs text-psy-muted mt-0.5">{(doc.ai_classification as AiClassification)?.reasoning}</p>
                        )}
                      </div>

                      <GroupSelector
                        groups={groups}
                        currentGroupId={doc.group_id}
                        onSelect={(gid) => handleGroupChange(doc.id, gid)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GroupSelector({
  groups,
  currentGroupId,
  onSelect,
}: {
  groups: KnowledgeGroup[];
  currentGroupId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-psy-border bg-psy-cream px-2 py-2 text-xs transition-colors hover:border-psy-blue/50 sm:w-auto"
      >
        Corregir
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-10 w-52 bg-white border border-psy-border rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => { onSelect(g.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-psy-cream transition-colors ${
                  g.id === currentGroupId ? "text-psy-blue font-medium" : "text-psy-ink"
                }`}
              >
                {g.name}
              </button>
            ))}
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-psy-muted hover:bg-psy-cream transition-colors border-t border-psy-border"
            >
              Mantener en biblioteca personal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
