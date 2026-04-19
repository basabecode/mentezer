import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const GROUPS_FOR_CLASSIFIER = [
  {
    slug: "cbt",
    name: "Cognitivo-conductual (TCC)",
    keywords: "Beck, Burns, distorsiones cognitivas, terapia conductual, DBT, ACT, Linehan, esquemas, pensamientos automáticos",
  },
  {
    slug: "psicoanalitico",
    name: "Psicodinámico / Psicoanalítico",
    keywords: "Freud, inconsciente, transferencia, contratransferencia, Winnicott, Bowlby, apego, mecanismos de defensa, Kernberg, Lacan",
  },
  {
    slug: "humanista",
    name: "Humanista / Existencial",
    keywords: "Rogers, autorrealización, Frankl, logoterapia, Yalom, Perls, Gestalt, empatía, aceptación incondicional, sentido de vida",
  },
  {
    slug: "sistemica",
    name: "Sistémica / Familiar",
    keywords: "Minuchin, Satir, Bowen, triangulación, roles familiares, comunicación, terapia de pareja, narrativa, soluciones",
  },
  {
    slug: "trauma",
    name: "Trauma / EMDR / Somática",
    keywords: "Van der Kolk, trauma, PTSD, EMDR, Shapiro, disociación, sistema nervioso, teoría polivagal, Levine, regulación emocional",
  },
  {
    slug: "neuropsico",
    name: "Neuropsicología / Evaluación",
    keywords: "DSM, CIE-11, diagnóstico, evaluación neuropsicológica, tests, baterías, Luria, funciones ejecutivas, memoria, atención",
  },
  {
    slug: "infanto",
    name: "Psicología infanto-juvenil",
    keywords: "Piaget, Vygotsky, desarrollo infantil, juego terapéutico, adolescencia, aprendizaje, crianza, Winnicott niños",
  },
  {
    slug: "positiva",
    name: "Psicología positiva / Mindfulness",
    keywords: "Seligman, fortalezas, bienestar, Kabat-Zinn, mindfulness, Neff, autocompasión, resiliencia, MBSR, meditación",
  },
];

export interface ClassificationResult {
  group_slug: string | null;
  group_name: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  suggested_personal_label: string | null;
}

export async function classifyDocument(
  filename: string,
  folderHint: string,
  textSample: string
): Promise<ClassificationResult> {
  const folderIsHint = folderHint !== "sin-clasificar" && folderHint !== "personal";

  const prompt = `Eres un experto en psicología clínica. Clasifica este documento en uno de los grupos de conocimiento de PsyAssist.

NOMBRE DEL ARCHIVO: ${filename}
CARPETA DE ORIGEN: ${folderHint}${folderIsHint ? " (el psicólogo lo puso aquí como hint — úsalo si tiene sentido)" : ""}

GRUPOS DISPONIBLES:
${GROUPS_FOR_CLASSIFIER.map((g) => `- ${g.slug}: ${g.name}\n  Palabras clave: ${g.keywords}`).join("\n")}

MUESTRA DEL TEXTO (primeras páginas):
${textSample.slice(0, 4000)}

Responde SOLO en JSON válido, sin markdown, sin comentarios:
{
  "group_slug": "slug_del_grupo_o_null",
  "group_name": "nombre completo del grupo",
  "confidence": "high|medium|low",
  "reasoning": "máximo 2 frases explicando por qué",
  "suggested_personal_label": "nombre descriptivo si group_slug es null, ejemplo: Psicofarmacología clínica"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { type: string; text: string }).text;
    return JSON.parse(text) as ClassificationResult;
  } catch (err) {
    console.error(`[CLASSIFIER ERROR] ${filename}:`, err);
    return {
      group_slug: null,
      group_name: "Sin clasificar",
      confidence: "low",
      reasoning: "Error en clasificación automática",
      suggested_personal_label: filename.replace(".pdf", "").replace(/_/g, " "),
    };
  }
}
