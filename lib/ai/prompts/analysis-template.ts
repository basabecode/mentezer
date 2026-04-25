import { CLINICAL_DISCLAIMER } from "./clinical-identity";
import type { KnowledgeChunk, SimilarCase } from "../rag";

export interface AIReportData {
  summary: string;
  patterns: Array<{
    pattern: string;
    evidence: string;
    frequency?: "primera_vez" | "recurrente" | "intensificandose" | "disminuyendo";
    clinical_significance?: string;
    source: string;
  }>;
  diagnostic_hints: Array<{
    hypothesis: string;
    basis: string;
    differential?: string;
    confidence?: "exploratoria" | "moderada" | "robusta";
    book: string;
    page: string;
    caveat?: string;
  }>;
  risk_signals: Array<{
    signal: string;
    severity: "low" | "medium" | "high" | "critical";
    description?: string;
    quote?: string;
    clinical_rationale?: string;
    recommended_action?: string;
  }>;
  similar_cases: Array<{
    title: string;
    similarity: string;
    outcome: string;
  }>;
  evolution_vs_previous: string;
  therapeutic_suggestions: Array<{
    suggestion: string;
    basis: string;
    rationale?: string;
    how?: string;
  }>;
  questions_for_next_session?: string[];
  what_i_cannot_determine?: string;
  disclaimer: string;
}

export interface AnalysisPromptInput {
  transcript: string;
  patientContextPrompt: string;
  knowledgeBase: KnowledgeChunk[];
  knowledgePersonal: KnowledgeChunk[];
  similarCases: SimilarCase[];
  sessionNumber: number;
  sessionMode: string;
}

export function buildAnalysisPrompt(input: AnalysisPromptInput): string {
  return `
${input.patientContextPrompt}

TRANSCRIPCION DE LA SESION ACTUAL
Sesion: ${input.sessionNumber}
Modo: ${formatMode(input.sessionMode)}

Nota metodologica:
La transcripcion fue generada automaticamente. Puede contener imprecisiones menores. Analiza el contenido clinico y conserva cautela sobre tono, pausas, afecto, lenguaje corporal y transferencia, especialmente si no aparecen explicitamente en el texto.

${input.transcript}

BIBLIOTECA CLINICA RECUPERADA
${buildKnowledgeSection(input.knowledgeBase, input.knowledgePersonal)}

CASOS SIMILARES DEL PROPIO PROFESIONAL
${buildCasesSection(input.similarCases)}

INSTRUCCION
Genera un AIReport clinico para que el profesional lo evalue, edite y apruebe.

Debe:
- Basarse en la transcripcion, el contexto del caso, las referencias recuperadas y los casos similares.
- Citar libro, autor y pagina cuando uses una referencia bibliografica.
- Si no hay fuente recuperada para una observacion, marcarlo como criterio clinico exploratorio sin referencia bibliografica disponible.
- Diferenciar hipotesis exploratorias de diagnosticos definitivos.
- Incluir limites del analisis desde transcripcion.
- Incluir exactamente este disclaimer: "${CLINICAL_DISCLAIMER}"

Responde solo con JSON valido y con esta estructura:
${buildOutputSchema()}
`.trim();
}

function buildKnowledgeSection(base: KnowledgeChunk[], personal: KnowledgeChunk[]): string {
  const chunks = [
    ...base.map((chunk) => ({ ...chunk, layer: "Biblioteca base" })),
    ...personal.map((chunk) => ({ ...chunk, layer: "Biblioteca personal" })),
  ];

  if (chunks.length === 0) {
    return "No se encontraron referencias relevantes en la biblioteca clinica. No inventes citas bibliograficas.";
  }

  return chunks
    .map(
      (chunk, index) => `Referencia ${index + 1} (${chunk.layer}, similitud ${(chunk.similarity * 100).toFixed(0)}%)
Fuente: ${chunk.document_title}
Autor: ${chunk.author ?? "No registrado"}
Grupo: ${chunk.group_name ?? chunk.personal_label ?? "Sin grupo"}
Pagina: ${chunk.page_number}
Contenido:
${chunk.content}`
    )
    .join("\n\n---\n\n");
}

function buildCasesSection(cases: SimilarCase[]): string {
  if (cases.length === 0) {
    return "No se encontraron casos similares indexados para este profesional.";
  }

  return cases
    .map(
      (c, index) => `Caso ${index + 1} (similitud ${(c.similarity * 100).toFixed(0)}%)
Titulo: ${c.title}
Resultado: ${c.outcome}
Sesiones: ${c.sessions_count}
Descripcion:
${c.description}
Intervenciones:
${JSON.stringify(c.interventions_used)}`
    )
    .join("\n\n---\n\n");
}

function buildOutputSchema(): string {
  return JSON.stringify(
    {
      summary: "Resumen clinico de 3 a 4 parrafos, claro y util para un colega.",
      patterns: [
        {
          pattern: "Nombre del patron observado",
          evidence: "Cita o evidencia directa de la transcripcion",
          frequency: "primera_vez|recurrente|intensificandose|disminuyendo",
          clinical_significance: "Por que importa en este caso",
          source: "Libro, autor, pagina si aplica; si no, indicar sin referencia bibliografica disponible",
        },
      ],
      diagnostic_hints: [
        {
          hypothesis: "Hipotesis exploratoria, nunca diagnostico definitivo",
          basis: "Evidencia clinica observada",
          differential: "Diagnosticos o explicaciones alternativas a descartar",
          confidence: "exploratoria|moderada|robusta",
          book: "Libro de referencia o sin referencia bibliografica disponible",
          page: "Pagina o N/A",
          caveat: "Limitacion de esta hipotesis",
        },
      ],
      risk_signals: [
        {
          signal: "Senal de riesgo",
          severity: "low|medium|high|critical",
          description: "Descripcion breve",
          quote: "Fragmento textual si existe",
          clinical_rationale: "Razonamiento clinico",
          recommended_action: "Que explorar o verificar en proxima sesion",
        },
      ],
      similar_cases: [
        {
          title: "Titulo del caso similar",
          similarity: "En que se parece",
          outcome: "Aprendizaje aplicable",
        },
      ],
      evolution_vs_previous: "Comparacion longitudinal o primera sesion sin comparacion posible",
      therapeutic_suggestions: [
        {
          suggestion: "Sugerencia a evaluar por el profesional",
          basis: "Fundamento clinico o bibliografico",
          rationale: "Por que podria ser util",
          how: "Como podria explorarse sin imponer tratamiento",
        },
      ],
      questions_for_next_session: ["Pregunta clinica sugerida, maximo 5"],
      what_i_cannot_determine: "Limites especificos del analisis desde transcripcion",
      disclaimer: CLINICAL_DISCLAIMER,
    },
    null,
    2
  );
}

function formatMode(mode: string): string {
  if (mode === "presential") return "Presencial";
  if (mode === "virtual") return "Virtual";
  return mode || "No registrado";
}
