import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Action = {
  href: string
  label: string
  icon?: ReactNode
  variant?: 'primary' | 'secondary'
}

type Stat = {
  label: string
  value: string | number
  hint?: string
  accent?: 'blue' | 'green' | 'amber' | 'ink' | 'red'
}

const accentMap: Record<NonNullable<Stat['accent']>, string> = {
  blue:  'bg-psy-blue-light text-psy-blue',
  green: 'bg-psy-green-light text-psy-green',
  amber: 'bg-psy-amber-light text-psy-amber',
  ink:   'bg-psy-ink text-white',
  red:   'bg-psy-red-light text-psy-red',
}

const statCardMap: Record<NonNullable<Stat['accent']>, string> = {
  blue:  'border-psy-blue/15 bg-psy-blue-light',
  green: 'border-psy-green/15 bg-psy-green-light',
  amber: 'border-psy-amber/15 bg-psy-amber-light',
  ink:   'border-psy-ink/80 bg-psy-ink',
  red:   'border-psy-red/15 bg-psy-red-light',
}

export function PortalPage({
  children,
  size = 'xl',
}: {
  children: ReactNode
  size?: 'lg' | 'xl' | 'full'
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-3 py-5 pb-24 sm:px-4 sm:pb-6 md:px-6 md:py-6 lg:pb-6',
        size === 'lg' ? 'max-w-5xl' : size === 'full' ? 'max-w-[1440px]' : 'max-w-6xl'
      )}
    >
      {children}
    </div>
  )
}

export function PortalHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: Action[]
  aside?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border bg-white shadow-[0_12px_32px_rgba(13,34,50,0.06)]" style={{ borderColor: 'var(--psy-warm-border)' }}>
      {/* Subtle gradient texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(62,129,151,0.10),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(127,155,121,0.08),transparent_32%)]" />

      <div className={cn('relative p-6 md:p-8', aside ? 'grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end' : '')}>
        <div>
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-psy-blue">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-[2rem] font-bold tracking-tight text-psy-ink md:text-[2.5rem]">
            {title}
          </h1>
          {description ? (
            <div className="mt-3 max-w-2xl text-sm leading-7 text-psy-muted md:text-[15px]">
              {description}
            </div>
          ) : null}
          {actions?.length ? (
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {actions.map(action => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={cn(
                    'lift-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold',
                    action.variant === 'secondary'
                      ? 'border bg-white text-psy-ink shadow-sm hover:shadow-md'
                      : 'bg-psy-ink text-white shadow-[0_8px_20px_rgba(46,46,46,0.18)] hover:shadow-[0_12px_28px_rgba(46,46,46,0.24)]'
                  )}
                  style={action.variant === 'secondary' ? { borderColor: 'var(--psy-warm-border)' } : {}}
                >
                  {action.icon}
                  {action.label}
                  {action.variant === 'secondary' ? null : <ArrowRight size={14} />}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </section>
  )
}

export function PortalStatGrid({ stats }: { stats: Stat[] }) {
  const valueColorMap: Record<NonNullable<Stat['accent']>, string> = {
    blue:  'text-psy-blue',
    green: 'text-psy-green',
    amber: 'text-psy-amber',
    ink:   'text-white',
    red:   'text-psy-red',
  }
  const labelColorMap: Record<NonNullable<Stat['accent']>, string> = {
    blue:  'text-psy-ink/80',
    green: 'text-psy-ink/80',
    amber: 'text-psy-ink/80',
    ink:   'text-white/75',
    red:   'text-psy-ink/80',
  }
  const hintColorMap: Record<NonNullable<Stat['accent']>, string> = {
    blue:  'text-psy-muted',
    green: 'text-psy-muted',
    amber: 'text-psy-muted',
    ink:   'text-white/50',
    red:   'text-psy-muted',
  }

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(stat => {
        const accent = stat.accent ?? 'blue'
        const surface = statCardMap[accent]
        const valueColor = valueColorMap[accent]
        const labelColor = labelColorMap[accent]
        const hintColor = hintColorMap[accent]

        return (
          <div
            key={stat.label}
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
              surface
            )}
          >
            <p className={cn('font-mono text-[9px] uppercase tracking-[0.28em]', hintColor)}>
              {stat.label}
            </p>
            <p className={cn('mt-3 font-serif text-4xl font-bold tracking-tight leading-none', valueColor)}>
              {stat.value}
            </p>
            {stat.hint ? (
              <p className={cn('mt-1.5 text-[11px]', hintColor)}>{stat.hint}</p>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}

export function PortalSection({
  eyebrow,
  title,
  action,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 shadow-[0_6px_16px_rgba(13,34,50,0.04)]',
        className
      )}
      style={{ borderColor: className?.includes('bg-psy-ink') ? 'rgba(255,255,255,0.1)' : 'var(--psy-warm-border)', backgroundColor: className?.includes('bg-psy-ink') ? undefined : 'white' }}
    >
      {/* Accent bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-psy-blue/60 via-psy-green/40 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className={cn('font-mono text-[10px] uppercase tracking-[0.28em]', className?.includes('bg-psy-ink') ? 'text-white/40' : 'text-psy-blue')}>
              {eyebrow}
            </p>
          ) : null}
          <h2 className={cn('mt-1.5 font-serif text-xl font-bold tracking-tight md:text-2xl', className?.includes('bg-psy-ink') ? 'text-white' : 'text-psy-ink')}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function PortalEmpty({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[2rem] border bg-gradient-to-b from-[#f8fbfc] to-white px-5 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" style={{ borderColor: 'var(--psy-warm-border)' }}>
      <p className="font-serif text-xl font-semibold tracking-tight text-psy-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-psy-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
