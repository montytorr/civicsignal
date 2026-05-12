import Link from 'next/link'
import { Eyebrow, TopicBadge, Badge } from '@civicsignal/ui'

type ResolvedPoll = {
  id: string
  question: string
  topic_id: string
  region: string
  options: string[]
  resolved_at: string | null
  resolves_at: string
  outcome: string | null
  topics: { slug: string; label: string } | null
}

const formatDate = (iso: string) => iso.split('T')[0]

const ArchiveCard = ({ poll }: { poll: ResolvedPoll }) => {
  const resolvedDate = poll.resolved_at ? formatDate(poll.resolved_at) : formatDate(poll.resolves_at)

  return (
    <Link
      href={`/polls/${poll.id}/resolved`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: 'var(--color-parchment-surface)',
        border: '1px solid var(--color-parchment-line)',
        borderRadius: 4,
        padding: '20px 22px 18px',
        textDecoration: 'none',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
      className="hover:border-parchment-ink"
    >
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {poll.topics?.slug && <TopicBadge topicId={poll.topics.slug} />}
        <span style={{ display: 'inline-block', width: 1, height: 12, background: 'var(--color-parchment-line)', flexShrink: 0 }} />
        <span
          className="font-mono"
          style={{
            fontSize: 10.5,
            color: 'var(--color-parchment-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {poll.region}
        </span>
        <span style={{ flex: 1 }} />
        <Badge tone="green" mono>
          Resolved · {resolvedDate}
        </Badge>
      </div>

      {/* Question */}
      <h3 style={{
        margin: 0,
        fontSize: 18,
        fontWeight: 500,
        lineHeight: 1.3,
        color: 'var(--color-parchment-ink)',
        letterSpacing: '-0.01em',
      }}>
        {poll.question}
      </h3>

      {/* Outcome */}
      {poll.outcome && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 12px',
          background: 'var(--color-parchment-bg)',
          border: '1px solid var(--color-parchment-green)',
          borderRadius: 3,
          alignSelf: 'flex-start',
        }}>
          <svg width="12" height="12" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path
              d="M5 10 L9 14 L15 6"
              fill="none"
              stroke="var(--color-parchment-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-parchment-ink)',
            letterSpacing: '-0.005em',
          }}>
            {poll.outcome}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 14,
        borderTop: '1px solid var(--color-parchment-line-soft, var(--color-parchment-line))',
      }}>
        <span className="font-mono" style={{ fontSize: 10.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em' }}>
          {poll.options.length} OPTIONS
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-parchment-ink-soft)' }}>
          View resolution →
        </span>
      </div>
    </Link>
  )
}

export const ArchivePage = ({ polls }: { polls: ResolvedPoll[] }) => {
  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ padding: '40px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div>
            <Eyebrow>Resolved polls</Eyebrow>
            <h1 style={{
              margin: '8px 0 0', fontSize: 36, fontWeight: 500,
              letterSpacing: '-0.02em', color: 'var(--color-parchment-ink)',
            }}>
              Public archive
            </h1>
          </div>
          <div className="font-mono" style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 26, color: 'var(--color-parchment-ink)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {polls.length}
            </div>
            <Eyebrow>Polls resolved</Eyebrow>
          </div>
        </div>

        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--color-parchment-ink-soft)', maxWidth: 600 }}>
          Every resolved poll is permanently on the record. Outcomes are confirmed against a named public source committed before voting closed.
        </p>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid var(--color-parchment-line)', marginTop: 20, marginBottom: 28 }} />

        {/* Grid */}
        {polls.length === 0 ? (
          <div style={{
            padding: '48px 28px',
            background: 'var(--color-parchment-surface)',
            border: '1px solid var(--color-parchment-line)',
            borderRadius: 4,
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-parchment-muted)',
          }}>
            No polls have been resolved yet.
          </div>
        ) : (
          <div className="cs-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {polls.map((poll) => (
              <ArchiveCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
