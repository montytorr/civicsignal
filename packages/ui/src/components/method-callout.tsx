import React from 'react'
import { Eyebrow } from './eyebrow'

interface MethodCalloutProps {
  label: string
  children: React.ReactNode
  className?: string
}

export const MethodCallout = ({ label, children, className }: MethodCalloutProps) => (
  <div
    className={[
      'bg-parchment-surface border border-parchment-line rounded px-[20px] py-[18px] flex flex-col gap-2',
      className,
    ].filter(Boolean).join(' ')}
  >
    <Eyebrow>{label}</Eyebrow>
    <p className="text-[13.5px] leading-[1.55] text-parchment-ink-soft m-0">
      {children}
    </p>
  </div>
)
