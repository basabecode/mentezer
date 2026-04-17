# SKILL: psyassist-design

> Sistema de diseño vivo de PsyAssist — Spatial Clinical.
> Consultar SIEMPRE antes de escribir cualquier componente o página.
> Actualizar cuando se apruebe un nuevo patrón visual.

---

## REGLAS QUE NUNCA SE ROMPEN

| Prohibido | Permitido |
|-----------|-----------|
| Header tradicional anclado al borde | Topbar contextual + pill navbar flotante |
| Footer con columnas | Strip legal mínimo + SettingsDrawer |
| Fondo `#FFFFFF` blanco puro | `#F5F2ED` cream / `#FAF8F4` paper |
| Font `Inter` | `Lora` serif + `DM Sans` + `DM Mono` |
| Emojis como iconos | SVG custom inline |
| Grid uniforme de cards idénticas | Bento asimétrico con jerarquía |
| Gradientes con morado | Gradientes con blue/green/amber del sistema |
| Instantiación de clientes AI a nivel módulo | Funciones lazy `getOpenAI()` / `getAnthropic()` |

---

## PALETA DE TOKENS

```css
/* Fondos */
--psy-cream:        #F5F2ED   /* fondo principal */
--psy-paper:        #FAF8F4   /* cards, superficies */

/* Texto */
--psy-ink:          #1C1B18   /* primario */
--psy-muted:        #6B6760   /* secundario */

/* Bordes */
--psy-border:       rgba(28,27,24,0.10)

/* Acción */
--psy-blue:         #3B6FA0
--psy-blue-light:   #EAF1F8

/* Éxito */
--psy-green:        #4A7C59
--psy-green-light:  #EBF4EE

/* Advertencia */
--psy-amber:        #B07D3A
--psy-amber-light:  #FBF3E4

/* Riesgo */
--psy-red:          #C0392B
--psy-red-light:    #FDECEA
```

---

## TIPOGRAFÍA

```tsx
// Títulos, análisis IA, headings
<h1 className="font-serif text-4xl font-semibold text-[#1C1B18] tracking-tight">

// UI general, labels, párrafos
<p className="font-sans text-sm text-[#6B6760]">

// Números, timestamps, IDs, códigos
<span className="font-mono text-2xl font-semibold text-[#1C1B18]">
```

---

## SHELL DEL DASHBOARD (layout fijo)

```
┌─────────────────────────────────────────────────────┐
│  Topbar contextual (saludo + stats + avatar)        │
├──────────┬──────────────────────────────────────────┤
│ Patient  │                                          │
│ Panel    │   <main> contenido de la página          │
│ lateral  │   pb-28 (espacio para el dock)           │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  [floating dock — tipo macOS, oculto al scroll]     │
│  [settings drawer — lateral izquierdo]              │
└─────────────────────────────────────────────────────┘
```

---

## PATRONES DE COMPONENTES

### Card base
```tsx
<div className="bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-6
                hover:shadow-[0_8px_32px_rgba(28,27,24,0.07)] transition-shadow">
```

### Badge de estado
```tsx
// Activo
<span className="text-xs px-2.5 py-1 rounded-full bg-[#EBF4EE] text-[#4A7C59] font-medium">

// Riesgo con pulso
<span className="flex items-center gap-1.5 text-xs text-[#C0392B]">
  <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B] animate-pulse" />
  Alto riesgo
</span>
```

### Botón primario
```tsx
<button className="bg-[#3B6FA0] text-white text-sm font-medium px-5 py-2.5 rounded-xl
                   hover:bg-[#3B6FA0]/90 transition-all
                   shadow-[0_4px_16px_rgba(59,111,160,0.25)]">
```

### Bento grid asimétrico
```tsx
// Patrón 2+1 / 1+2
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2 ...">  {/* item ancho */}
  <div className="col-span-1 ...">  {/* item angosto */}
  <div className="col-span-1 ...">
  <div className="col-span-2 ...">
</div>
```

### Número mono como marca de agua
```tsx
<span className="font-mono text-[80px] font-semibold leading-none
                 text-[rgba(28,27,24,0.06)] select-none absolute">
  01
</span>
```

### Disclaimer clínico (OBLIGATORIO en outputs IA)
```tsx
<p className="text-xs text-[#6B6760] bg-[#FBF3E4] border border-[#B07D3A]/15
              rounded-xl px-4 py-3">
  ⚠ Este análisis es apoyo al criterio clínico. El diagnóstico y decisiones
  son responsabilidad exclusiva del profesional de salud mental.
</p>
```

---

## PÁGINAS CONSTRUIDAS Y SU ESTADO

| Página | Estado | Notas |
|--------|--------|-------|
| `/` | ✅ WOW | Pill navbar, bento, precios, CTA oscuro |
| `/login` | ✅ Rediseñado | Toggle contraseña, card con header strip |
| `/register` | ⚠ Pendiente | Mismo nivel que login |
| `/dashboard` | ⚠ Básico | Shell listo, contenido necesita wow |
| `/admin` | ⚠ Básico | Necesita rediseño con métricas ricas |
| `/patients` | ⚠ Sin revisar | — |
| `/sessions/new` | ⚠ Sin revisar | — |
| `/knowledge` | ⚠ Sin revisar | — |
| `/reports` | ⚠ Sin revisar | — |

---

## INFRAESTRUCTURA

- **Supabase**: `ejjvczzdhumgrllkjblq` (sa-east-1)
- **Vercel prod**: `https://psyassist-nine.vercel.app`
- **GitHub**: `https://github.com/basabecode/psicoasistente.git` rama `master`
- **Deploy**: `cd psyassist && vercel deploy --yes --prod`
- **Middleware**: `proxy.ts` (Next.js 16, NO `middleware.ts`)

---

## CHECKLIST ANTES DE CADA COMMIT DE UI

- [ ] Fondo es cream o paper, nunca blanco
- [ ] Títulos en font-serif (Lora)
- [ ] Iconos son SVG, no emojis
- [ ] Sin header ni footer tradicional
- [ ] Cards tienen border + rounded-2xl
- [ ] Alertas de riesgo tienen animate-pulse
- [ ] Disclaimer clínico en todo output de IA
- [ ] RLS verificado si hay nueva query Supabase
