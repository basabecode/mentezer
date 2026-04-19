import Anthropic from "@anthropic-ai/sdk";
import { searchAllKnowledge, searchSimilarCases, formatKnowledgeForPrompt, formatCasesContext } from "./rag";
import { createClient } from "@/lib/supabase/server";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const DISCLAIMER =
  "⚠️ Este análisis es una herramienta de apoyo al criterio clínico. El diagnóstico, tratamiento y decisiones clínicas son responsabilidad exclusiva del profesional de salud mental. Mentezer no reemplaza la evaluación clínica profesional.";

export interface AIReportData {
  summary: string;
  patterns: Array<{ pattern: string; evidence: string; source: string }>;
  diagnostic_hints: Array<{ hypothesis: string; basis: string; book: string; page: string }>;
  risk_signals: Array<{ signal: string; severity: "low" | "medium" | "high"; description: string }>;
  similar_cases: Array<{ title: string; similarity: string; outcome: string }>;
  evolution_vs_previous: string;
  therapeutic_suggestions: Array<{ suggestion: string; basis: string }>;
  disclaimer: string;
}

export async function analyzeSession({
  sessionId,
  transcript,
  patientContext,
  previousSessionsSummary,
  psychologistId,
}: {
  sessionId: string;
  transcript: string;
  patientContext: string;
  previousSessionsSummary: string;
  psychologistId: string;
}): Promise<AIReportData> {
  // Búsqueda en paralelo: las dos capas de conocimiento + casos similares
  const [{ base: knowledgeBase, personal: knowledgePersonal }, similarCases] = await Promise.all([
    searchAllKnowledge(transcript, psychologistId),
    searchSimilarCases(transcript.slice(0, 2000), psychologistId, 3),
  ]);

  const knowledgeContext = formatKnowledgeForPrompt(knowledgeBase, knowledgePersonal);
  const casesContext = formatCasesContext(similarCases);
  const knowledgeSourcesUsed = [...knowledgeBase, ...knowledgePersonal].map((c) => ({
    title: c.document_title,
    author: c.author ?? "",
    group: c.group_name,
  }));

  const systemPrompt = `Eres un asistente clínico de apoyo para psicólogos en Colombia.

Analiza la sesión basándote ÚNICAMENTE en:
1. La transcripción proporcionada
2. Fragmentos de libros clínicos del psicólogo (con fuente exacta)
3. Casos similares exitosos del propio psicólogo

REGLAS ABSOLUTAS:
- NUNCA afirmes algo sin respaldo en los documentos proporcionados
- SIEMPRE cita libro, autor y página cuando hagas observación clínica
- SIEMPRE incluye el disclaimer clínico exacto al final
- Responde en español clínico formal colombiano
- Responde SOLO con JSON válido, sin markdown ni texto adicional`;

  const userPrompt = `CONTEXTO DEL PACIENTE:
${patientContext}

SESIONES ANTERIORES (resumen):
${previousSessionsSummary || "Primera sesión"}

TRANSCRIPCIÓN DE LA SESIÓN:
${transcript}

FRAGMENTOS DE LIBROS CLÍNICOS RELEVANTES:
${knowledgeContext}

CASOS SIMILARES EXITOSOS DEL PSICÓLOGO:
${casesContext}

Genera el AIReport en JSON con esta estructura exacta:
{
  "summary": "Resumen ejecutivo de la sesión (150-250 palabras)",
  "patterns": [
    {
      "pattern": "Nombre del patrón observado",
      "evidence": "Cita textual o descripción de la evidencia en la transcripción",
      "source": "Libro, autor, página si aplica"
    }
  ],
  "diagnostic_hints": [
    {
      "hypothesis": "Hipótesis diagnóstica (NO diagnóstico definitivo)",
      "basis": "Argumentación clínica",
      "book": "Libro de referencia",
      "page": "Página"
    }
  ],
  "risk_signals": [
    {
      "signal": "Señal observada",
      "severity": "low|medium|high",
      "description": "Descripción detallada de por qué es una señal de riesgo"
    }
  ],
  "similar_cases": [
    {
      "title": "Título del caso similar",
      "similarity": "Por qué es similar",
      "outcome": "Qué funcionó"
    }
  ],
  "evolution_vs_previous": "Comparación con sesiones anteriores (omitir si es primera sesión)",
  "therapeutic_suggestions": [
    {
      "suggestion": "Sugerencia específica",
      "basis": "Fundamento clínico o bibliográfico"
    }
  ],
  "disclaimer": "${DISCLAIMER}"
}`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Respuesta inesperada de Claude");

  let reportData: AIReportData;
  try {
    reportData = JSON.parse(content.text);
  } catch {
    throw new Error("Error al parsear la respuesta de Claude");
  }

  // Forzar el disclaimer correcto
  reportData.disclaimer = DISCLAIMER;

  // Guardar en DB
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("ai_reports").insert({
    session_id: sessionId,
    summary: reportData.summary,
    patterns: reportData.patterns,
    diagnostic_hints: reportData.diagnostic_hints,
    risk_signals: reportData.risk_signals,
    similar_cases: reportData.similar_cases,
    evolution_vs_previous: reportData.evolution_vs_previous,
    therapeutic_suggestions: reportData.therapeutic_suggestions,
    knowledge_sources_used: knowledgeSourcesUsed,
    disclaimer: DISCLAIMER,
    model_used: "claude-sonnet-4-6",
  });

  // Actualizar estado de la sesión
  await supabase
    .from("sessions")
    .update({ status: "complete" })
    .eq("id", sessionId);

  return reportData;
}
