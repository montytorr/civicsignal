'use client'

import { useState } from 'react'
import { Eyebrow } from '@civicsignal/ui'

type Invite = {
  id: string
  code: string
  used_by: string | null
  used_at: string | null
  created_at: string
}

const MAX_ACTIVE_INVITES = 5

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const InvitesPage = ({ initialInvites }: { initialInvites: Invite[] }) => {
  const [invites, setInvites] = useState<Invite[]>(initialInvites)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const activeCount = invites.filter((i) => !i.used_by).length
  const atLimit = activeCount >= MAX_ACTIVE_INVITES

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/invites', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to generate invite')
        return
      }
      setInvites((prev) => [json.data, ...prev])
    } catch {
      setError('Network error — please try again')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async (code: string) => {
    const inviteUrl = `${window.location.origin}/auth/signup?invite=${code}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ padding: '40px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div>
            <Eyebrow>Invite system</Eyebrow>
            <h1 style={{
              margin: '8px 0 0', fontSize: 36, fontWeight: 500,
              letterSpacing: '-0.02em', color: 'var(--color-parchment-ink)',
            }}>
              Your invite codes
            </h1>
          </div>
          <div className="font-mono" style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 26, color: activeCount > 0 ? 'var(--color-parchment-ink)' : 'var(--color-parchment-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {activeCount} / {MAX_ACTIVE_INVITES}
            </div>
            <Eyebrow>Active codes</Eyebrow>
          </div>
        </div>

        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--color-parchment-ink-soft)', maxWidth: 560 }}>
          Share these links with people you trust. Each code can be used once. You may hold up to {MAX_ACTIVE_INVITES} unused codes at a time.
        </p>

        {/* Generate button + error */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleGenerate}
            disabled={generating || atLimit}
            style={{
              padding: '10px 20px',
              fontSize: 13.5,
              fontWeight: 500,
              fontFamily: 'inherit',
              color: atLimit ? 'var(--color-parchment-muted)' : 'var(--color-parchment-bg)',
              background: atLimit ? 'var(--color-parchment-surface)' : 'var(--color-parchment-ink)',
              border: `1px solid ${atLimit ? 'var(--color-parchment-line)' : 'var(--color-parchment-ink)'}`,
              borderRadius: 3,
              cursor: atLimit || generating ? 'default' : 'pointer',
              opacity: generating ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {generating ? 'Generating…' : 'Generate new code'}
          </button>

          {atLimit && !error && (
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em' }}>
              LIMIT REACHED — USE OR SHARE EXISTING CODES
            </span>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: 14, padding: '12px 16px',
            background: 'var(--color-parchment-surface)',
            border: '1px solid var(--color-parchment-amber)',
            borderRadius: 3, fontSize: 13,
            color: 'var(--color-parchment-amber)',
          }}>
            {error}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderBottom: '1px solid var(--color-parchment-line)', marginTop: 28, marginBottom: 24 }} />

        {/* Invite list */}
        {invites.length === 0 ? (
          <div style={{
            padding: '40px 28px',
            background: 'var(--color-parchment-surface)',
            border: '1px solid var(--color-parchment-line)',
            borderRadius: 4,
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-parchment-muted)',
          }}>
            No codes yet. Generate your first invite above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invites.map((invite) => {
              const used = !!invite.used_by
              const copied = copiedCode === invite.code
              return (
                <div
                  key={invite.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    alignItems: 'center',
                    gap: 24,
                    padding: '18px 22px',
                    background: 'var(--color-parchment-surface)',
                    border: `1px solid ${used ? 'var(--color-parchment-line-soft, var(--color-parchment-line))' : 'var(--color-parchment-line)'}`,
                    borderRadius: 4,
                    opacity: used ? 0.65 : 1,
                  }}
                >
                  {/* Code */}
                  <div>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        color: used ? 'var(--color-parchment-muted)' : 'var(--color-parchment-ink)',
                        textDecoration: used ? 'line-through' : 'none',
                      }}
                    >
                      {invite.code}
                    </span>
                    <div className="font-mono" style={{ marginTop: 4, fontSize: 10.5, color: 'var(--color-parchment-muted)', letterSpacing: '0.04em' }}>
                      CREATED {formatDate(invite.created_at).toUpperCase()}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className="font-mono"
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      fontSize: 10.5,
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      borderRadius: 999,
                      color: used ? 'var(--color-parchment-muted)' : 'var(--color-parchment-green)',
                      background: used ? 'var(--color-parchment-bg)' : 'transparent',
                      border: `1px solid ${used ? 'var(--color-parchment-line)' : 'var(--color-parchment-green)'}`,
                    }}
                  >
                    {used ? 'USED' : 'AVAILABLE'}
                  </span>

                  {/* Used at date */}
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--color-parchment-muted)', letterSpacing: '0.03em', minWidth: 80, textAlign: 'right' }}>
                    {used && invite.used_at ? `Used ${formatDate(invite.used_at)}` : ''}
                  </span>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(invite.code)}
                    disabled={used}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      color: used ? 'var(--color-parchment-muted)' : copied ? 'var(--color-parchment-green)' : 'var(--color-parchment-ink-soft)',
                      background: 'transparent',
                      border: `1px solid ${copied ? 'var(--color-parchment-green)' : 'var(--color-parchment-line)'}`,
                      borderRadius: 3,
                      cursor: used ? 'default' : 'pointer',
                      transition: 'color 0.15s, border-color 0.15s',
                      minWidth: 80,
                      textAlign: 'center',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        <p style={{ marginTop: 32, fontSize: 12.5, color: 'var(--color-parchment-muted)', fontStyle: 'italic', maxWidth: 560 }}>
          Invite links include a pre-filled code. The recipient must verify their identity during signup — the code alone does not bypass verification.
        </p>
      </main>
    </div>
  )
}
