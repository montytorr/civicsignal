import Link from 'next/link'
import { Eyebrow, Btn } from '@civicsignal/ui'

const SECTIONS = [
  {
    id: 'humans',
    n: '01',
    h: 'Verified humans',
    d: 'Each participant completes a privacy-preserving humanity check the first time they sign in. The check returns a one-bit answer — “this is exactly one human” — and nothing else. We never store or learn who you are.',
    bullets: [
      'No phone numbers retained',
      'No biometric data retained',
      'No social account required',
      'Verifier rotation every 90 days',
    ],
  },
  {
    id: 'pseudo',
    n: '02',
    h: 'Pseudonymity by default',
    d: 'Every account is assigned a stable, randomly-generated handle. Names, emails, and identifying metadata never leave the verification step. Your handle is the only public part of you.',
    bullets: [
      'Random pronounceable handles',
      'No real-name display ever',
      'No location display by default',
      'Cross-poll history is opt-in',
    ],
  },
  {
    id: 'sealed',
    n: '03',
    h: 'Sealed votes',
    d: 'When you answer, your vote is encrypted client-side and sealed until cutoff. We publish a hash of the full vote set before cutoff so the entire population is committed before any tally exists.',
    bullets: [
      'Client-side encryption',
      'Pre-cutoff commitment hash',
      'No partial reveals to staff',
      'No vote reweighting',
    ],
  },
  {
    id: 'resolve',
    n: '04',
    h: 'Resolution',
    d: 'Every poll names a single source-of-truth before it opens. After cutoff, a resolver records the outcome with linked evidence, a timestamp, and the named source — then a 24h dispute window opens.',
    bullets: [
      'Source named pre-launch',
      'Linked, timestamped evidence',
      '24h public dispute window',
      'Multi-resolver review on disputes',
    ],
  },
  {
    id: 'rep',
    n: '05',
    h: 'Reputation',
    d: "Reputation is topic-specific and earned by being on the correct side of a resolved poll. It can’t be transferred, sold, staked, or boosted by paying. There is no single global score.",
    bullets: [
      'Per-topic only',
      'Non-transferable',
      'No financial value',
      'Decays slowly to reward sustained accuracy',
    ],
  },
  {
    id: 'audit',
    n: '06',
    h: 'Open audit',
    d: 'All commitments, resolutions, and reputation events are mirrored to a public log. The auditor CLI re-runs the entire history end-to-end against the log and prints a single fingerprint.',
    bullets: [
      'MPL-2.0 reference impl',
      'Public commitment mirror',
      'One-line auditor CLI',
      'Fingerprint published weekly',
    ],
  },
]

export const MethodPage = () => (
  <div className="bg-parchment-bg text-parchment-ink" style={{ minHeight: '100%' }}>

    {/* HERO BAND */}
    <section style={{ borderBottom: '1px solid #D9D1BD' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 40px 32px',
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: 56,
          alignItems: 'end',
        }}
      >
      <div>
        <Eyebrow>Methodology · v0.4</Eyebrow>
        <h1
          style={{
            margin: '14px 0 0',
            fontSize: 52,
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: '#0E1F36',
            textWrap: 'balance' as never,
          }}
        >
          How CivicSignal stays trustworthy.
        </h1>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.55,
          color: '#3A4861',
          maxWidth: 540,
          textWrap: 'pretty' as never,
        }}
      >
        Trust is not a feeling we ask you for — it is the property of a system you can audit.
        This page describes how every part of CivicSignal is built so that no single party,
        including us, can tilt an outcome without leaving evidence behind.
      </p>
      </div>
    </section>

    {/* SIX NUMBERED SECTIONS */}
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
      {SECTIONS.map((s, i) => (
        <div
          key={s.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1.2fr',
            gap: 40,
            padding: '52px 0',
            borderBottom: i < SECTIONS.length - 1 ? '1px solid #D9D1BD' : 'none',
          }}
        >
          {/* Col 1 — number */}
          <div
            className="font-mono"
            style={{ fontSize: 12, color: '#6B7488', letterSpacing: '0.06em' }}
          >
            {s.n}
          </div>

          {/* Col 2 — heading + description */}
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#0E1F36',
              }}
            >
              {s.h}
            </h2>
            <p
              style={{
                marginTop: 14,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: '#3A4861',
                maxWidth: 480,
                textWrap: 'pretty' as never,
              }}
            >
              {s.d}
            </p>
          </div>

          {/* Col 3 — bullets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              borderTop: '1px solid #E5DEC9',
            }}
          >
            {s.bullets.map((b) => (
              <div
                key={b}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #E5DEC9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13.5, color: '#3A4861' }}>{b}</span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#2F6B4A',
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>

    {/* CTA STRIP */}
    <section
      style={{
        borderTop: '1px solid #D9D1BD',
        background: '#FBF8F1',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 40px 96px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#0E1F36',
            textWrap: 'balance' as never,
          }}
        >
          Read the source. Run the auditor. Open an issue.
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="https://github.com/montytorr/civicsignal" target="_blank" rel="noopener noreferrer">
            <Btn kind="ghost" size="md">Auditor CLI →</Btn>
          </Link>
          <Link href="/methodology/spec">
            <Btn kind="primary" size="md">Read the spec →</Btn>
          </Link>
        </div>
      </div>
    </section>

  </div>
)
