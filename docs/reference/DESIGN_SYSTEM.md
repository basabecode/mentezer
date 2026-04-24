# DESIGN_SYSTEM.md — Calma Profesional

## ADN de diseño

Un producto clínico no necesita estridencia visual. Necesita **calma inteligente, seguridad emocional y claridad operativa**.
Cada elemento debe comunicar profesionalismo, confianza y una cercanía sobria.

### Principios visuales — NUNCA violar

- **Sin header tradicional** — Topbar contextual: saludo + stats del día + avatar
- **Sin footer tradicional** — Drawer lateral con legal, ajustes y soporte
- **Dock flotante inferior** — Navegación compacta, clara y ligera
- **Fondo clínico respirable** — `#F7F9F9` como base, blanco puro reservado para cards e inputs
- **Tipografía editorial** — `Manrope` para títulos, `DM Sans` para UI y contenido, `DM Mono` para datos
- **Alertas con pulso** — señales de riesgo "high" tienen animación de pulso
- **Sin emojis decorativos** — SVG custom o íconos minimalistas

## Paleta de colores

```css
/* Fondos de sección */
--psy-cream: #F7F9F9;        /* Fondo principal */
--psy-paper: #FFFFFF;        /* Superficies e inputs */
--psy-purple-light: #F1F6F3; /* Secciones secundarias suaves */

/* Texto */
--psy-ink:    #2E2E2E; /* Texto principal */
--psy-muted:  #607173; /* Texto secundario */
--psy-border: #D9E1E2;

/* Primario — azul suave profesional */
--psy-blue:        #4A90A4;
--psy-blue-light:  #E8F2F5;

/* Acento secundario */
--psy-purple:       #8BAA95;
--psy-purple-light: #F1F6F3;

/* Estados */
--psy-green:        #7F9B79; /* Progreso, éxito */
--psy-green-light:  #EEF4EC;
--psy-amber:        #B4895C; /* Advertencia */
--psy-amber-light:  #F7EFE6;
--psy-red:          #B56969; /* Riesgo alto */
--psy-red-light:    #F8EDED;
```

## Regla de secciones (landing page)

```
Hero              → bg-[var(--psy-cream)]    claro y respirable
Pain points       → bg-white
Deliverables      → bg-[var(--psy-purple-light)] salvia suave
Trial steps       → bg-white
Para quién encaja → bg-[var(--psy-cream)]    clínico neutro
Pricing           → bg-[var(--psy-purple-light)] salvia suave
FAQ               → bg-white
Final CTA         → gradiente azul/salvia
```

## Regla de tarjetas

- **Tarjeta sobre fondo suave:** `bg-white` siempre
- **Hover de tarjeta:** elevación sutil, sombra ligera, borde azul visible, nunca efecto pesado

## Tipografía

```css
--psy-serif: 'Manrope', system-ui, sans-serif; /* Títulos, análisis IA, informes */
--psy-sans: 'DM Sans', system-ui, sans-serif; /* UI general, formularios, descripciones */
--psy-mono: 'DM Mono', monospace; /* Timestamps, IDs, datos técnicos */
```

## Shell del dashboard — estructura obligatoria

```
┌─────────────────────────────────────────────────────┐
│  Topbar: saludo + stats del día + avatar             │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  Panel       │   Contenido principal                 │
│  lateral     │   (fondo --psy-cream)                 │
│  (--psy-     │                                       │
│   paper)     │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
        ▲ Dock flotante inferior (se oculta al scroll)
```

## Regla de oro de UX

> _"Si se siente como un SaaS genérico, lo rehacemos."_

## Inspiración de diseño

Linear, Arc Browser, Things 3, Craft Docs, Raycast.
**NO inspirarse en:** Notion genérico, dashboards con 15 gráficas, purple gradients.

## Tailwind y Tokens

- Usar SIEMPRE tokens semánticos del tema: `bg-psy-*`, `text-psy-*`, `border-psy-*`
- Si un valor ya existe como token, NUNCA usar `bg-[var(--psy-xxx)]`, `text-[var(--psy-xxx)]` ni `border-[var(--psy-xxx)]`
- NUNCA usar clases arbitrarias para radios, spacing o colores: `rounded-[1.5rem]`, `px-[18px]`, `bg-[#FAF4E4]`
- Preferir la escala de Tailwind o un token de tema existente: `rounded-2xl`, `bg-psy-paper`, `text-psy-ink`
- Clases arbitrarias solo para excepciones no cubiertas, y justificadas
