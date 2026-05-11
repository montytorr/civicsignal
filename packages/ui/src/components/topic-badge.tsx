import React from 'react'
import { topicById } from '../tokens'

interface TopicBadgeProps {
  topicId: string
  className?: string
}

export const TopicBadge = ({ topicId, className }: TopicBadgeProps) => {
  const topic = topicById(topicId)

  return (
    <span
      className={[
        'inline-flex items-center gap-[6px]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <span className="shrink-0 w-[6px] h-[6px] bg-parchment-ink rounded-[1px] inline-block" />
      <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] uppercase text-parchment-ink-soft">
        {topic?.label ?? topicId}
      </span>
    </span>
  )
}
