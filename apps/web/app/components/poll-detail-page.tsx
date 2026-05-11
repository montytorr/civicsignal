'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eyebrow, TopicBadge, HiddenBadge, Badge, Btn, topicById } from '@civicsignal/ui'
import type { Poll } from '@civicsignal/ui'
import { encryptVoteClient } from '@/lib/encrypt-vote'

interface Props {
  poll: Poll
  existingVote: { encrypted_answer: string; receipt_hash: string; created_at: string } | null
  publicKey: string | null
}

export const PollDetailPage = ({ poll, existingVote, publicKey }: Props) => {
  const [choice, setChoice] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(!!existingVote)
  const [receipt, setReceipt] = useState<{ hash: string; shortHash: string; timestamp: string } | null>(
    existingVote
      ? { hash: existingVote.receipt_hash, shortHash: existingVote.receipt_hash.slice(0, 10) + '…', timestamp: existingVote.created_at }
      : null,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!choice || submitted) return
    setLoading(true)
    setError(null)
    try {
      const encryptedAnswer = publicKey ? encryptVoteClient(choice, publicKey) : choice
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedAnswer }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      setReceipt(json.data.receipt)
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const receiptTs = receipt?.timestamp
    ? new Date(receipt.timestamp).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : null

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ padding: '32px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Back link */}
        <Link
          href="/polls"
          className="font-mono"
          style={{ fontSize: 11.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em', textDecoration: 'none', cursor: 'pointer' }}
        >
          ← BACK TO ACTIVE POLLS
        </Link>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
          <TopicBadge topicId={poll.topic} />
          <span style={{ width: 1, height: 12, background: 'var(--color-parchment-line)' }} />
          <span
            className="font-mono"
            style={{ fontSize: 10.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {poll.region}
          </span>
          <span style={{ width: 1, height: 12, background: 'var(--color-parchment-line)' }} />
          <Badge tone="accent" mono>Poll · {poll.id}</Badge>
        </div>

        {/* Question */}
        <h1 style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--color-parchment-ink)', textWrap: 'balance' as React.CSSProperties['textWrap'], maxWidth: 880 }}>
          {poll.q}
        </h1>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, marginTop: 40 }}>
          {/* Left col — answer */}
          <div>
            <Eyebrow>{submitted ? 'Your answer is sealed' : 'Choose your answer'}</Eyebrow>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {poll.options.map((opt) => {
                const sel = choice === opt
                return (
                  <button
                    key={opt}
                    onClick={() => { if (!submitted) setChoice(opt) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 22px',
                      fontSize: 17,
                      fontWeight: 500,
                      color: sel ? 'var(--color-parchment-bg)' : 'var(--color-parchment-ink)',
                      background: sel ? 'var(--color-parchment-ink)' : 'var(--color-parchment-surface)',
                      border: `1px solid ${sel ? 'var(--color-parchment-ink)' : 'var(--color-parchment-line)'}`,
                      borderRadius: 4,
                      textAlign: 'left',
                      cursor: submitted ? 'default' : 'pointer',
                      letterSpacing: '-0.01em',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span>{opt}</span>
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${sel ? 'var(--color-parchment-bg)' : 'var(--color-parchment-line)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {sel && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-parchment-bg)' }} />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {submitted ? (
              /* Receipt panel */
              <div style={{ marginTop: 24, padding: '18px 22px', background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-green)', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-parchment-green)', flexShrink: 0 }} />
                  <Eyebrow>Receipt · sealed</Eyebrow>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--color-parchment-ink-soft)', lineHeight: 1.55 }}>
                  Your encrypted answer was committed to the public log
                  {receiptTs && (
                    <>
                      {' '}at{' '}
                      <span className="font-mono" style={{ color: 'var(--color-parchment-ink)' }}>{receiptTs}</span>
                    </>
                  )}
                  .
                  {receipt?.shortHash && (
                    <>
                      {' '}Receipt{' '}
                      <span className="font-mono" style={{ color: 'var(--color-parchment-ink)' }}>{receipt.shortHash}</span>.
                    </>
                  )}
                  {' '}You will see the resolution and your reputation update on{' '}
                  <span style={{ color: 'var(--color-parchment-ink)' }}>{poll.resolves}</span>.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <Btn kind="ghost" size="sm">
                    <Link href="/polls" style={{ textDecoration: 'none', color: 'inherit' }}>Back to feed</Link>
                  </Btn>
                  <Btn kind="quiet" size="sm">Verify receipt →</Btn>
                </div>
              </div>
            ) : (
              /* Submit row */
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Btn
                    kind="primary"
                    size="lg"
                    onClick={handleSubmit}
                    style={{ opacity: choice && !loading ? 1 : 0.4, pointerEvents: choice && !loading ? 'auto' : 'none' }}
                  >
                    {loading ? 'Sealing…' : 'Seal my answer'}
                  </Btn>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em' }}>
                    Encrypted client-side · revealed only after cutoff
                  </span>
                </div>
                {error && (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-parchment-crimson)' }}>
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right col — meta cards */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Cutoff card */}
            <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
              <Eyebrow>Cutoff</Eyebrow>
              <div
                className="font-mono"
                style={{ marginTop: 8, fontSize: 28, color: 'var(--color-parchment-ink)', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}
              >
                {poll.cutoffLabel}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-parchment-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {new Date(poll.cutoff).toUTCString().replace('GMT', 'UTC')}
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-parchment-line-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--color-parchment-ink-soft)' }}>
                  <span>Resolves</span>
                  <span>{poll.resolves}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: 12.5, color: 'var(--color-parchment-ink-soft)' }}>
                  <span>Verified humans answering</span>
                  <span
                    className="font-mono"
                    style={{ color: 'var(--color-parchment-ink)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {poll.participants.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Source-of-truth card */}
            <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
              <Eyebrow>Source-of-truth</Eyebrow>
              <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--color-parchment-ink)', lineHeight: 1.5 }}>
                {poll.source}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-parchment-muted)' }}>
                Named before this poll opened. The resolver is bound to this source.
              </p>
            </div>

            {/* Reputation impact card */}
            <div style={{ background: 'var(--color-parchment-surface)', border: '1px solid var(--color-parchment-line)', borderRadius: 4, padding: '20px 22px' }}>
              <Eyebrow>Reputation impact</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span className="font-mono" style={{ fontSize: 22, color: 'var(--color-parchment-green)', fontVariantNumeric: 'tabular-nums' }}>+1</span>
                <span style={{ fontSize: 13, color: 'var(--color-parchment-ink-soft)' }}>
                  {topicById(poll.topic)?.label ?? poll.topic} · if correct
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-parchment-muted)', lineHeight: 1.5 }}>
                You only gain reputation when this resolves and your answer matches the named source. There is no penalty for being wrong.
              </p>
            </div>

            {/* Hidden badge card */}
            <div style={{ padding: '14px 18px', border: '1px dashed var(--color-parchment-line)', borderRadius: 4, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <HiddenBadge />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
