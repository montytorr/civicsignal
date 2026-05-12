'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eyebrow, Badge, Btn } from '@civicsignal/ui'

type Membership = {
  id: string
  topic_id: string
  status: string
  min_reputation_at_invite: number
  accepted_at: string | null
  topics: { label: string; slug: string } | null
}

type PanelDispute = {
  id: string
  poll_id: string
  reason: string
  status: string
  created_at: string
  polls: { question: string; topics?: { label: string } | null } | null
  evidence?: Array<{ id: string; summary: string; source_url: string | null; created_at: string }>
  reviews?: Array<{ id: string; decision: string; rationale: string; created_at: string; profiles?: { handle: string } | null }>
}

export const PanelWorkspacePage = ({ memberships, disputes }: { memberships: Membership[]; disputes: PanelDispute[] }) => {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [items, setItems] = useState(disputes)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitReview = async (disputeId: string, decision: 'uphold' | 'dismiss') => {
    const rationale = notes[disputeId]?.trim()
    if (!rationale || rationale.length < 8) {
      setError('Add a short rationale before submitting a panel review.')
      return
    }
    setLoading(disputeId)
    setNotice(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rationale }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to submit panel review')
        return
      }
      setItems((prev) => prev.map((d) => d.id === disputeId ? {
        ...d,
        status: data.closedAs ?? 'reviewing',
        reviews: [...(d.reviews ?? []).filter((r) => r.id !== data.review.id), data.review],
      } : d))
      setNotice(data.closedAs ? `Dispute closed as ${data.closedAs}.` : 'Panel review recorded.')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 96px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 48, alignItems: 'end', paddingBottom: 28, borderBottom: '1px solid var(--color-parchment-line)' }}>
          <div>
            <Eyebrow>Panel workspace</Eyebrow>
            <h1 style={{ margin: '12px 0 0', fontSize: 38, lineHeight: 1.08, fontWeight: 500, letterSpacing: '-0.025em' }}>Review open disputes in your topics.</h1>
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-parchment-ink-soft)' }}>
            Panel reviews require a rationale and are published to the transparency report. Two matching reviews close a dispute.
          </p>
        </section>

        {(notice || error) && (
          <div style={{ marginTop: 16, padding: '12px 16px', border: `1px solid ${error ? 'var(--color-parchment-amber)' : 'var(--color-parchment-green)'}`, color: error ? 'var(--color-parchment-amber)' : 'var(--color-parchment-green)', background: 'var(--color-parchment-surface)', borderRadius: 3, fontSize: 13 }}>
            {error ?? notice}
          </div>
        )}

        <section className="cs-responsive-grid" style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 18, border: '1px solid var(--color-parchment-line)', background: 'var(--color-parchment-surface)', borderRadius: 4 }}>
            <Eyebrow>Active panels</Eyebrow>
            <div className="font-mono" style={{ marginTop: 8, fontSize: 28 }}>{memberships.length}</div>
          </div>
          <div style={{ padding: 18, border: '1px solid var(--color-parchment-line)', background: 'var(--color-parchment-surface)', borderRadius: 4 }}>
            <Eyebrow>Open disputes</Eyebrow>
            <div className="font-mono" style={{ marginTop: 8, fontSize: 28 }}>{items.filter((d) => d.status === 'open' || d.status === 'reviewing').length}</div>
          </div>
          <div style={{ padding: 18, border: '1px solid var(--color-parchment-line)', background: 'var(--color-parchment-surface)', borderRadius: 4 }}>
            <Eyebrow>Topics</Eyebrow>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-parchment-ink-soft)', lineHeight: 1.6 }}>{memberships.map((m) => m.topics?.label).filter(Boolean).join(' · ') || 'None'}</div>
          </div>
        </section>

        <section style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 24 }} className="cs-detail-grid">
          <div style={{ border: '1px solid var(--color-parchment-line)', background: 'var(--color-parchment-surface)', borderRadius: 4 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-parchment-line-soft)' }}><Eyebrow>Your memberships</Eyebrow></div>
            {memberships.length === 0 ? (
              <p style={{ margin: 0, padding: 20, fontSize: 13, color: 'var(--color-parchment-muted)' }}>You are not an active panelist yet.</p>
            ) : memberships.map((m) => (
              <div key={m.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-parchment-line-soft)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13.5 }}>{m.topics?.label ?? 'Topic'}</div>
                  <div className="font-mono" style={{ marginTop: 4, fontSize: 10.5, color: 'var(--color-parchment-muted)' }}>min rep {m.min_reputation_at_invite}</div>
                </div>
                <Badge tone="green" mono>{m.status}</Badge>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid var(--color-parchment-line)', background: 'var(--color-parchment-surface)', borderRadius: 4 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-parchment-line-soft)' }}><Eyebrow>Review queue</Eyebrow></div>
            {items.length === 0 ? (
              <p style={{ margin: 0, padding: 20, fontSize: 13, color: 'var(--color-parchment-muted)' }}>No open disputes in your panel topics.</p>
            ) : items.map((d) => (
              <div key={d.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-parchment-line-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <Link href={`/polls/${d.poll_id}/resolved`} style={{ color: 'var(--color-parchment-ink)', textDecoration: 'none', fontSize: 14, lineHeight: 1.4 }}>{d.polls?.question ?? 'Disputed poll'}</Link>
                  <Badge tone={d.status === 'reviewing' ? 'amber' : 'neutral'} mono>{d.status}</Badge>
                </div>
                <p style={{ margin: '8px 0', fontSize: 12.5, color: 'var(--color-parchment-ink-soft)', lineHeight: 1.5 }}>{d.reason}</p>
                {(d.evidence ?? []).map((e) => (
                  <p key={e.id} style={{ margin: '4px 0', fontSize: 12, color: 'var(--color-parchment-muted)', lineHeight: 1.45 }}>
                    {e.source_url ? <a href={e.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-parchment-accent)' }}>Evidence source</a> : 'Evidence'} · {e.summary}
                  </p>
                ))}
                {(d.status === 'open' || d.status === 'reviewing') && (
                  <>
                    <textarea value={notes[d.id] ?? ''} onChange={(e) => setNotes((prev) => ({ ...prev, [d.id]: e.target.value }))} placeholder="Review rationale…" style={{ width: '100%', minHeight: 64, marginTop: 10, padding: '9px 11px', fontSize: 12.5, fontFamily: 'inherit', background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', border: '1px solid var(--color-parchment-line)', borderRadius: 3, resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <Btn kind="primary" size="sm" onClick={() => submitReview(d.id, 'uphold')} disabled={loading === d.id}>Uphold dispute</Btn>
                      <Btn kind="ghost" size="sm" onClick={() => submitReview(d.id, 'dismiss')} disabled={loading === d.id}>Dismiss dispute</Btn>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
