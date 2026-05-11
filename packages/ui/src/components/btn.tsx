import React from 'react'

type BtnKind = 'primary' | 'ghost' | 'quiet' | 'accent'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps {
  kind?: BtnKind
  size?: BtnSize
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  disabled?: boolean
  style?: React.CSSProperties
}

const KIND_CLASSES: Record<BtnKind, string> = {
  primary: 'bg-parchment-ink text-parchment-bg border border-parchment-ink',
  ghost: 'bg-transparent text-parchment-ink border border-parchment-line',
  quiet: 'bg-transparent text-parchment-ink-soft border border-transparent',
  accent: 'bg-parchment-accent text-white border border-parchment-accent',
}

const SIZE_CLASSES: Record<BtnSize, string> = {
  sm: 'h-[30px] px-3 text-[12px]',
  md: 'h-[38px] px-4 text-[13.5px]',
  lg: 'h-[46px] px-[22px] text-[14px]',
}

export const Btn = ({
  kind = 'primary',
  size = 'md',
  children,
  onClick,
  className,
  disabled,
  style,
}: BtnProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={[
      'inline-flex items-center justify-center cursor-pointer transition-colors',
      'font-medium rounded-[3px] tracking-[-0.005em] leading-none',
      KIND_CLASSES[kind],
      SIZE_CLASSES[size],
      disabled && 'opacity-40 cursor-not-allowed',
      className,
    ].filter(Boolean).join(' ')}
  >
    {children}
  </button>
)
