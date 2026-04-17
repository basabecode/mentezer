"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Loader2 } from "lucide-react";

export function AnalyzeButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al analizar");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
        {loading ? "Analizando..." : "Analizar con IA"}
      </button>
      {error && <p className="text-xs text-psy-red">{error}</p>}
    </div>
  );
}
