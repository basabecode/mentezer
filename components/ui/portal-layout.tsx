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
  blue: 'bg-psy-blue-light text-psy-blue',
  green: 'bg-psy-green-light text-psy-green',
  amber: 'bg-psy-amber-light text-psy-amber',
  ink: 'bg-psy-ink text-white',
  red: 'bg-psy-red-light text-psy-red',
}

const statCardMap: Record<NonNullable<Stat['accent']>, string> = {
  blue:  'border-psy-blue/20 bg-psy-blue-light',
  green: 'border-psy-green/20 bg-psy-green-light',
  amber: 'border-psy-amber/20 bg-psy-amber-light',
  ink:   'border-psy-ink bg-psy-ink',
  red:   'border-psy-red/20 bg-psy-red-light',
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
        'mx-auto w-full px-3 py-4 pb-24 sm:px-4 sm:pb-6 md:px-6 md:py-6 lg:pb-4',
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
    <section className="relative overflow-hidden rounded-[2rem] border border-psy-ink/8 bg-white p-6 shadow-[0_18px_44px_rgba(13,34,50,0.06)] md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(62,129,151,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(127,155,121,0.10),transparent_26%),linear-gradient(180deg,rgba(250,252,252,0.96)_0%,rgba(255,255,255,1)_100%)]" />
      <div className={cn('relative grid gap-6', aside ? 'xl:grid-cols-[1.05fr_0.95fr] xl:items-end' : '')}>
        <div>
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-psy-blue">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-psy-ink md:text-4xl">
            {title}
          </h1>
          {description ? (
            <div className="mt-4 max-w-3xl text-sm leading-7 text-psy-muted md:text-base md:leading-8">
              {description}
            </div>
          ) : null}
          {actions?.length ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {actions.map(action => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={cn(
                    'lift-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold',
                    action.variant === 'secondary'
                      ? 'border border-psy-border bg-white text-psy-ink shadow-sm'
                      : 'bg-psy-ink text-white shadow-xl shadow-psy-ink/20'
                  )}
                >
                  {action.icon}
                  {action.label}
                  {action.variant === 'secondary' ? null : <ArrowRight size={15} />}
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
    ink:   'text-psy-paper',
    red:   'text-psy-red',
  }
  const hintColorMap: Record<NonNullable<Stat['accent']>, string> = {
    blue:  'text-psy-muted',
    green: 'text-psy-muted',
    amber: 'text-psy-muted',
    ink:   'text-psy-paper opacity-60',
    red:   'text-psy-muted',
  }
  const labelColorMap: Record<NonNullable<Stat['accent']>, string> = {
    blue:  'text-psy-ink',
    green: 'text-psy-ink',
    amber: 'text-psy-ink',
    ink:   'text-psy-paper opacity-80',
    red:   'text-psy-ink',
  }
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(stat => {
        const accent = stat.accent ?? 'blue'
        const accentCls = accentMap[accent]
        const surface = statCardMap[accent]
        const valueColor = valueColorMap[accent]
        const hintColor = hintColorMap[accent]
        const labelColor = labelColorMap[accent]
        return (
          <div
            key={stat.label}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
              surface
            )}
          >
            <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-xl', accentCls)}>
              <span className="h-2 w-2 rounded-full bg-current" />
            </div>
            <p className={cn('mt-3 font-serif text-3xl font-bold tracking-tight', valueColor)}>
              {stat.value}
            </p>
            <p className={cn('mt-1 text-xs font-semibold', labelColor)}>{stat.label}</p>
            {stat.hint ? <p className={cn('mt-0.5 text-[11px]', hintColor)}>{stat.hint}</p> : null}
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
        'relative overflow-hidden rounded-2xl border border-psy-border bg-white p-5 shadow-[0_8px_20px_rgba(13,34,50,0.04)]',
        className
      )}
    >
      {/* Accent bar top */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-psy-blue via-psy-purple to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight text-psy-ink md:text-2xl">
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
    <div className="rounded-[1.75rem] border border-[#dce8ed] bg-[linear-gradient(180deg,#f8fbfc_0%,#ffffff_100%)] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <p className="font-serif text-xl font-semibold tracking-tight text-psy-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-psy-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
