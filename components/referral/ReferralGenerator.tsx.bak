"use client";

import { useState } from "react";
import { generateReferralDraft } from "@/lib/referrals/actions";
import { FileText, Loader2, Sparkles, Send } from "lucide-react";

export function ReferralGenerator({ patientId }: { patientId: string }) {
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState<{ id: string; draft: string } | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    
    try {
      const result = await generateReferralDraft(patientId, specialty, reason);
      setDraftResult(result);
    } catch (err: any) {
      setError(err.message || "Error al generar el borrador. Intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (draftResult) {
    return (
      <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-6">
        <h3 className="font-serif text-lg text-psy-ink mb-4 flex items-center gap-2">
          <FileText size={18} className="text-psy-blue" />
          Borrador Generado
        </h3>
        
        <div className="bg-white border rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm text-psy-ink h-96 overflow-y-auto font-sans shadow-inner">
          {draftResult.draft}
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setDraftResult(null)}
            className="px-4 py-2 text-sm text-psy-muted hover:text-psy-ink transition-colors"
          >
            Descartar y Rehacer
          </button>
          <button 
             className="px-4 py-2 text-sm bg-psy-blue text-white rounded-lg flex items-center gap-2 hover:bg-psy-blue/90"
             onClick={() => alert("Pendiente de implementar: Generar PDF y enviar.")}
          >
            <Send size={14} />
            Aprobar y Preparar Envío
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-psy-paper border border-[var(--border)] rounded-xl p-6">
      <h3 className="font-serif text-lg text-psy-ink mb-2">Generar Informe de Derivación</h3>
      <p className="text-sm text-psy-muted mb-6">
        Usa la Inteligencia Artificial (Claude) para redactar un informe clínico profesional basándose en el historial del paciente y su plan terapéutico.
      </p>

      {error && (
        <div className="bg-psy-red-light text-psy-red p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1">
            Especialidad a derivar
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Psiquiatría infantil, Neurología, Nutrición..."
            className="w-full p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-psy-blue/20"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1">
            Motivo específico de derivación
          </label>
          <textarea
            required
            rows={3}
            placeholder="Ej: Paciente presenta insomnio refractario de 3 semanas de evolución, solicito valoración farmacológica..."
            className="w-full p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-psy-blue/20"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !specialty || !reason}
          className="w-full bg-psy-blue text-white p-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-psy-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Redactando informe...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar Carta de Derivación
            </>
          )}
        </button>
        <p className="text-center text-xs text-psy-muted">
          El informe es un borrador. Podrás revisarlo antes de firmarlo.
        </p>
      </form>
    </div>
  );
}
