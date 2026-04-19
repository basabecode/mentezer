'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const routeLabels: Record<string, string> = {
  '': 'Inicio',
  'demo': 'Demostración',
  'login': 'Ingresar',
  'register': 'Registro',
  'onboarding': 'Configuración',
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
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        
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
