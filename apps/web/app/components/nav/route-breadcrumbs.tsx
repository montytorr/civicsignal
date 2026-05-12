'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  polls: 'Active polls',
  proposals: 'Proposals',
  demo: 'Demo',
  archive: 'Archive',
  methodology: 'Methodology',
  roadmap: 'Roadmap',
  leaderboard: 'Leaderboard',
  panels: 'Trusted panels',
  verify: 'Public audit',
  admin: 'Admin',
  invites: 'Invites',
  auth: 'Account',
  signin: 'Sign in',
  signup: 'Create account',
  u: 'Reputation',
  resolved: 'Resolution',
}

const isUuidLike = (segment: string) => /^[0-9a-f]{8}-/i.test(segment)
const humanize = (segment: string) => {
  if (isUuidLike(segment)) return `Poll ${segment.slice(0, 8)}`
  return LABELS[segment] ?? decodeURIComponent(segment).replace(/-/g, ' ')
}

export const RouteBreadcrumbs = () => {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    return {
      href,
      label: humanize(segment),
      current: index === segments.length - 1,
    }
  })

  return (
    <div className="border-b border-parchment-line-soft bg-parchment-bg/95">
      <div
        className="cs-page-pad flex items-center gap-2 overflow-x-auto whitespace-nowrap"
        style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 12, paddingBottom: 12 }}
      >
        <Link
          href="/"
          className="font-mono text-parchment-muted hover:text-parchment-ink-soft transition-colors"
          style={{ fontSize: 11, letterSpacing: '0.04em' }}
        >
          Home
        </Link>
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="inline-flex items-center gap-2">
            <span className="text-parchment-muted-soft" style={{ fontSize: 11 }}>/</span>
            {crumb.current ? (
              <span
                className="font-mono text-parchment-ink-soft"
                style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="font-mono text-parchment-muted hover:text-parchment-ink-soft transition-colors"
                style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
