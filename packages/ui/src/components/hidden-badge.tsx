import React from 'react'

interface HiddenBadgeProps {
  className?: string
}

export const HiddenBadge = ({ className }: HiddenBadgeProps) => (
  <span
    className={[
      'inline-flex items-center gap-[6px] text-parchment-ink-soft',
      className,
    ].filter(Boolean).join(' ')}
  >
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="2.5"
        y="5.5"
        width="7"
        height="5"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M4 5.5 V3.8 a2 2 0 0 1 4 0 V5.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
    <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] uppercase">
      Votes hidden until cutoff
    </span>
  </span>
)
