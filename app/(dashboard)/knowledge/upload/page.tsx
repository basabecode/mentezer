"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from "lucide-react";

type UploadState = "idle" | "uploading" | "done" | "error";

export default function KnowledgeUploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Selecciona un archivo y agrega el título.");
      return;
    }

    setState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("author", author.trim());
      formData.append("category", category.trim());

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al subir el documento");
      }

      setState("done");
      setTimeout(() => router.push("/knowledge"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setState("error");
    }
  };

  const isLoading = state === "uploading";

  return (
    <div className="px-6 py-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/knowledge" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-psy-ink font-semibold">Subir documento clínico</h1>
          <p className="text-xs text-psy-muted mt-0.5">PDF con texto seleccionable (no escaneado)</p>
        </div>
      </div>

      {state === "done" ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-psy-paper border border-psy-border rounded-xl">
          <CheckCircle size={32} className="text-psy-green mb-3" />
          <h2 className="font-serif text-lg text-psy-ink font-semibold mb-1">Documento subido</h2>
          <p className="text-xs text-psy-muted">Procesando embeddings en segundo plano...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? "border-psy-blue bg-psy-blue-light" : "border-psy-border hover:border-psy-blue/40 hover:bg-psy-paper"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={28} className="text-psy-blue" />
                <p className="text-sm font-medium text-psy-blue">{file.name}</p>
                <p className="text-xs text-psy-muted">{Math.round(file.size / 1024)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-psy-muted" />
                <p className="text-sm text-psy-ink font-medium">Arrastra o haz clic para seleccionar</p>
                <p className="text-xs text-psy-muted">PDF, TXT o Markdown — máximo 10 MB</p>
              </div>
            )}
          </div>

          {/* Campos */}
          <div>
            <label className="block text-xs font-medium text-psy-ink mb-1">Título del documento *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Manual Diagnóstico y Estadístico DSM-5"
              className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">Autor</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Ej: Aaron T. Beck"
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-psy-ink mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
              >
                <option value="">Sin categoría</option>
                <option value="diagnostico">Diagnóstico (DSM/CIE)</option>
                <option value="terapia-cognitiva">Terapia cognitiva</option>
                <option value="terapia-humanista">Terapia humanista</option>
                <option value="neuropsicologia">Neuropsicología</option>
                <option value="psicologia-clinica">Psicología clínica</option>
                <option value="evaluacion">Evaluación psicológica</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-psy-red bg-psy-red-light px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="p-3 bg-psy-blue-light rounded-lg">
            <p className="text-xs text-psy-blue leading-relaxed">
              El documento se dividirá en fragmentos y se generarán embeddings vectoriales. La IA citará libro, autor y página en cada análisis de sesión.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !file || !title}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Procesando documento...
              </>
            ) : (
              <>
                <Upload size={14} />
                Subir a biblioteca clínica
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
