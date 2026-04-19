import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface ClassificationResult {
  group_slug: string | null;
  group_name: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  suggested_personal_label: string | null;
}

interface AvailableGroup {
  id?: string;
  slug: string;
  name: string;
  description?: string;
}

export async function classifyDocument(
  filename: string,
  folderHint: string,
  textSample: string,
  availableGroups: AvailableGroup[]
): Promise<ClassificationResult> {
  const folderIsHint = folderHint !== "sin-clasificar" && folderHint !== "personal";

  const prompt = `Eres un experto en psicología clínica. Clasifica este documento en uno de los grupos disponibles.

NOMBRE DEL ARCHIVO: ${filename}
CARPETA DE ORIGEN: ${folderHint}${folderIsHint ? " (el psicólogo lo puso aquí como hint — úsalo si tiene sentido)" : ""}

GRUPOS DISPONIBLES:
${availableGroups.map((g) => `- ${g.slug}: ${g.name}${g.description ? `\n  ${g.description}` : ""}`).join("\n")}

MUESTRA DEL TEXTO (primeras páginas):
${textSample.slice(0, 4000)}

REGLAS:
- Si la carpeta de origen coincide con un grupo, priorízala como hint fuerte
- Si el texto es ambiguo entre dos grupos, elige el más específico
- Si definitivamente no encaja en ningún grupo, group_slug debe ser null
- En ese caso, suggested_personal_label debe describir el tema en 2-4 palabras

Responde SOLO en JSON válido sin markdown:
{
  "group_slug": "slug_o_null",
  "group_name": "nombre completo",
  "confidence": "high|medium|low",
  "reasoning": "máximo 2 frases",
  "suggested_personal_label": "Descripción breve si group_slug es null"
}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const result = JSON.parse(text) as ClassificationResult;

      // Validar que el slug retornado existe en los grupos disponibles
      if (result.group_slug) {
        const exists = availableGroups.some((g) => g.slug === result.group_slug);
        if (!exists) result.group_slug = null;
      }

      if (!result.group_slug && !result.suggested_personal_label) {
        result.suggested_personal_label = filename.replace(/\.[^.]+$/, "").replace(/_/g, " ");
      }

      return result;
    } catch (err) {
      console.error(`[CLASSIFIER] Intento ${attempt + 1} fallido:`, err);
      if (attempt === 1) {
        return {
          group_slug: null,
          group_name: "Sin clasificar",
          confidence: "low",
          reasoning: "Error en clasificación automática",
          suggested_personal_label: filename.replace(/\.[^.]+$/, "").replace(/_/g, " "),
        };
      }
    }
  }

  return {
    group_slug: null,
    group_name: "Sin clasificar",
    confidence: "low",
    reasoning: "Error en clasificación automática",
    suggested_personal_label: filename.replace(/\.[^.]+$/, "").replace(/_/g, " "),
  };
}
