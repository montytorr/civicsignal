import React from 'react'

interface VerifiedBadgeProps {
  dim?: boolean
  className?: string
}

export const VerifiedBadge = ({ dim, className }: VerifiedBadgeProps) => (
  <span
    className={[
      'inline-flex items-center gap-[6px]',
      dim ? 'text-parchment-muted' : 'text-parchment-green',
      className,
    ].filter(Boolean).join(' ')}
  >
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M5.5 0.5 L9.6 2.3 V5.5 C9.6 8 7.8 9.7 5.5 10.5 C3.2 9.7 1.4 8 1.4 5.5 V2.3 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M3.6 5.5 L5 6.9 L7.6 4.3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] uppercase">
      Verified human
    </span>
  </span>
)
