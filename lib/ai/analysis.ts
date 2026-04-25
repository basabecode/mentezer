import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { searchAllKnowledge, searchSimilarCases } from "./rag";
import { CLINICAL_DISCLAIMER, CLINICAL_SYSTEM_PROMPT } from "./prompts/clinical-identity";
import { buildAnalysisPrompt, type AIReportData } from "./prompts/analysis-template";
import { buildPatientContextPrompt, type PreviousSessionContext } from "./prompts/context-builder";
import type { Database, Json } from "@/types/supabase";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Session = Database["public"]["Tables"]["sessions"]["Row"];
type AIReport = Database["public"]["Tables"]["ai_reports"]["Row"];
type TherapeuticPlan = Database["public"]["Tables"]["therapeutic_plans"]["Row"];

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export type { AIReportData };

export async function analyzeSession({
  sessionId,
  transcript,
  psychologistId,
  patientId,
  sessionMode,
}: {
  sessionId: string;
  transcript: string;
  psychologistId: string;
  patientId?: string;
  sessionMode?: string;
}): Promise<AIReportData> {
  const supabase = await createClient();

  const { patient, session, previousSessions, activePlan } = await loadClinicalContext({
    sessionId,
    psychologistId,
    patientId,
  });

  if (!patient.consent_signed_at) {
    throw new Error("Consentimiento informado requerido para generar analisis IA");
  }

  const currentSessionNumber = previousSessions.length + 1;
  const patientContextPrompt = buildPatientContextPrompt({
    patient,
    previousSessions,
    activePlan,
    currentSessionNumber,
  });

  const [{ base: knowledgeBase, personal: knowledgePersonal }, similarCases] = await Promise.all([
    searchAllKnowledge(transcript, psychologistId),
    searchSimilarCases(transcript.slice(0, 2000), psychologistId, 3),
  ]);

  const userPrompt = buildAnalysisPrompt({
    transcript,
    patientContextPrompt,
    knowledgeBase,
    knowledgePersonal,
    similarCases,
    sessionNumber: currentSessionNumber,
    sessionMode: sessionMode ?? session.mode,
  });

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    system: CLINICAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Respuesta inesperada de Claude");

  const reportData = parseReport(content.text);
  reportData.disclaimer = CLINICAL_DISCLAIMER;

  const { error: insertError } = await supabase.from("ai_reports").insert({
    session_id: sessionId,
    summary: reportData.summary,
    patterns: reportData.patterns as unknown as Json,
    diagnostic_hints: reportData.diagnostic_hints as unknown as Json,
    risk_signals: reportData.risk_signals as unknown as Json,
    similar_cases: reportData.similar_cases as unknown as Json,
    evolution_vs_previous: reportData.evolution_vs_previous,
    therapeutic_suggestions: reportData.therapeutic_suggestions as unknown as Json,
    disclaimer: CLINICAL_DISCLAIMER,
    model_used: "claude-sonnet-4-20250514",
  });

  if (insertError) {
    console.error("[AI ANALYSIS] Error saving report:", insertError);
    throw new Error("Error guardando el reporte de IA");
  }

  await supabase.from("audit_logs").insert({
    psychologist_id: psychologistId,
    action: "session.analyzed",
    resource_type: "session",
    resource_id: sessionId,
    metadata: {
      patient_id: patient.id,
      session_number: currentSessionNumber,
      model: "claude-sonnet-4-20250514",
      knowledge_base_chunks: knowledgeBase.length,
      knowledge_personal_chunks: knowledgePersonal.length,
      similar_cases_used: similarCases.length,
      high_risk: reportData.risk_signals.some(
        (signal) => signal.severity === "high" || signal.severity === "critical"
      ),
    } as Json,
  });

  await supabase
    .from("sessions")
    .update({ status: "complete" })
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId);

  return reportData;
}

async function loadClinicalContext({
  sessionId,
  psychologistId,
  patientId,
}: {
  sessionId: string;
  psychologistId: string;
  patientId?: string;
}): Promise<{
  patient: Patient;
  session: Session;
  previousSessions: PreviousSessionContext[];
  activePlan: TherapeuticPlan | null;
}> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("psychologist_id", psychologistId)
    .single();

  if (!session) throw new Error("Sesion no encontrada o sin acceso");
  if (patientId && session.patient_id !== patientId) {
    throw new Error("La sesion no corresponde al paciente indicado");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", session.patient_id)
    .eq("psychologist_id", psychologistId)
    .single();

  if (!patient) throw new Error("Paciente no encontrado o sin acceso");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("patient_id", patient.id)
    .eq("psychologist_id", psychologistId)
    .eq("status", "complete")
    .neq("id", sessionId)
    .order("scheduled_at", { ascending: false })
    .limit(6);

  const previousSessionRows = sessions ?? [];
  const previousSessionIds = previousSessionRows.map((row) => row.id);
  const reportsBySessionId = new Map<string, AIReport>();

  if (previousSessionIds.length > 0) {
    const { data: reports } = await supabase
      .from("ai_reports")
      .select("*")
      .in("session_id", previousSessionIds)
      .order("generated_at", { ascending: false });

    for (const report of reports ?? []) {
      if (!reportsBySessionId.has(report.session_id)) {
        reportsBySessionId.set(report.session_id, report);
      }
    }
  }

  const { data: activePlan } = await supabase
    .from("therapeutic_plans")
    .select("*")
    .eq("patient_id", patient.id)
    .eq("psychologist_id", psychologistId)
    .eq("status", "active")
    .maybeSingle();

  return {
    patient,
    session,
    activePlan: activePlan ?? null,
    previousSessions: previousSessionRows.map((row) => ({
      ...row,
      ai_report: reportsBySessionId.get(row.id) ?? null,
    })),
  };
}

function parseReport(raw: string): AIReportData {
  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return normalizeReport(JSON.parse(clean) as Partial<AIReportData>);
  } catch {
    console.error("[AI ANALYSIS] Invalid JSON response:", clean.slice(0, 500));
    throw new Error("El reporte generado por Claude no es JSON valido");
  }
}

function normalizeReport(report: Partial<AIReportData>): AIReportData {
  return {
    summary: report.summary ?? "Sin resumen generado.",
    patterns: Array.isArray(report.patterns) ? report.patterns : [],
    diagnostic_hints: Array.isArray(report.diagnostic_hints) ? report.diagnostic_hints : [],
    risk_signals: Array.isArray(report.risk_signals) ? report.risk_signals : [],
    similar_cases: Array.isArray(report.similar_cases) ? report.similar_cases : [],
    evolution_vs_previous: report.evolution_vs_previous ?? "Sin comparacion disponible.",
    therapeutic_suggestions: Array.isArray(report.therapeutic_suggestions)
      ? report.therapeutic_suggestions
      : [],
    questions_for_next_session: Array.isArray(report.questions_for_next_session)
      ? report.questions_for_next_session
      : [],
    what_i_cannot_determine:
      report.what_i_cannot_determine ?? "No especificado por el modelo.",
    disclaimer: CLINICAL_DISCLAIMER,
  };
}
