import React from 'react'
import { CsMark } from './cs-mark'

interface CsWordmarkProps {
  size?: number
  dim?: boolean
  className?: string
}

export const CsWordmark = ({ size = 18, dim, className }: CsWordmarkProps) => (
  <span
    className={[
      'inline-flex items-center gap-2',
      dim ? 'text-parchment-muted' : 'text-parchment-ink',
      className,
    ].filter(Boolean).join(' ')}
    style={{ fontSize: size }}
  >
    <CsMark size={size + 4} />
    <span style={{ lineHeight: 1 }}>
      <span className="font-semibold">Civic</span>
      <span className="font-normal opacity-60">Signal</span>
    </span>
  </span>
)
