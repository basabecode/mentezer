# DESIGN_SYSTEM.md — Spatial Clinical

## ADN de diseño

Un producto clínico no necesita animaciones flashy — necesita **calma inteligente**.
Cada elemento comunica profesionalismo, confianza y atención al detalle.

### Principios visuales — NUNCA violar

- **Sin header tradicional** — Topbar contextual: saludo + stats del día + avatar
- **Sin footer tradicional** — Drawer lateral con legal, ajustes y soporte
- **Dock flotante inferior** — Navegación tipo macOS, se esconde al scroll
- **Textura de papel clínico** — `#FAF8F4`, NUNCA blanco puro `#FFFFFF`
- **Tipografía editorial** — `Lora` para títulos, `DM Sans` para UI, `DM Mono` para datos
- **Alertas con pulso** — señales de riesgo "high" tienen animación de pulso
- **Sin emojis decorativos** — SVG custom o íconos minimalistas

## Paleta de colores

```css
/* Fondos de sección — alternar para crear ritmo visual */
--psy-cream: #c8e6f2;        /* Secciones teal (hero, para quién encaja) */
--psy-paper: #dff3f8;        /* Superficies internas */
--psy-purple-light: #edeaf8; /* Secciones lavanda (deliverables, pricing, FAQ) */
/* Secciones blancas: bg-white (pain points, trial steps, FAQ) */

/* Texto */
--psy-ink:    #0d2232; /* Texto principal — navy */
--psy-muted:  #456b7e; /* Texto secundario */
--psy-border: rgba(13, 34, 50, 0.10);

/* Primario — teal clínico */
--psy-blue:        #1586a0;
--psy-blue-light:  #d4eff5;

/* Acento secundario — lavanda/salud mental */
--psy-purple:       #7060b0;
--psy-purple-light: #edeaf8;

/* Estados */
--psy-green:        #27895e; /* Progreso, éxito */
--psy-green-light:  #d4efe4;
--psy-amber:        #c07a18; /* Advertencia */
--psy-amber-light:  #fef0d2;
--psy-red:          #c0392b; /* Riesgo alto */
--psy-red-light:    #fdecea;
```

## Regla de secciones (landing page)

```
Hero              → bg-[var(--psy-cream)]    teal
Pain points       → bg-white
Deliverables      → bg-[var(--psy-purple-light)] lavanda
Trial steps       → bg-white
Para quién encaja → bg-[var(--psy-cream)]    teal
Pricing           → bg-[var(--psy-purple-light)] lavanda
FAQ               → bg-white
Final CTA         → bg-[var(--psy-ink)]      navy oscuro
```

## Regla de tarjetas

- **Tarjeta sobre fondo teal o lavanda:** `bg-white` siempre — nunca bg-tintado
- **Hover de tarjeta:** eleva 5px, sombra 64px, borde teal visible, fondo blanco puro

## Tipografía

```css
--psy-serif: 'Lora', Georgia, serif; /* Títulos, análisis IA, informes */
--psy-sans: 'DM Sans', system-ui; /* UI general, formularios */
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
