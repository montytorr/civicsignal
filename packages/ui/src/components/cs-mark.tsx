import React from 'react'

interface CsMarkProps {
  size?: number
  color?: string
  strokeWidth?: number
}

export const CsMark = ({ size = 22, color = 'currentColor', strokeWidth = 1.4 }: CsMarkProps) => {
  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.46}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.35}
      />
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.30}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.6}
      />
      <circle cx={cx} cy={cy} r={size * 0.13} fill={color} />
    </svg>
  )
}
