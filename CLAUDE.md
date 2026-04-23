# CLAUDE.md — MENTEZER

> **Plataforma SaaS de IA Clínica para Psicólogos y Psiquiatras de Habla Hispana**
> _La primera herramienta clínica que razona sobre la biblioteca propia del profesional_
>
> **Versión:** 2.0 · **Stack:** Next.js 15 + Supabase + Claude · **Mercado:** América Latina y España

---

## 📍 INICIO RÁPIDO

```
[ ] 1. Leer CLAUDE.md (este archivo)
[ ] 2. Leer AGENTS.md → identificar qué agente(s) aplican
[ ] 3. Leer KNOWLEDGE_SYSTEM.md → si involucra biblioteca clínica
[ ] 4. Consultar skill en .claude/skills/ si aplica
[ ] 5. Verificar versión (Lite/Pro) en FEATURES_COMPARISON.md
[ ] 6. Verificar roadmap en ROADMAP.md antes de features nuevos
[ ] 7. Responder SIEMPRE en español (UI, código, comentarios)

- Piensa antes de actuar. Lee los archivos antes de escribir codigo.
- Si vas a crear un archivo, asegúrate de que esté en el lugar correcto y que tenga el nombre correcto. Usa tsx para components.
- edita solo lo que cambia. No reescribas todo el archivo si no es necesario.
- actualiza la documentacion cuando hagas cambios relevantes.
- no releas archivos que ya hayas leido, a menos que sea estrictamente necesario.
- no repitas codigos sin cambios en tus respuestas.
- sin preambuloss, sin resumenes al finalizar aplicar lo que se te pidio y terminar.
- no me digas que entendiste, solo aplica lo que se te pidio.
- testea antes de dar por terminada la tarea, asegurate de que todo funcione correctamente.
- no generes codigo innecesario.
```

## 🌎 MERCADO OBJETIVO

**MENTEZER** ocupa el espacio de "Espacio de Trabajo Clínico Espacial" para psicólogos y psiquiatras de habla hispana.

**Prioridad geográfica:** Colombia → México → Argentina → Chile/Perú → España

**400.000+ profesionales en LATAM hispanohablante. Ningún competidor tiene producto nativo en español clínico real.**

---

## 🎯 VISIÓN DEL PRODUCTO

Mentezer convierte al profesional de salud mental en un clínico **10x más informado, más rápido y más fundamentado**.

> _"Como tener a todos tus libros clínicos y todos tus casos exitosos leyendo la sesión contigo."_

---

## 💎 LOS 5 DIFERENCIADORES

1. **RAG sobre biblioteca propia** — Cita libro, autor, página. Ningún competidor lo hace.
2. **Memoria de casos exitosos** — Lock-in positivo que crece con cada paciente
3. **Informe de derivación automatizado** — En español clínico, específico LATAM
4. **Producto nativo hispanohablante** — Whisper español, prompts clínicos, compliance LATAM
5. **Diseño "Spatial Clinical"** — Dock flotante + panel clínico, sensación de expediente digital

---

## 📦 DOS VERSIONES

| Aspecto | Lite | Pro |
|---------|------|-----|
| **Cliente** | Psicólogo privado (15-30 pacientes) | Psiquiatra / Psicólogo avanzado |
| **Valor** | 30 seg para nota SOAP + análisis | Documentación completa + CIE-11 + interconsultas |
| **Audio** | No | Sí (Whisper) |
| **PDFs** | 3 | Ilimitados |
| **Enfoques** | 3 | 8 |
| **Precio** | $19/mes | $49/mes |

**Comparativa completa:** Ver [FEATURES_COMPARISON.md](FEATURES_COMPARISON.md)

---

## 📚 DOCUMENTACIÓN POR TEMA

