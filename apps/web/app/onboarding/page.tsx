import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Eyebrow, Btn, Badge } from '@civicsignal/ui'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Start here | CivicSignal',
  description: 'First-session onboarding for CivicSignal verified-human civic polling.',
}

const steps = [
  { n: '01', title: 'Understand the civic loop', body: 'See how proposals, moderation, voting, resolution, disputes, panels, and reputation connect.', href: '/demo', cta: 'Open demo' },
  { n: '02', title: 'Vote on one active poll', body: 'Pick a question with a source you trust. Your vote stays sealed until cutoff.', href: '/polls', cta: 'Browse polls' },
  { n: '03', title: 'Propose a question', body: 'Submit a resolvable civic question with source-of-truth and resolution criteria.', href: '/proposals', cta: 'Propose poll' },
  { n: '04', title: 'Inspect the trust record', body: 'Review commitments, proposal states, source templates, disputes, and panel reviews.', href: '/verify', cta: 'Audit log' },
]

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('handle, verified')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '58px 40px 96px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'end', borderBottom: '1px solid var(--color-parchment-line)', paddingBottom: 30 }}>
          <div>
            <Eyebrow>First session</Eyebrow>
            <h1 style={{ margin: '12px 0 0', fontSize: 48, lineHeight: 1.06, fontWeight: 500, letterSpacing: '-0.025em' }}>Welcome to the civic loop.</h1>
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <Badge tone="green" mono>{profile?.verified ? 'verified human' : 'email confirmed'}</Badge>
              <Badge tone="neutral" mono>{profile?.handle ?? 'pseudonymous handle'}</Badge>
            </div>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.58, color: 'var(--color-parchment-ink-soft)' }}>
              CivicSignal works best when your first action is concrete: understand the loop, vote once, propose once, then inspect the audit trail.
            </p>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid var(--color-parchment-line)', marginTop: 34 }} className="cs-form-grid">
          {steps.map((step, i) => (
            <div key={step.n} style={{ padding: i === 0 ? '28px 24px 28px 0' : '28px 24px', borderRight: i < steps.length - 1 ? '1px solid var(--color-parchment-line)' : 'none' }}>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--color-parchment-muted)', letterSpacing: '0.06em' }}>{step.n}</span>
              <h2 style={{ margin: '12px 0 9px', fontSize: 20, fontWeight: 500, lineHeight: 1.25 }}>{step.title}</h2>
              <p style={{ minHeight: 78, margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-parchment-ink-soft)' }}>{step.body}</p>
              <Link href={step.href} style={{ display: 'inline-block', marginTop: 16 }}><Btn kind={i === 0 ? 'primary' : 'ghost'} size="sm">{step.cta} →</Btn></Link>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
