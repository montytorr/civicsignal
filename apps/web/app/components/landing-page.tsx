import Link from 'next/link'
import { PollCard, MethodCallout, Eyebrow, Btn, Badge } from '@civicsignal/ui'
import type { Poll } from '@civicsignal/ui'

// ─── Globe SVG ───────────────────────────────────────────────────────────────

const Globe = ({ size = 420 }: { size?: number }) => {
  const c = size / 2
  const r = size * 0.42

  const dots: { cx: number; cy: number }[] = []
  for (let lat = -80; lat <= 80; lat += 16) {
    const phi = (lat * Math.PI) / 180
    const yr = r * Math.sin(phi)
    const xr = r * Math.cos(phi)
    const count = Math.max(6, Math.round(xr / 9))
    for (let i = 0; i < count; i++) {
      const lon = (i / count) * 2 * Math.PI - Math.PI
      const x = c + xr * Math.cos(lon)
      const y = c + yr
      dots.push({ cx: x, cy: y })
    }
  }

  const markers = [
    { x: 0.62, y: 0.42 },
    { x: 0.32, y: 0.55 },
    { x: 0.74, y: 0.36 },
    { x: 0.55, y: 0.62 },
    { x: 0.41, y: 0.72 },
    { x: 0.67, y: 0.55 },
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <style>{`
          @keyframes cs-globe-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes cs-globe-pulse {
            0%, 100% { opacity: 0.4; r: 6; }
            50% { opacity: 0.7; r: 9; }
          }
          @keyframes cs-globe-dot-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          .cs-globe-dots {
            animation: cs-globe-rotate 120s linear infinite;
            transform-origin: ${c}px ${c}px;
          }
          .cs-globe-ring {
            animation: cs-globe-pulse 4s ease-in-out infinite;
          }
          .cs-globe-marker {
            animation: cs-globe-dot-pulse 4s ease-in-out infinite;
          }
        `}</style>
      </defs>

      <circle cx={c} cy={c} r={r} fill="none" stroke="#D9D1BD" strokeWidth="1" />
      <ellipse cx={c} cy={c} rx={r} ry={r * 0.32} fill="none" stroke="#D9D1BD" strokeWidth="0.5" />
      <ellipse cx={c} cy={c} rx={r * 0.65} ry={r} fill="none" stroke="#D9D1BD" strokeWidth="0.5" />
      <line x1={c} y1={c - r} x2={c} y2={c + r} stroke="#D9D1BD" strokeWidth="0.5" />

      <g className="cs-globe-dots">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={1} fill="#3A4861" opacity={0.55} />
        ))}
      </g>

      {markers.map((m, i) => {
        const mx = c - r + m.x * 2 * r
        const my = c - r + m.y * 2 * r
        return (
          <g key={i}>
            <circle
              cx={mx} cy={my} r="6"
              fill="none" stroke="#B6841F" strokeWidth="1"
              className="cs-globe-ring"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
            <circle
              cx={mx} cy={my} r="2.4"
              fill="#B6841F"
              className="cs-globe-marker"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface Stats {
  verifiedHumans: number
  pollsResolved: number
  regions: number
}

export const LandingPage = ({ polls, stats }: { polls: Poll[]; stats: Stats }) => (
  <div className="bg-parchment-bg text-parchment-ink" style={{ minHeight: '100%' }}>

    {/* HERO */}
    <section
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '88px 56px 96px',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: 64,
        alignItems: 'center',
      }}
    >
      {/* Left column */}
      <div>
        {/* Status pill */}
        <div
          className="font-mono inline-flex items-center"
          style={{
            gap: 8,
            fontSize: 11.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#3A4861',
            padding: '6px 10px',
            border: '1px solid #D9D1BD',
            borderRadius: 999,
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#2F6B4A', flexShrink: 0 }}
          />
          Public-good · Open-source · Beta
        </div>

        {/* H1 */}
        <h1
          style={{
            margin: '24px 0 0',
            fontSize: 64,
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
            textWrap: 'balance' as never,
            color: '#0E1F36',
          }}
        >
          Verified-human polling for public&nbsp;intelligence.
        </h1>

        {/* Subhead */}
        <p
          style={{
            marginTop: 22,
            fontSize: 18,
            lineHeight: 1.55,
            color: '#3A4861',
            maxWidth: 540,
            textWrap: 'pretty' as never,
          }}
        >
          CivicSignal lets pseudonymous, verified people propose, vote on, dispute, and resolve real-world civic questions — with public evidence trails and non-transferable topic reputation.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Link href="/polls">
            <Btn kind="primary" size="lg">Explore active polls</Btn>
          </Link>
          <Link href="/demo">
            <Btn kind="ghost" size="lg">See the civic loop</Btn>
          </Link>
        </div>

        {/* Stat strip */}
        <div
          className="font-mono"
          style={{
            display: 'flex',
            gap: 28,
            marginTop: 36,
            paddingTop: 24,
            borderTop: '1px solid #E5DEC9',
            color: '#6B7488',
          }}
        >
          <span style={{ fontSize: 11, letterSpacing: '0.04em' }}>
            <span className="font-mono" style={{ color: '#0E1F36', fontSize: 13 }}>{stats.verifiedHumans.toLocaleString()}</span>
            &nbsp; verified humans
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.04em' }}>
            <span className="font-mono" style={{ color: '#0E1F36', fontSize: 13 }}>{stats.pollsResolved.toLocaleString()}</span>
            &nbsp; polls resolved
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.04em' }}>
            <span className="font-mono" style={{ color: '#0E1F36', fontSize: 13 }}>{stats.regions}</span>
            &nbsp; regions
          </span>
        </div>
      </div>

      {/* Right column — Globe */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Globe size={420} />
      </div>
    </section>

    {/* TRUST LINE */}
    <section
      style={{
        padding: '20px 56px 28px',
        borderTop: '1px solid #D9D1BD',
        borderBottom: '1px solid #D9D1BD',
        background: '#FBF8F1',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <p style={{ margin: 0, fontSize: 14.5, color: '#3A4861', fontStyle: 'italic' }}>
          &ldquo;Votes stay hidden until cutoff. Reputation can&rsquo;t be bought, transferred, or traded.&rdquo;
        </p>
        <Eyebrow dim>Operating principle 03</Eyebrow>
      </div>
    </section>

    {/* THREE PILLARS */}
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '88px 56px' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48 }}
      >
        <Eyebrow>How it works</Eyebrow>
        <span className="font-mono" style={{ fontSize: 11, color: '#6B7488' }}>01 / 05</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          borderTop: '1px solid #D9D1BD',
        }}
      >
        {[
          {
            n: '01',
            h: 'Verified humans, not crowds.',
            d: 'Each participant clears a privacy-preserving humanity check before voting. We never see who you are; the network only sees that you are exactly one person.',
          },
          {
            n: '02',
            h: 'Hidden votes until cutoff.',
            d: 'No bars, no percentages, no leaderboard while a poll is open. Independent judgment is the entire point — we refuse to make herd-behavior the default.',
          },
          {
            n: '03',
            h: 'Questions proposed in public.',
            d: 'Verified users can propose polls with source-of-truth, region, options, and resolution criteria. Moderation decisions stay visible instead of disappearing into a black box.',
          },
          {
            n: '04',
            h: 'Panels for hard cases.',
            d: 'Trusted topic panelists review dispute evidence and resolution edge cases, preserving notes and decisions in the audit trail.',
          },
        ].map((pl, i) => (
          <div
            key={pl.n}
            style={{
              padding: i === 0 ? '36px 32px 36px 0' : '36px 32px 36px 32px',
              borderRight: i < 3 ? '1px solid #D9D1BD' : 'none',
              position: 'relative',
            }}
          >
            <span className="font-mono" style={{ fontSize: 12, color: '#6B7488', letterSpacing: '0.06em' }}>
              {pl.n}
            </span>
            <h3
              style={{
                margin: '12px 0 12px',
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.25,
                color: '#0E1F36',
                letterSpacing: '-0.015em',
              }}
            >
              {pl.h}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.6,
                color: '#3A4861',
                textWrap: 'pretty' as never,
              }}
            >
              {pl.d}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* EXAMPLE POLLS */}
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px 88px' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}
      >
        <h2
          style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: '#0E1F36' }}
        >
          What people are deciding right now
        </h2>
        <Link
          href="/polls"
          style={{ fontSize: 13.5, color: '#244B6B', textDecoration: 'none' }}
          className="hover:opacity-75 transition-opacity"
        >
          See all active polls →
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} href={`/polls/${poll.id}`} />
        ))}
      </div>
    </section>

    {/* METHODOLOGY PREVIEW */}
    <section
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '0 56px 96px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: 56,
      }}
    >
      <div>
        <Eyebrow>Methodology · in brief</Eyebrow>
        <h2
          style={{
            margin: '14px 0 16px',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: '#0E1F36',
            textWrap: 'balance' as never,
          }}
        >
          Every proposal, poll, dispute, and resolution is auditable.
        </h2>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: '#3A4861', maxWidth: 380 }}>
          Polls begin as public proposals or admin drafts, use named resolution sources before cutoff, seal votes until tally, and publish resolution evidence plus dispute review. Anyone can re-run the audit trail.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Link href="/demo"><Btn kind="primary" size="md">See the demo →</Btn></Link>
          <Link href="/methodology"><Btn kind="ghost" size="md">Read methodology →</Btn></Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <MethodCallout label="Community proposals">
          Verified users can propose polls with a topic, region, options, source-of-truth, and resolution criteria.
        </MethodCallout>
        <MethodCallout label="Source templates">
          Region-specific templates keep official sources and resolution criteria consistent across jurisdictions.
        </MethodCallout>
        <MethodCallout label="Disputes + panels">
          Resolutions include evidence, a dispute window, and trusted-panel review for hard edge cases.
        </MethodCallout>
        <MethodCallout label="Open audit">
          All commitments and resolutions are mirrored to a public log. Re-running the audit is a
          one-line CLI command.
        </MethodCallout>
      </div>
    </section>

    {/* DEMOCRACY ROADMAP */}
    <section
      style={{
        padding: '88px 56px',
        background: '#FBF8F1',
        borderTop: '1px solid #D9D1BD',
        borderBottom: '1px solid #D9D1BD',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 40,
        }}
      >
        <div>
          <Eyebrow>Democracy roadmap</Eyebrow>
          <h2
            style={{
              margin: '12px 0 0',
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#0E1F36',
              maxWidth: 580,
              textWrap: 'balance' as never,
            }}
          >
            From civic polling toward shared public reasoning.
          </h2>
        </div>
        <span className="font-mono" style={{ fontSize: 11, color: '#6B7488' }}>
          v0.8 → v1.0
        </span>
      </div>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid #D9D1BD',
        }}
      >
        {[
          {
            date: '2026 · Q2',
            state: 'now',
            h: 'Verified-human civic loop',
            d: 'Pseudonymous voting, community proposals, sealed votes, trusted panels, disputes, source templates, and topic reputation.',
          },
          {
            date: '2026 · Q4',
            state: 'next',
            h: 'Public proposal governance',
            d: 'Broader review workflows for community-authored polls, source curation, and proposal appeals.',
          },
          {
            date: '2027 · H1',
            state: 'next',
            h: 'Cross-jurisdiction expansion',
            d: 'More locale-specific templates, multilingual question framing, and regional panel capacity.',
          },
          {
            date: '2027 · H2',
            state: 'soon',
            h: 'Public-good civic governance',
            d: 'Reputation-gated governance over authoring rules, dispute review policy, and source curation.',
          },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              padding: i === 0 ? '28px 28px 28px 0' : '28px 28px 28px 28px',
              borderRight: i < 3 ? '1px solid #D9D1BD' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: '#6B7488', letterSpacing: '0.04em' }}
              >
                {m.date}
              </span>
              {m.state === 'now' && (
                <Badge tone="green" mono>Now</Badge>
              )}
              {m.state === 'next' && (
                <Badge tone="amber" mono>Next</Badge>
              )}
            </div>
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 17,
                fontWeight: 500,
                color: '#0E1F36',
                letterSpacing: '-0.01em',
              }}
            >
              {m.h}
            </h3>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#3A4861' }}>{m.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* OPEN-SOURCE STRIP */}
    <section
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '64px 56px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 56,
        alignItems: 'center',
      }}
    >
      <div>
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
          Built in the open as public-good infrastructure.
        </h2>
        <p
          style={{
            marginTop: 14,
            fontSize: 14,
            color: '#3A4861',
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          The full source, governance docs, and audit tooling live on GitHub under MPL-2.0.
          CivicSignal will not have shareholders, advertisers, or paid placements — and that
          constraint is encoded in the foundation&rsquo;s charter.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { k: 'Repo', v: 'github.com/montytorr/civicsignal' },
          { k: 'License', v: 'MPL-2.0' },
          { k: 'Steward', v: 'CivicSignal Foundation' },
          { k: 'Audit', v: 'Coming soon' },
        ].map((x) => (
          <div
            key={x.k}
            style={{
              border: '1px solid #D9D1BD',
              padding: '14px 16px',
              borderRadius: 4,
              background: '#F5F1E8',
            }}
          >
            <Eyebrow>{x.k}</Eyebrow>
            <div className="font-mono" style={{ marginTop: 6, fontSize: 13, color: '#0E1F36' }}>
              {x.v}
            </div>
          </div>
        ))}
      </div>
    </section>

  </div>
)