| Tema | Archivo |
|------|---------|
| **Roadmap v1.0 → v2.0** | [ROADMAP.md](ROADMAP.md) |
| **Diseño Spatial Clinical** | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| **Stack tecnológico** | [STACK.md](STACK.md) |
| **Privacidad y Ley 1581** | [COMPLIANCE.md](COMPLIANCE.md) |
| **Modelo de datos SQL** | [DATA_MODEL.md](DATA_MODEL.md) |
| **Convenciones de código** | [CODING_STANDARDS.md](CODING_STANDARDS.md) |
| **Métricas de éxito** | [SUCCESS_METRICS.md](SUCCESS_METRICS.md) |
| **Comparativa Lite vs Pro** | [FEATURES_COMPARISON.md](FEATURES_COMPARISON.md) |
| **Agentes especializados** | [AGENTS.md](AGENTS.md) |
| **Sistema de biblioteca clínica** | [KNOWLEDGE_SYSTEM.md](KNOWLEDGE_SYSTEM.md) |

---

## 🚀 ¿POR DÓNDE EMPIEZO?

**Para una nueva tarea:**

1. **¿Es sobre arquitectura/roadmap?** → Lee [ROADMAP.md](ROADMAP.md)
2. **¿Es sobre UI/diseño?** → Lee [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
3. **¿Es sobre privacidad/compliance?** → Lee [COMPLIANCE.md](COMPLIANCE.md)
4. **¿Es sobre la BD?** → Lee [DATA_MODEL.md](DATA_MODEL.md)
5. **¿Es sobre código?** → Lee [CODING_STANDARDS.md](CODING_STANDARDS.md)
6. **¿Qué features pertenecen a Lite vs Pro?** → Lee [FEATURES_COMPARISON.md](FEATURES_COMPARISON.md)
7. **¿Usas IA clínica?** → Lee [KNOWLEDGE_SYSTEM.md](KNOWLEDGE_SYSTEM.md) y consulta skill `rag-clinico`
8. **¿Necesitas un agente especializado?** → Lee [AGENTS.md](AGENTS.md)
9. **¿sistema de grabacion de sesiones?** → Lee [SISTEMA_GRABACION.md](FEATURES_COMPARISON.md)

---

## ⚡ COMANDOS CLAVE

```bash
# Dev
pnpm dev

# Supabase
supabase start
supabase migration new [nombre]
supabase gen types typescript --local > types/supabase.ts

# Deploy
vercel
vercel --prod

# Calidad (antes de cualquier merge)
pnpm type-check && pnpm lint && pnpm build
```

---

## 🔒 REGLAS ABSOLUTAS

```
1.  RLS EN TODA TABLA — SIN EXCEPCIONES
2.  cors siempre habilitado
3.  Disclaimer clínico en TODO output de IA
4.  NUNCA exponer datos clínicos en logs
5.  Audio cifrado AES-256 antes de almacenar
6.  Notas privadas NUNCA en exportaciones
7.  Diagnósticos SOLO como "hipótesis exploratoria"
8.  Derecho al olvido: eliminación en cascada completa
9.  Español neutro — válido en todo LATAM + España
10. Si se siente como SaaS genérico, lo rehacemos mas humanizado o lo descartamos.
```

---

## 🧭 CONTEXTO DEL PROYECTO

- **Fundador:** Mario Bas (Cali, Colombia)
- **Stack:** Next.js 15, Supabase (experto), TypeScript strict
- **Estado:** v1.0 en progreso (Sprint 4)
- **Ambiente:** Windows, bash, production-ready
- **Principio:** Valida siempre con bash antes de continuar

---

## 📞 REFERENCIAS EXTERNAS

- Ley 1581 (Colombia): https://www.sic.gov.co/
- Supabase Docs: https://supabase.com/docs
- Anthropic SDK: https://docs.anthropic.com
- Whisper API: https://platform.openai.com/docs/guides/speech-to-text

---

_Mentezer — La primera plataforma de IA clínica nativa en español para psicólogos y psiquiatras de América Latina y España. Construida en Cali, Colombia 🇨🇴 para toda la región._
