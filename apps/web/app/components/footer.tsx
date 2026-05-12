import Link from 'next/link'
import { CsWordmark } from '@civicsignal/ui'

const PLATFORM_LINKS = [
  { label: 'Active polls', href: '/polls' },
  { label: 'Proposals', href: '/proposals' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Admin', href: '/admin' },
]

const PROJECT_LINKS = [
  { label: 'Governance', href: '/roadmap#governance' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Trusted panels', href: '/panels' },
  { label: 'Archive', href: '/archive' },
  { label: 'Invites', href: '/invites' },
]

const OPEN_LINKS = [
  { label: 'GitHub', href: 'https://github.com/montytorr/civicsignal', external: true },
  { label: 'Public audit', href: '/verify' },
  { label: 'License (MPL-2.0)', href: 'https://github.com/montytorr/civicsignal/blob/main/LICENSE', external: true },
  { label: 'Contributing', href: 'https://github.com/montytorr/civicsignal/blob/main/CONTRIBUTING.md', external: true },
]

const FooterLink = ({
  href,
  label,
  external,
}: {
  href: string
  label: string
  external?: boolean
}) =>
  external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-parchment-muted hover:text-parchment-ink-soft transition-colors no-underline"
      style={{ fontSize: 12.5 }}
    >
      {label}
    </a>
  ) : (
    <Link
      href={href}
      className="text-parchment-muted hover:text-parchment-ink-soft transition-colors no-underline"
      style={{ fontSize: 12.5 }}
    >
      {label}
    </Link>
  )

export const Footer = () => (
  <footer className="border-t border-parchment-line">
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 32px' }}>
      <div
        className="grid gap-[40px]"
        style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}
      >
        <div className="flex flex-col gap-3">
          <CsWordmark size={17} />
          <p
            className="text-parchment-muted leading-[1.6] m-0"
            style={{ fontSize: 12.5 }}
          >
            Public-good civic infrastructure for verified-human polling on real-world events. Built in the open under the MPL-2.0.
          </p>
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase text-parchment-ink-soft mb-1">
            Platform
          </span>
          {PLATFORM_LINKS.map((l) => (
            <FooterLink key={l.href} {...l} />
          ))}
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase text-parchment-ink-soft mb-1">
            Project
          </span>
          {PROJECT_LINKS.map((l) => (
            <FooterLink key={l.href} {...l} />
          ))}
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase text-parchment-ink-soft mb-1">
            Open
          </span>
          {OPEN_LINKS.map((l) => (
            <FooterLink key={l.href} {...l} />
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t border-parchment-line-soft"
        style={{ marginTop: 8, paddingTop: 18 }}
      >
        <span
          className="font-mono text-parchment-muted"
          style={{ fontSize: 11.5 }}
        >
          civicsignal · v0.1.0-beta
        </span>
        <span
          className="font-mono text-parchment-muted"
          style={{ fontSize: 11.5 }}
        >
          MPL-2.0 · No tracking · No accounts you can sell
        </span>
      </div>
    </div>
  </footer>
)
