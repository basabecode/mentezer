"use client";

import { useState } from "react";
import { generateReferralDraft } from "@/lib/referrals/actions";
import { Loader2, Sparkles, Send, Download, CheckCircle, RotateCcw, Mail } from "lucide-react";

type Step = "form" | "review" | "done";

export function ReferralGenerator({ patientId }: { patientId: string }) {
  const [step, setStep] = useState<Step>("form");
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    try {
      const result = await generateReferralDraft(patientId, specialty, reason, recipientName);
      setReferralId(result.id);
      setDraft(result.draft);
      setStep("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al generar el borrador.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!referralId || !draft.trim()) return;
    setIsSending(true);
    setError("");
    try {
      const res = await fetch("/api/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, approvedContent: draft, recipientEmail: recipientEmail.trim() || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al aprobar el informe");
      setPdfUrl(data.pdfUrl);
      setEmailSent(data.emailSent);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setStep("form"); setSpecialty(""); setReason(""); setRecipientName("");
    setRecipientEmail(""); setDraft(""); setReferralId(null);
    setPdfUrl(null); setEmailSent(false); setError("");
  };

  if (step === "done") {
    return (
      <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--psy-green-light)] flex items-center justify-center">
            <CheckCircle size={18} className="text-[var(--psy-green)]" />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-[var(--psy-ink)]">Informe aprobado</p>
            <p className="text-xs text-[var(--psy-muted)]">
              {emailSent ? "PDF generado y email enviado al especialista." : "PDF generado. Descárgalo o envíalo manualmente."}
            </p>
          </div>
        </div>
        {emailSent && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--psy-green-light)] rounded-lg">
            <Mail size={13} className="text-[var(--psy-green)]" />
            <p className="text-xs text-[var(--psy-green)] font-medium">Email enviado a {recipientEmail}</p>
          </div>
        )}
        <div className="flex gap-2">
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--psy-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--psy-blue)]/90 transition-colors">
              <Download size={14} /> Descargar PDF
            </a>
          )}
          <button onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--psy-border)] rounded-lg text-sm text-[var(--psy-muted)] hover:text-[var(--psy-ink)] transition-colors">
            <RotateCcw size={13} /> Nuevo informe
          </button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-serif text-base font-semibold text-[var(--psy-ink)] mb-0.5">Revisar borrador</h3>
          <p className="text-xs text-[var(--psy-muted)]">Edita el texto antes de aprobar. Los cambios quedan en el PDF final.</p>
        </div>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={14}
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--psy-border)] bg-white text-[var(--psy-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/20 resize-y font-sans leading-relaxed" />
        <div>
          <label className="block text-xs font-medium text-[var(--psy-ink)] mb-1">
            Email del especialista <span className="text-[var(--psy-muted)] font-normal">(opcional)</span>
          </label>
          <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="especialista@clinica.com"
            className="w-full px-3 py-2 rounded-lg border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/20" />
        </div>
        {error && <p className="text-xs text-[var(--psy-red)] bg-[var(--psy-red-light)] px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button onClick={() => setStep("form")} disabled={isSending}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[var(--psy-border)] rounded-lg text-sm text-[var(--psy-muted)] hover:text-[var(--psy-ink)] transition-colors disabled:opacity-40">
            <RotateCcw size={13} /> Regenerar
          </button>
          <button onClick={handleApprove} disabled={isSending || !draft.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--psy-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--psy-blue)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {isSending ? <><Loader2 size={14} className="animate-spin" /> Generando PDF...</>
              : recipientEmail ? <><Send size={14} /> Aprobar y enviar</>
              : <><Download size={14} /> Aprobar y guardar PDF</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-xl p-6 space-y-4">
      <div>
        <h3 className="font-serif text-base font-semibold text-[var(--psy-ink)] mb-0.5">Generar informe de derivación</h3>
        <p className="text-xs text-[var(--psy-muted)]">Claude redacta la carta basándose en el historial clínico del paciente.</p>
      </div>
      {error && <p className="text-xs text-[var(--psy-red)] bg-[var(--psy-red-light)] px-3 py-2 rounded-lg">{error}</p>}
      <form onSubmit={handleGenerate} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--psy-ink)] mb-1">Especialidad a derivar *</label>
          <input type="text" required placeholder="Ej: Psiquiatría, Neurología, Nutrición..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/20"
            value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--psy-ink)] mb-1">
            Nombre del especialista <span className="text-[var(--psy-muted)] font-normal">(opcional)</span>
          </label>
          <input type="text" placeholder="Ej: Dr. Carlos Ramírez"
            className="w-full px-3 py-2 rounded-lg border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/20"
            value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--psy-ink)] mb-1">Motivo de derivación *</label>
          <textarea required rows={3} placeholder="Ej: Paciente presenta insomnio refractario. Solicito valoración farmacológica..."
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/20 resize-none"
            value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button type="submit" disabled={isGenerating || !specialty || !reason}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--psy-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--psy-blue)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Redactando carta...</>
            : <><Sparkles size={14} /> Generar carta de derivación</>}
        </button>
        <p className="text-center text-[10px] text-[var(--psy-muted)]">El borrador es editable antes de aprobar y generar el PDF.</p>
      </form>
    </div>
  );
}
