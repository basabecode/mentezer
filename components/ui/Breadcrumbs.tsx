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
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.15em] text-psy-muted">
      <Link 
        href="/" 
        className="transition hover:text-psy-blue"
      >
        {routeLabels['']}
      </Link>
      
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        
        return (
          <Fragment key={href}>
            <span className="text-psy-ink/20 font-bold">/</span>
            {isLast ? (
              <span className="text-psy-ink/50 font-medium" aria-current="page">
                {label}
              </span>
            ) : (
              <Link 
                href={href}
                className="transition hover:text-psy-blue"
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
