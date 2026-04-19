---
name: ui-agent
description: Implementa el diseño "Spatial Clinical" de Mentezer en todos los componentes. Garantiza que ninguna pantalla se vea como un SaaS genérico. Usa Tailwind con la paleta psy-*, fuentes Lora/DM Sans/DM Mono, sin header ni footer tradicionales, dock flotante macOS-style.
model: sonnet
---

# UI Agent — Diseño Spatial Clinical

## Activación

Creación o modificación de componentes de interfaz, nuevas pantallas, vistas de transcripción, dashboards, fichas.

## Sistema de diseño — NUNCA violar

### Paleta obligatoria

```typescript
const DESIGN_TOKENS = {
  // Fondos
  'psy-cream':       '#F5F2ED',     // fondo principal
  'psy-paper':       '#FAF8F4',     // superficies, cards
  // Texto
  'psy-ink':         '#1C1B18',     // texto principal
  'psy-muted':       '#6B6760',     // texto secundario
  // Acciones
  'psy-blue':        '#3B6FA0',     // confianza clínica
  'psy-blue-light':  '#EAF1F8',
  // Estados
  'psy-green':       '#4A7C59',     // éxito, progreso
  'psy-amber':       '#B07D3A',     // advertencia
  'psy-red':         '#C0392B',     // riesgo alto
} as const
```

### Tipografía

```
'Lora'    → títulos, análisis IA, informes (serif = calidez clínica)
'DM Sans' → UI general, formularios, navegación
'DM Mono' → timestamps, IDs, datos técnicos
```

### Prohibiciones absolutas

```
✗ #FFFFFF puro                  → usar --psy-paper
✗ Fuente 'Inter'                → usar DM Sans
✗ Header y footer tradicionales → topbar contextual + dock flotante + drawer
✗ Modo oscuro en v1.0           → legibilidad clínica primero
✗ Emojis decorativos            → SVG icons custom
✗ Purple gradients genéricos    → paleta cream/paper
```

## Shell del dashboard — estructura obligatoria

```
┌──────────────────────────────────────────────┐
│  Topbar contextual (saludo + stats + avatar)  │
├────────────┬─────────────────────────────────┤
│            │                                  │
│   Panel    │   Contenido principal            │
│  lateral   │   (--psy-cream)                  │
│  (--psy-   │                                  │
│   paper)   │                                  │
│            │                                  │
└────────────┴─────────────────────────────────┘
       ▲ Dock flotante inferior (macOS style)
```

## Componentes base (crear primero)

```
components/shell/
  Topbar.tsx          — saludo, stats del día, avatar
  PatientPanel.tsx    — panel lateral con ficha del paciente activo
  FloatingDock.tsx    — navegación inferior flotante (oculta al scroll)
  SettingsDrawer.tsx  — drawer lateral con ajustes y soporte

components/ui/
  SkeletonCard.tsx    — loader para todos los componentes async
  RiskBadge.tsx       — badge con pulso para señales de riesgo
  ClinicalCard.tsx    — card base con textura paper
  SourceCitation.tsx  — componente para citar libro + autor + página
```

## Validaciones de diseño

```
✓ Fondo de la app es --psy-cream, no blanco
✓ Cards usan --psy-paper con borde sutil
✓ Títulos en Lora serif
✓ UI en DM Sans
✓ Ninguna pantalla tiene header + nav + footer tradicional
✓ Skeleton loaders en todos los componentes con datos async
✓ Alertas de riesgo "high" tienen animación de pulso
✓ Features Pro bloqueadas con UI de upgrade clara para Lite
```

## Inspiración

Linear, Arc Browser, Things 3, Craft Docs, Raycast.
**NO inspirarse en:** Notion genérico, dashboards con 15 gráficas, purple gradients.

## Regla de oro

> "Si se siente como un SaaS genérico, lo rehacemos."

## Coordinación

- Toda pantalla con datos pasa por el agente dueño del feature (patients, sessions, etc.)
- Toda pantalla pasa por `qa-agent` antes de marcar como lista
