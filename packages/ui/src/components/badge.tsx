import React from 'react'

type BadgeTone = 'neutral' | 'soft' | 'accent' | 'green' | 'amber' | 'crimson' | 'solid'

interface BadgeProps {
  tone?: BadgeTone
  mono?: boolean
  children: React.ReactNode
  className?: string
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-transparent text-parchment-ink-soft border border-parchment-line',
  soft: 'bg-parchment-surface-alt text-parchment-ink-soft border border-transparent',
  accent: 'bg-transparent text-parchment-accent border border-parchment-accent',
  green: 'bg-transparent text-parchment-green border border-parchment-green',
  amber: 'bg-transparent text-parchment-amber border border-parchment-amber',
  crimson: 'bg-transparent text-parchment-crimson border border-parchment-crimson',
  solid: 'bg-parchment-ink text-parchment-bg border border-parchment-ink',
}

export const Badge = ({ tone = 'neutral', mono, children, className }: BadgeProps) => (
  <span
    className={[
      'inline-flex items-center px-2 py-[3px] text-[11px] font-medium rounded',
      TONE_CLASSES[tone],
      mono && 'font-mono uppercase tracking-[0.02em]',
      className,
    ].filter(Boolean).join(' ')}
  >
    {children}
  </span>
)
