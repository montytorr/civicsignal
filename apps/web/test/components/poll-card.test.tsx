import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PollCard } from '@civicsignal/ui'
import type { Poll } from '@civicsignal/ui'

const makeActivePoll = (overrides: Partial<Poll> = {}): Poll => ({
  id: 'poll-001',
  q: 'Should public transport be free for all citizens?',
  topic: 'econ',
  region: 'EU',
  cutoff: new Date(Date.now() + 5 * 86_400_000).toISOString(),
  cutoffLabel: 'in 5d 0h',
  resolves: '2025-06-01',
  participants: 4200,
  options: ['Yes', 'No', 'Abstain'],
  source: 'https://example.com',
  status: 'active',
  answered: false,
  ...overrides,
})

describe('PollCard', () => {
  it('renders the question text', () => {
    render(<PollCard poll={makeActivePoll()} />)
    expect(screen.getByText('Should public transport be free for all citizens?')).toBeInTheDocument()
  })

  it('renders the topic badge with the correct label', () => {
    render(<PollCard poll={makeActivePoll({ topic: 'econ' })} />)
    // TopicBadge renders the topic label (Economics for econ)
    expect(screen.getByText('Economics')).toBeInTheDocument()
  })

  it('renders the region', () => {
    render(<PollCard poll={makeActivePoll({ region: 'EU' })} />)
    expect(screen.getByText('EU')).toBeInTheDocument()
  })

  it('renders the sealed answer count', () => {
    render(<PollCard poll={makeActivePoll({ participants: 4200 })} />)
    expect(screen.getByText(/4,200 sealed answers/i)).toBeInTheDocument()
  })

  it('renders the options count', () => {
    render(<PollCard poll={makeActivePoll({ options: ['Yes', 'No', 'Abstain'] })} />)
    expect(screen.getByText(/3 options/)).toBeInTheDocument()
  })

  it('renders cutoff label', () => {
    render(<PollCard poll={makeActivePoll({ cutoffLabel: 'in 5d 0h' })} />)
    expect(screen.getByText(/in 5d 0h/)).toBeInTheDocument()
  })

  it('renders "Answered" badge when poll.answered is true', () => {
    render(<PollCard poll={makeActivePoll({ answered: true })} />)
    expect(screen.getByText('Answered')).toBeInTheDocument()
  })

  it('does not render "Answered" badge when poll.answered is false', () => {
    render(<PollCard poll={makeActivePoll({ answered: false })} />)
    expect(screen.queryByText('Answered')).not.toBeInTheDocument()
  })

  it('renders the hidden votes indicator for active polls', () => {
    render(<PollCard poll={makeActivePoll({ status: 'active', answered: false })} />)
    expect(screen.getByText(/votes hidden until cutoff/i)).toBeInTheDocument()
  })

  it('does not render the hidden votes indicator for closed polls', () => {
    render(<PollCard poll={makeActivePoll({ status: 'closed' })} />)
    expect(screen.queryByText(/votes hidden until cutoff/i)).not.toBeInTheDocument()
  })

  it('renders "Closed · awaiting resolution" badge for closed unanswered polls', () => {
    render(<PollCard poll={makeActivePoll({ status: 'closed', answered: false })} />)
    expect(screen.getByText(/closed · awaiting resolution/i)).toBeInTheDocument()
  })

  it('does not render "Closed" badge for active polls', () => {
    render(<PollCard poll={makeActivePoll({ status: 'active' })} />)
    expect(screen.queryByText(/closed · awaiting resolution/i)).not.toBeInTheDocument()
  })

  it('renders as an anchor tag when href is provided', () => {
    const { container } = render(
      <PollCard poll={makeActivePoll()} href="/polls/poll-001" />,
    )
    const anchor = container.querySelector('a')
    expect(anchor).toBeInTheDocument()
    expect(anchor).toHaveAttribute('href', '/polls/poll-001')
  })

  it('renders as a div when href is not provided', () => {
    const { container } = render(<PollCard poll={makeActivePoll()} />)
    expect(container.querySelector('a')).not.toBeInTheDocument()
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('renders resolution pending text for closed polls', () => {
    render(<PollCard poll={makeActivePoll({ status: 'closed', resolves: '2025-06-01' })} />)
    expect(screen.getByText(/resolution pending/i)).toBeInTheDocument()
  })
})
