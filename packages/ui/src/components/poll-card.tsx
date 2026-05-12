import { TopicBadge } from './topic-badge'
import { Badge } from './badge'
import { HiddenBadge } from './hidden-badge'

export type Poll = {
  id: string
  q: string
  topic: string
  region: string
  cutoff: string
  cutoffLabel: string
  resolves: string
  participants: number
  options: string[]
  source: string
  resolutionCriteria?: string | null
  createdAt?: string | null
  status: 'active' | 'closed' | 'resolved'
  answered?: boolean
}

interface PollCardProps {
  poll: Poll
  href?: string
  className?: string
}

export const PollCard = ({ poll, href, className }: PollCardProps) => {
  const Tag = href ? 'a' : 'div'

  return (
    <Tag
      href={href}
      className={[
        'flex flex-col gap-[14px] bg-parchment-surface border border-parchment-line rounded px-[22px] pt-[20px] pb-[18px] transition-colors no-underline',
        href && 'cursor-pointer hover:border-parchment-ink',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-center gap-[14px]">
        <TopicBadge topicId={poll.topic} />
        <span className="shrink-0 inline-block w-px h-3 bg-parchment-line" />
        <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] uppercase text-parchment-muted">
          {poll.region}
        </span>
        <span className="flex-1" />
        {poll.answered && (
          <Badge tone="green" mono>
            Answered
          </Badge>
        )}
        {!poll.answered && poll.status === 'closed' && (
          <Badge tone="amber" mono>
            Closed · awaiting resolution
          </Badge>
        )}
      </div>

      <h3 className="text-[18px] font-medium leading-[1.3] text-parchment-ink tracking-[-0.01em] m-0">
        {poll.q}
      </h3>

      {poll.status === 'active' && <HiddenBadge />}
      {poll.status === 'closed' && (
        <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] uppercase text-parchment-muted">
          Resolution pending · {poll.resolves}
        </span>
      )}

      <div className="flex items-center justify-between pt-[14px] border-t border-parchment-line-soft">
        <span className="flex items-center gap-[18px] font-mono text-[11.5px] text-parchment-muted">
          <span>CUTOFF · {poll.cutoffLabel}</span>
          <span>{poll.participants.toLocaleString()} verified humans</span>
        </span>
        <span className="text-[12px] text-parchment-ink-soft">
          {poll.options.length} options →
        </span>
      </div>
    </Tag>
  )
}
