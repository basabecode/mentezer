'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const dashboardHomeSegments = new Set([
  'dashboard',
  'patients',
  'sessions',
  'cases',
  'knowledge',
  'reports',
  'finance',
  'schedule',
  'settings',
  'support',
])

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

function getHomeCrumb(firstSegment?: string) {
  if (firstSegment === 'admin') {
    return { href: '/', label: 'Inicio web' }
  }

  if (firstSegment && dashboardHomeSegments.has(firstSegment)) {
    return { href: '/', label: 'Inicio web' }
  }

  return { href: '/', label: routeLabels[''] }
}

function getContextCrumb(firstSegment?: string) {
  if (firstSegment === 'admin') {
    return { href: '/admin', label: 'Administración' }
  }

  if (firstSegment && dashboardHomeSegments.has(firstSegment)) {
    return { href: '/dashboard', label: 'Panel' }
  }

  return null
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Don't show on home page
  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const homeCrumb = getHomeCrumb(segments[0])
  const contextCrumb = getContextCrumb(segments[0])
  const entries = segments.map((segment, index) => ({
    segment,
    href: `/${segments.slice(0, index + 1).join('/')}`,
    previousSegment: segments[index - 1],
    nextSegment: segments[index + 1],
  }))
  const navigableEntries =
    segments[0] === 'admin' || segments[0] === 'dashboard' ? entries.slice(1) : entries

  let visibleEntries = navigableEntries.slice(-2)
  let showEllipsis = navigableEntries.length > visibleEntries.length

  if (segments.length === 1 && (segments[0] === 'dashboard' || segments[0] === 'admin')) {
    visibleEntries = []
    showEllipsis = false
  } else if (segments[segments.length - 1] === 'new') {
    visibleEntries = navigableEntries.slice(-1)
    showEllipsis = navigableEntries.length > 1
  }
  
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.15em] text-psy-muted sm:text-xs"
    >
      <Link href={homeCrumb.href} className="shrink-0 transition hover:text-psy-blue">
        {homeCrumb.label}
      </Link>

      {contextCrumb ? (
        <>
          <span className="shrink-0 font-bold text-psy-ink/20">/</span>
          {visibleEntries.length === 0 ? (
            <span
              className="max-w-[11rem] truncate font-medium text-psy-ink/50"
              aria-current="page"
            >
              {contextCrumb.label}
            </span>
          ) : (
            <Link
              href={contextCrumb.href}
              className="max-w-[10rem] shrink-0 truncate transition hover:text-psy-blue"
            >
              {contextCrumb.label}
            </Link>
          )}
        </>
      ) : null}

      {showEllipsis ? (
        <>
          <span className="shrink-0 font-bold text-psy-ink/20">/</span>
          <span className="shrink-0 font-medium text-psy-ink/40">…</span>
        </>
      ) : null}

      {visibleEntries.map(({ segment, href, previousSegment, nextSegment }, index) => {
        const isLast = index === visibleEntries.length - 1
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
