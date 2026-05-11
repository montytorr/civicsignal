import React from 'react'

interface EyebrowProps {
  children: React.ReactNode
  dim?: boolean
  className?: string
}

export const Eyebrow = ({ children, dim, className }: EyebrowProps) => (
  <div
    className={[
      'font-mono text-[11px] font-medium tracking-[0.08em] uppercase',
      dim ? 'text-parchment-muted' : 'text-parchment-ink-soft',
      className,
    ].filter(Boolean).join(' ')}
  >
    {children}
  </div>
)
