import Link from 'next/link'
import { Eyebrow, Btn, Badge } from '@civicsignal/ui'

const steps = [
  {
    n: '01',
    title: 'A verified human proposes a poll',
    body: 'The proposal includes topic, region, options, cutoff, source-of-truth, and resolution criteria. It appears in the public proposal log immediately.',
    href: '/proposals',
    cta: 'View proposals',
  },
  {
    n: '02',
    title: 'Moderators or panels review it',
    body: 'Admins can approve into a draft poll, request changes, reject with notes, or reconsider an appeal. Curation is visible instead of hidden.',
    href: '/admin',
    cta: 'Admin queue',
  },
  {
    n: '03',
    title: 'Voting opens, but the tally stays sealed',
    body: 'Verified users vote before cutoff. Receipts are issued, votes remain hidden, and commitments make post-cutoff tampering detectable.',
    href: '/polls',
    cta: 'Active polls',
  },
  {
    n: '04',
    title: 'Resolution uses the named source',
    body: 'The resolver records outcome, evidence URL, timestamp, and notes against the pre-declared source-of-truth.',
    href: '/archive',
    cta: 'Resolved archive',
  },
  {
    n: '05',
    title: 'Disputes go to trusted panels',
    body: 'Evidence packets and panel reviews are preserved so hard cases become auditable civic judgments rather than private moderation calls.',
    href: '/panels',
    cta: 'Trusted panels',
  },
  {
    n: '06',
    title: 'Reputation updates only after truth is known',
    body: 'Topic reputation is non-transferable and earned only by being right on resolved polls. It cannot be bought, traded, or staked.',
    href: '/leaderboard',
    cta: 'Leaderboard',
  },
]

const checks = [
  'Public proposal log',
  'Source templates',
  'Moderation notes',
  'Sealed vote receipts',
  'Resolution evidence',
  'Dispute review trail',
  'Topic reputation events',
  'Open-source verifier path',
]

export const DemoPage = () => (
  <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 40px 96px' }}>
      <section style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'end', borderBottom: '1px solid var(--color-parchment-line)', paddingBottom: 34 }}>
        <div>
          <Eyebrow>Civic loop demo</Eyebrow>
          <h1 style={{ margin: '14px 0 0', fontSize: 54, lineHeight: 1.04, fontWeight: 500, letterSpacing: '-0.028em', color: 'var(--color-parchment-ink)' }}>
            From public question to auditable outcome.
          </h1>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.58, color: 'var(--color-parchment-ink-soft)' }}>
            CivicSignal is not just a poll form. It is a civic record: proposals, moderation, voting, resolution, disputes, panels, and reputation all leave a public trail.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Link href="/proposals"><Btn kind="primary" size="md">Propose a poll</Btn></Link>
            <Link href="/verify"><Btn kind="ghost" size="md">Inspect audit log</Btn></Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 32, marginTop: 36 }} className="cs-detail-grid">
        <div style={{ borderTop: '1px solid var(--color-parchment-line)' }}>
          {steps.map((step) => (
            <div key={step.n} style={{ display: 'grid', gridTemplateColumns: '86px 1fr 140px', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--color-parchment-line-soft)', alignItems: 'start' }}>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--color-parchment-muted)', letterSpacing: '0.06em' }}>{step.n}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 21, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--color-parchment-ink)' }}>{step.title}</h2>
                <p style={{ margin: '9px 0 0', fontSize: 14, lineHeight: 1.58, color: 'var(--color-parchment-ink-soft)' }}>{step.body}</p>
              </div>
              <Link href={step.href} style={{ fontSize: 12.5, color: 'var(--color-parchment-accent)', textDecoration: 'none', justifySelf: 'end', marginTop: 3 }}>{step.cta} →</Link>
            </div>
          ))}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
            <Eyebrow>Trust surfaces</Eyebrow>
            <h2 style={{ margin: '10px 0 8px', fontSize: 22, fontWeight: 500, color: 'var(--color-parchment-ink)' }}>What must be visible</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-parchment-ink-soft)' }}>If a decision changes civic truth, the public should be able to see where it came from.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {checks.map((check) => <Badge key={check} tone="neutral" mono>{check}</Badge>)}
            </div>
          </div>

          <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
            <Eyebrow>Operator test</Eyebrow>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-parchment-ink-soft)' }}>
              The deployment includes a smoke harness that exercises the full loop: proposal → moderation → appeal → approval → poll → vote → resolution → dispute → panel review.
            </p>
            <div className="font-mono" style={{ marginTop: 14, fontSize: 11, color: 'var(--color-parchment-green)' }}>SMOKE_OK proposal-lifecycle</div>
          </div>
        </aside>
      </section>
    </main>
  </div>
)
