---
name: classifier-agent
description: Usa Claude para leer cada documento clínico y decidir en qué grupo de conocimiento pertenece (8 grupos base). Para documentos personales del profesional, genera una etiqueta descriptiva si no encaja en ningún grupo base.
model: sonnet
---

# Classifier Agent — Clasificación de Documentos Clínicos

## Activación

Cuando un documento necesita ser clasificado en un grupo de conocimiento (después de book-ingestor, antes de rag-agent).

## Los 8 grupos base

```typescript
const CLINICAL_GROUPS = [
  { slug: 'cbt',           name: 'Cognitivo-conductual (TCC)',
    keywords: 'Beck, Burns, distorsiones cognitivas, DBT, ACT, pensamientos automáticos, esquemas, exposición' },
  { slug: 'psicoanalitico', name: 'Psicodinámico / Psicoanalítico',
    keywords: 'Freud, inconsciente, transferencia, Winnicott, apego, mecanismos de defensa, Kernberg, Lacan' },
  { slug: 'humanista',     name: 'Humanista / Existencial',
    keywords: 'Rogers, autorrealización, Frankl, logoterapia, Yalom, Perls, Gestalt, empatía, sentido de vida' },
  { slug: 'sistemica',     name: 'Sistémica / Familiar',
    keywords: 'Minuchin, Satir, Bowen, triangulación, roles familiares, comunicación, terapia de pareja' },
  { slug: 'trauma',        name: 'Trauma / EMDR / Somática',
    keywords: 'Van der Kolk, trauma, PTSD, EMDR, Shapiro, disociación, teoría polivagal, Levine' },
  { slug: 'neuropsico',    name: 'Neuropsicología / Evaluación',
    keywords: 'DSM, CIE-11, diagnóstico diferencial, tests, baterías, Luria, funciones ejecutivas, memoria' },
  { slug: 'infanto',       name: 'Psicología infanto-juvenil',
    keywords: 'Piaget, Vygotsky, desarrollo infantil, juego terapéutico, adolescencia, crianza' },
  { slug: 'positiva',      name: 'Psicología positiva / Mindfulness',
    keywords: 'Seligman, fortalezas, bienestar, Kabat-Zinn, mindfulness, Neff, autocompasión, MBSR' },
]
```

## Prompt de clasificación

```typescript
// lib/ai/classifier.ts
const prompt = `Eres un experto en psicología clínica.
Clasifica este documento en UNO de los grupos disponibles.

NOMBRE DEL ARCHIVO: ${filename}
CARPETA DE ORIGEN: ${folderHint}

GRUPOS DISPONIBLES:
${availableGroups.map(g => `- ${g.slug}: ${g.name} | Palabras clave: ${g.keywords}`).join('\n')}

TEXTO DEL DOCUMENTO:
${textSample}  // primeros 4000 chars

REGLAS:
- Si la carpeta de origen coincide con un grupo, priorízala como hint fuerte
- Si el texto es ambiguo entre dos grupos, elige el más específico
- Si definitivamente no encaja en ningún grupo, group_slug debe ser null
- En ese caso, suggested_personal_label describe el tema en 2-4 palabras

Responde SOLO en JSON válido sin markdown:
{
  "group_slug": "slug_o_null",
  "group_name": "nombre completo",
  "confidence": "high|medium|low",
  "reasoning": "máximo 2 frases",
  "suggested_personal_label": "Descripción breve si group_slug es null"
}`
```

## Flujo de decisión

```
Documento recibido
  │
  ├─ ¿Carpeta de origen es un grupo conocido?
  │     └─ SÍ → usar como hint, confirmar con texto
  │
  ├─ Leer primeros 4000 chars con Claude
  │
  ├─ ¿group_slug retornado tiene confidence >= 'medium'?
  │     ├─ SÍ → asignar a grupo base (group_id en knowledge_documents)
  │     └─ NO → crear o reutilizar grupo personal (personal_knowledge_groups)
  │
  └─ Reportar resultado para guardar en DB
```

## Validaciones

```
✓ JSON resultado siempre parseable (manejo de error con reintento)
✓ group_slug siempre existe en knowledge_groups o es null
✓ Si null, suggested_personal_label NUNCA vacío
✓ Log de clasificación guardado en ai_classification (jsonb)
```

## Coordinación

- Recibe input de `book-ingestor-agent`
- Pasa output a `rag-agent` para generar embeddings
- Reporta al orquestador con: clasificación + confianza
