'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const routeLabels: Record<string, string> = {
  '': 'Inicio',
  'dashboard': 'Panel',
  'demo': 'Demostración',
  'login': 'Ingresar',
  'register': 'Registro',
  'onboarding': 'Configuración',
  'patients': 'Pacientes',
  'sessions': 'Sesiones',
  'cases': 'Casos',
  'knowledge': 'Biblioteca',
  'upload': 'Subir documento',
  'reports': 'Informes',
  'finance': 'Finanzas',
  'schedule': 'Agenda',
  'settings': 'Configuración',
  'privacy': 'Privacidad',
  'support': 'Soporte',
  'legal': 'Legal',
  'terms': 'Términos',
  'admin': 'Administración',
  'clients': 'Clientes',
}

const singularLabels: Record<string, string> = {
  'patients': 'Paciente',
  'sessions': 'Sesión',
  'cases': 'Caso',
  'clients': 'Cliente',
}

function formatSegmentLabel(
  segment: string,
  previousSegment?: string,
  nextSegment?: string,
) {
  if (routeLabels[segment]) {
    return routeLabels[segment]
  }

  if (segment === 'new') {
    if (previousSegment === 'patients') return 'Nuevo paciente'
    if (previousSegment === 'sessions') return 'Nueva sesión'
    if (previousSegment === 'cases') return 'Nuevo caso'
    if (previousSegment === 'clients') return 'Nuevo cliente'
    return 'Nuevo'
  }

  if (previousSegment && singularLabels[previousSegment]) {
    if (nextSegment === 'reports') {
      return singularLabels[previousSegment]
    }

    return `${singularLabels[previousSegment]}`
  }

  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Don't show on home page
  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const visibleSegments = segments.slice(-2)
  const hiddenCount = segments.length - visibleSegments.length
  
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.15em] text-psy-muted sm:text-xs"
    >
      <Link href="/" className="shrink-0 transition hover:text-psy-blue">
        {routeLabels['']}
      </Link>

      {hiddenCount > 0 ? (
        <>
          <span className="shrink-0 font-bold text-psy-ink/20">/</span>
          <span className="shrink-0 font-medium text-psy-ink/40">…</span>
        </>
      ) : null}

      {visibleSegments.map((segment, index) => {
        const actualIndex = hiddenCount + index
        const href = `/${segments.slice(0, actualIndex + 1).join('/')}`
        const isLast = actualIndex === segments.length - 1
        const previousSegment = segments[actualIndex - 1]
        const nextSegment = segments[actualIndex + 1]
        const label = formatSegmentLabel(segment, previousSegment, nextSegment)
        
        return (
          <Fragment key={href}>
            <span className="shrink-0 font-bold text-psy-ink/20">/</span>
            {isLast ? (
              <span
                className="max-w-[12rem] truncate font-medium text-psy-ink/50"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="max-w-[10rem] shrink-0 truncate transition hover:text-psy-blue"
              >
                {label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
