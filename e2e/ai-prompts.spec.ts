import { expect, test } from "@playwright/test";
import { CLINICAL_DISCLAIMER, CLINICAL_SYSTEM_PROMPT } from "../lib/ai/prompts/clinical-identity";
import { buildAnalysisPrompt, type AIReportData } from "../lib/ai/prompts/analysis-template";
import { buildPatientContextPrompt } from "../lib/ai/prompts/context-builder";
import type { Database } from "../types/supabase";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type TherapeuticPlan = Database["public"]["Tables"]["therapeutic_plans"]["Row"];

const patient: Patient = {
  address: null,
  age: 34,
  consent_document_url: null,
  consent_signed_at: "2026-04-01T10:00:00.000Z",
  contact_email: null,
  contact_phone: null,
  created_at: "2026-03-20T10:00:00.000Z",
  document_id: null,
  emergency_contact: null,
  gender: "female",
  id: "patient-1",
  name: "Paciente Test",
  patient_portal_token: null,
  psychologist_id: "psy-1",
  reason: "Ansiedad anticipatoria y evitacion de situaciones sociales.",
  referred_by: "Consulta espontanea",
  status: "active",
};

const activePlan: TherapeuticPlan = {
  ai_draft: null,
  approved_plan: {
    objectives: ["Reducir evitacion", "Fortalecer registro emocional"],
  },
  created_at: "2026-03-21T10:00:00.000Z",
  id: "plan-1",
  patient_id: "patient-1",
  psychologist_id: "psy-1",
  shared_with_patient_at: null,
  status: "active",
  updated_at: "2026-03-21T10:00:00.000Z",
};

test.describe("capas de IA clinica", () => {
  test("la identidad clinica exige limites, JSON y disclaimer oficial", () => {
    expect(CLINICAL_SYSTEM_PROMPT).toContain("No emitas diagnósticos definitivos");
    expect(CLINICAL_SYSTEM_PROMPT).toContain("No cruces información entre pacientes");
    expect(CLINICAL_SYSTEM_PROMPT).toContain("Responde únicamente con JSON válido");
    expect(CLINICAL_DISCLAIMER).toContain("Mentezer no reemplaza la");
    expect(CLINICAL_DISCLAIMER).toContain("responsabilidad");
  });

  test("el contexto dinamico incluye paciente, historial y plan sin construir analisis", () => {
    const prompt = buildPatientContextPrompt({
      patient,
      previousSessions: [],
      activePlan,
      currentSessionNumber: 1,
    });

    expect(prompt).toContain("BRIEFING CLINICO DEL PACIENTE");
    expect(prompt).toContain("Ansiedad anticipatoria");
    expect(prompt).toContain("PLAN TERAPEUTICO ACTIVO");
    expect(prompt).toContain("Primera sesión registrada");
  });

  test("la plantilla de analisis incorpora RAG, casos, limites y esquema persistible", () => {
    const patientContextPrompt = buildPatientContextPrompt({
      patient,
      previousSessions: [],
      activePlan: null,
      currentSessionNumber: 1,
    });

    const prompt = buildAnalysisPrompt({
      transcript: "Paciente: Me cuesta salir de casa cuando pienso que me van a juzgar.",
      patientContextPrompt,
      knowledgeBase: [
        {
          content: "La evitacion mantiene respuestas de ansiedad social.",
          document_title: "Manual Clinico TCC",
          author: "Autora Clinica",
          group_name: "Cognitivo-conductual",
          page_number: 42,
          source_type: "system",
          similarity: 0.87,
        },
      ],
      knowledgePersonal: [],
      similarCases: [
        {
          id: "case-1",
          title: "Exposicion gradual en ansiedad social",
          description: "Caso con evitacion social persistente.",
          outcome: "successful",
          interventions_used: ["registro de pensamientos", "exposicion gradual"],
          sessions_count: 8,
          similarity: 0.81,
        },
      ],
      sessionNumber: 1,
      sessionMode: "virtual",
    });

    expect(prompt).toContain("BIBLIOTECA CLINICA RECUPERADA");
    expect(prompt).toContain("Manual Clinico TCC");
    expect(prompt).toContain("CASOS SIMILARES DEL PROPIO PROFESIONAL");
    expect(prompt).toContain("what_i_cannot_determine");
    expect(prompt).toContain(CLINICAL_DISCLAIMER);
  });

  test("el esquema de salida conserva campos compatibles con ai_reports", () => {
    const report: AIReportData = {
      summary: "Resumen clinico.",
      patterns: [{ pattern: "Evitacion", evidence: "No salgo", source: "Manual, p.42" }],
      diagnostic_hints: [
        {
          hypothesis: "Compatible con ansiedad social a explorar",
          basis: "Evitacion y temor a juicio",
          book: "Manual Clinico TCC",
          page: "42",
        },
      ],
      risk_signals: [{ signal: "Aislamiento", severity: "medium", description: "Evitacion frecuente" }],
      similar_cases: [{ title: "Caso similar", similarity: "Evitacion social", outcome: "Mejoria parcial" }],
      evolution_vs_previous: "Primera sesion, sin comparacion posible.",
      therapeutic_suggestions: [{ suggestion: "Explorar jerarquia de exposicion", basis: "TCC" }],
      questions_for_next_session: ["Que situaciones evita con mayor frecuencia?"],
      what_i_cannot_determine: "No se observa lenguaje corporal desde la transcripcion.",
      disclaimer: CLINICAL_DISCLAIMER,
    };

    expect(report.summary).toBeTruthy();
    expect(Array.isArray(report.patterns)).toBe(true);
    expect(Array.isArray(report.diagnostic_hints)).toBe(true);
    expect(Array.isArray(report.risk_signals)).toBe(true);
    expect(Array.isArray(report.similar_cases)).toBe(true);
    expect(Array.isArray(report.therapeutic_suggestions)).toBe(true);
  });
});
