'use client'

import { useState } from 'react'
import { Eyebrow } from '@civicsignal/ui'

interface Props {
  pollId: string
}

export const DisputeForm = ({ pollId }: Props) => {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/polls/${pollId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to submit dispute')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-parchment-surface)',
        border: '1px solid var(--color-parchment-amber)',
        borderRadius: 4,
        padding: '20px 22px',
      }}
    >
      <Eyebrow>Flag resolution</Eyebrow>

      {success ? (
        <div style={{ marginTop: 12 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 12,
              color: 'var(--color-parchment-amber)',
              letterSpacing: '0.04em',
              marginBottom: 4,
            }}
          >
            RESOLUTION FLAGGED
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-parchment-muted)', lineHeight: 1.5 }}>
            Your dispute has been submitted for review.
          </p>
        </div>
      ) : (
        <>
          <p style={{ margin: '10px 0 12px', fontSize: 12, color: 'var(--color-parchment-muted)', lineHeight: 1.5 }}>
            Believe this resolution is incorrect? Provide your reasoning below. Requires topic reputation.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this resolution is incorrect…"
            style={{
              width: '100%',
              minHeight: 80,
              padding: '10px 12px',
              fontSize: 13,
              fontFamily: 'inherit',
              color: 'var(--color-parchment-ink)',
              background: 'var(--color-parchment-bg)',
              border: '1px solid var(--color-parchment-line)',
              borderRadius: 3,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-parchment-amber)' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            style={{
              marginTop: 10,
              padding: '8px 16px',
              fontSize: 12,
              fontFamily: 'inherit',
              color: reason.trim() && !submitting
                ? 'var(--color-parchment-amber)'
                : 'var(--color-parchment-muted)',
              background: 'transparent',
              border: '1px solid var(--color-parchment-amber)',
              borderRadius: 3,
              cursor: reason.trim() && !submitting ? 'pointer' : 'not-allowed',
              opacity: reason.trim() && !submitting ? 1 : 0.5,
              letterSpacing: '0.02em',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit dispute'}
          </button>
        </>
      )}
    </div>
  )
}
