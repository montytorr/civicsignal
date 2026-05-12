import Link from 'next/link'
import { Eyebrow, TopicBadge, Badge } from '@civicsignal/ui'
import { DisputeForm } from './dispute-form'

interface Props {
  id: string
  question: string
  topicSlug: string
  region: string
  resolvedAt: string
  outcome: string
  options: string[]
  participants: number
  source: string
  sourceUrl: string | null
  notes: string | null
  commitmentHash: string | null
  topicLabel: string | null
}

export const ResolvedPage = ({
  id,
  question,
  topicSlug,
  region,
  resolvedAt,
  outcome,
  options,
  participants,
  source,
  sourceUrl,
  notes,
  commitmentHash,
  topicLabel,
}: Props) => {
  const resolvedDate = resolvedAt.split('T')[0]
  const resolvedDisplay = resolvedAt.replace('T', ' · ').replace('Z', ' UTC')
  const reputationLabel = topicLabel ? `+1 ${topicLabel}` : '+1'

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ padding: '32px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Back link */}
        <Link
          href="/archive"
          className="font-mono"
          style={{ fontSize: 11.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em', textDecoration: 'none', cursor: 'pointer' }}
        >
          ← BACK TO ARCHIVE
        </Link>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
          <TopicBadge topicId={topicSlug} />
          <span style={{ width: 1, height: 12, background: 'var(--color-parchment-line)' }} />
          <span
            className="font-mono"
            style={{ fontSize: 10.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {region}
          </span>
          <span style={{ width: 1, height: 12, background: 'var(--color-parchment-line)' }} />
          <Badge tone="green" mono>Resolved · {resolvedDate}</Badge>
        </div>

        {/* Question */}
        <h1 style={{ margin: '20px 0 0', fontSize: 36, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--color-parchment-ink)', textWrap: 'balance' as React.CSSProperties['textWrap'], maxWidth: 880 }}>
          {question}
        </h1>

        {/* Two-column grid */}
        <div className="cs-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, marginTop: 40 }}>
          {/* Left col */}
          <div>
            <Eyebrow>Outcome</Eyebrow>

            {/* Outcome banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, padding: '24px 28px', background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-green)', borderRadius: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--color-parchment-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M5 10 L9 14 L15 6" fill="none" stroke="var(--color-parchment-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--color-parchment-ink)', letterSpacing: '-0.01em' }}>
                  {outcome}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 11, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em', marginTop: 2 }}
                >
                  RESOLVED · {resolvedDisplay}
                </div>
              </div>
            </div>

            {/* Vote distribution */}
            <div style={{ marginTop: 28 }}>
              <Eyebrow>Vote distribution · revealed</Eyebrow>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {options.map((opt) => {
                  const winner = opt === outcome
                  return (
                    <div key={opt}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-parchment-ink)' }}>
                          {opt}
                          {winner && (
                            <span
                              className="font-mono"
                              style={{ marginLeft: 8, fontSize: 10, color: 'var(--color-parchment-green)', letterSpacing: '0.04em' }}
                            >
                              · OUTCOME
                            </span>
                          )}
                        </span>
                        <span
                          className="font-mono"
                          style={{ fontSize: 13, color: 'var(--color-parchment-muted)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          —
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--color-parchment-surface-alt)', borderRadius: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: winner ? '100%' : '0%',
                            height: '100%',
                            background: winner ? 'var(--color-parchment-green)' : 'var(--color-parchment-ink-soft)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                className="font-mono"
                style={{ marginTop: 14, fontSize: 11, color: 'var(--color-parchment-muted)', letterSpacing: '0.02em' }}
              >
                {participants.toLocaleString()} verified humans
              </div>
            </div>

            {/* Resolution notes */}
            {notes && (
              <div style={{ marginTop: 28 }}>
                <Eyebrow>Resolution notes</Eyebrow>
                <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--color-parchment-ink-soft)', lineHeight: 1.6 }}>
                  {notes}
                </p>
              </div>
            )}
          </div>

          {/* Right col — aside cards */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Source evidence */}
            <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
              <Eyebrow>Source evidence</Eyebrow>
              <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--color-parchment-ink)', lineHeight: 1.5 }}>
                {source}
              </p>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  className="font-mono"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--color-parchment-accent)', letterSpacing: '0.02em', textDecoration: 'none' }}
                >
                  {sourceUrl} →
                </a>
              )}
            </div>

            {/* Reputation awarded */}
            <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
              <Eyebrow>Reputation awarded to correct answers</Eyebrow>
              <div
                className="font-mono"
                style={{ fontSize: 22, color: 'var(--color-parchment-green)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}
              >
                {reputationLabel}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-parchment-muted)' }}>
                Per verified human · non-transferable
              </p>
            </div>

            {/* Public commitment */}
            {commitmentHash && (
              <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
                <Eyebrow>Public commitment</Eyebrow>
                <p
                  className="font-mono"
                  style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-parchment-ink)' }}
                >
                  {commitmentHash}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-parchment-muted)', lineHeight: 1.5 }}>
                  The full sealed-vote set was committed to the public log before cutoff.{' '}
                  <a href="#" style={{ color: 'var(--color-parchment-accent)', textDecoration: 'none' }}>Verify →</a>
                </p>
              </div>
            )}

            {/* Dispute form — only on resolved (not disputed) polls */}
            <DisputeForm pollId={id} />
          </aside>
        </div>
      </main>
    </div>
  )
}
