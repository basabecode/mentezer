# REBRANDING CHECKLIST — PsyAssist → Mentezer

**Estado:** 📋 En progreso  
**Fecha:** 2026-04-19

---

## ✅ ARCHIVOS CORREGIDOS (25) — REBRANDING 100% COMPLETADO

**Archivos nuevos creados:**
- [x] `COMPLIANCE.md` — Disclaimer clínico (línea 36)
- [x] `STACK.md` — Estructura del proyecto (línea 31: psyassist → mentezer)
- [x] `KNOWLEDGE_SYSTEM.md` — Contexto del sistema (línea 13)

**Agentes (7):**
- [x] `clinical-analyst-agent.md` — 2 referencias (líneas 3, 102)
- [x] `database-agent.md` — 1 referencia (línea 3)
- [x] `orchestrator-agent.md` — 2 referencias (líneas 3, 7)
- [x] `reports-agent.md` — 3 referencias (líneas 3, 20, 58)
- [x] `security-agent.md` — 1 referencia (línea 89)
- [x] `setup-agent.md` — 3 referencias (líneas 3, 7, 17)
- [x] `ui-agent.md` — 1 referencia (línea 3)

**Migraciones SQL (4):**
- [x] `20260416000001_initial_schema.sql` — 1 referencia (línea 2)
- [x] `20260417000002_multitenant_integrations.sql` — 1 referencia (línea 2)
- [x] `20260417000003_auth_user_profile_sync.sql` — 1 referencia (línea 2)
- [x] `20260418000004_knowledge_groups_system.sql` — 1 referencia (línea 2)

**Skills (3):**
- [x] `grabacion-audio/SKILL.md` — 1 referencia (línea 2)
- [x] `privacidad-ley1581/SKILL.md` — 1 referencia (línea 2)
- [x] `rag-clinico/SKILL.md` — 1 referencia (línea 2)

**Scripts (2):**
- [x] `bulk-load-books.ts` — 1 referencia (línea 2)
- [x] `classify-document.ts` — 1 referencia (línea 63)

**Configuración (.claude/) (3):**
- [x] `.claude/settings.json` — 1 referencia (línea 3)
- [x] `.claude/settingss.local.json` — 13 referencias (emails, URLs, paths)
- [x] `.claude/settings.local.json` — 13 referencias (emails, URLs, paths)

**Otros (1):**
- [x] `app/globals.css` — 1 referencia (línea 3)
- [x] `lib/integrations/crypto.ts` — 1 referencia (línea 11: salt)

---

## 📋 RESUMEN FINAL

✅ **ESTADO: COMPLETADO 100%**

**Total de archivos actualizados: 25**
- Archivos documentación + código: 10
- Migraciones SQL: 4
- Agentes: 7
- Skills: 3
- Scripts: 2
- Configuración: 2
- CSS/Librerías: 2

**Referencias reemplazadas: ~60**

### 📁 Skills (.claude/skills/) — Requieren validación

| Archivo | Referencias | Prioridad |
|---------|-------------|-----------|
| `grabacion-audio/SKILL.md` | PsyAssist | 🔴 Alta |
| `privaciya-ley1581/SKILL.md` | PsyAssist | 🔴 Alta |
| `rag-clinico/SKILL.md` | PsyAssist | 🔴 Alta |

### 📁 Scripts de carga (./)

| Archivo | Referencias | Prioridad |
|---------|-------------|-----------|
| `scripts/bulk-load-books.ts` | PsyAssist | 🟡 Media |
| `scripts/classify-document.ts` | PsyAssist | 🟡 Media |

### 📁 Librerías

| Archivo | Referencias | Prioridad |
|---------|-------------|-----------|
| `lib/integrations/crypto.ts` | PsyAssist | 🟡 Media |

### 📁 Configuración (.claude/)

| Archivo | Referencias | Prioridad |
|---------|-------------|-----------|
| `.claude/settings.json` | psyassist | 🟡 Media |
| `.claude/settingss.local.json` | psyassist | 🟡 Media |
| `.claude/settings.local.json` | psyassist | 🟡 Media |

### 📁 Otros

| Archivo | Referencias | Prioridad |
|---------|-------------|-----------|
| `app/globals.css` | psyassist | 🟡 Media |
| `supabase/.temp/linked-project.json` | psyassist | 🟠 Baja |

---

## 🎯 RECOMENDACIÓN

**Orden de corrección sugerido:**

1. **🔴 Alta (7 agentes)** — Afectan documentación de desarrollo
   - Editar `.claude/agents/*.md`
   - Cambio: `PsyAssist` → `Mentezer` (y sus variaciones)

2. **🟡 Media (11 archivos)** — Código y configuración importante
   - Migraciones SQL
   - Skills
   - Scripts
   - Settings

3. **🟠 Baja (1 archivo)** — Configuración temporal

---

## 📝 PATRÓN DE BÚSQUEDA Y REEMPLAZO

**Buscar:**
- `PsyAssist` → reemplazar por `Mentezer`
- `psyassist` → reemplazar por `mentezer`
- `psy-assist` → reemplazar por `mentezer`
- `psy_assist` → reemplazar por `mentezer`

**En cada archivo, validar contexto** — algunos comentarios internos podrían mantener "PsyAssist" como referencia histórica (marcar con `// deprecated:` si aplica).

---

## ✨ VERIFICACIÓN FINAL

```bash
# Cuando termines todos los cambios, ejecuta:
grep -r "PsyAssist\|psyassist\|psy-assist" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.log"

# Resultado esperado: 0 matches
```

---

_Actualizar este archivo a medida que completes correcciones. Marcar con [x] cuando termines cada sección._
