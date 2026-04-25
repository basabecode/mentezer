# IA Mentezer - Arquitectura de analisis clinico

Esta carpeta documenta como debe actuar la IA dentro de Mentezer. La fuente de verdad ejecutable vive en `lib/ai/`.

## Fuente de verdad

- Capa 1, identidad clinica: `lib/ai/prompts/clinical-identity.ts`
- Capa 2, contexto dinamico del paciente: `lib/ai/prompts/context-builder.ts`
- Capa 3, analisis y output estructurado: `lib/ai/prompts/analysis-template.ts`
- Orquestador: `lib/ai/analysis.ts`
- Recuperacion RAG: `lib/ai/rag.ts`
- Transcripcion: `lib/ai/whisper.ts`
- Embeddings e indexacion: `lib/ai/embeddings.ts`
- Clasificacion documental: `lib/ai/classifier.ts`

## Las 3 capas

### 1. Identidad clinica

Define el rol permanente de la IA:

- apoyo al criterio clinico del profesional;
- hipotesis exploratorias, nunca diagnosticos definitivos;
- no prescripcion;
- no decisiones terapeuticas por el profesional;
- español clinico formal colombiano;
- disclaimer clinico obligatorio.

Esta capa se envia como `system` en cada llamada al modelo.

### 2. Contexto dinamico del caso

Construye el briefing clinico del paciente desde datos autorizados:

- ficha del paciente;
- consentimiento validado;
- sesiones previas completadas;
- reportes IA previos;
- plan terapeutico activo, si existe;
- numero de sesion actual.

Esta capa evita analizar una transcripcion aislada y mantiene continuidad clinica sin cruzar datos entre profesionales.

### 3. Analisis y salida estructurada

Une:

- transcripcion de la sesion actual;
- contexto dinamico del caso;
- referencias recuperadas por RAG;
- casos clinicos similares del mismo profesional;
- esquema JSON del `AIReport`.

El resultado debe poder guardarse directamente en `ai_reports` y mostrarse en la vista de sesion.

## Orquestacion

`lib/ai/analysis.ts` coordina el flujo completo:

1. verifica ownership de sesion y paciente;
2. exige `consent_signed_at`;
3. carga historial y plan activo;
4. construye Capa 2;
5. ejecuta RAG sobre biblioteca base, biblioteca personal y casos similares;
6. construye Capa 3;
7. llama a Claude con Capa 1 como `system`;
8. parsea y normaliza JSON;
9. fuerza el disclaimer oficial de Mentezer;
10. guarda `ai_reports`;
11. registra `audit_logs`;
12. marca la sesion como `complete`.

## Reglas de mantenimiento

- No duplicar prompts ejecutables dentro de `docs/`.
- Si cambia el comportamiento de la IA, actualizar primero `lib/ai/prompts/*` y luego este README.
- No introducir campos de salida que no puedan persistirse como JSONB en `ai_reports`.
- No inventar citas bibliograficas: si RAG no recupera fuente, el reporte debe declararlo.
- Mantener segregacion por `psychologist_id` en RAG, sesiones, pacientes, planes y casos.
- Mantener el disclaimer oficial de `docs/reference/COMPLIANCE.md`.

## Ensayos De Libros Sin OpenAI

Mientras no exista `OPENAI_API_KEY`, solo deben ejecutarse ensayos secos:

```bash
DRY_RUN=true MAX_BOOKS=2 MAX_CHUNKS_PER_BOOK=20 node --experimental-strip-types scripts/bulk-load-books.ts
```

Este ensayo permite validar:

- PDFs detectados en `books-to-index/`;
- PDFs sin texto extraible o candidatos a OCR;
- cantidad de chunks generados;
- clasificacion IA con Anthropic cuando el PDF tiene texto;
- limites de `MAX_BOOKS` y `MAX_CHUNKS_PER_BOOK`.

Cuando se agregue `OPENAI_API_KEY`, la primera carga real recomendada es:

```bash
MAX_BOOKS=2 MAX_CHUNKS_PER_BOOK=20 node --experimental-strip-types scripts/bulk-load-books.ts
```

Despues de medir consumo real en Supabase, se puede subir gradualmente a `MAX_CHUNKS_PER_BOOK=300`.

Pruebas relacionadas:

```bash
pnpm test -- e2e/bulk-load-books.spec.ts e2e/book-scanner.spec.ts e2e/ai-prompts.spec.ts
```
