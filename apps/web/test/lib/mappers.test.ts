import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mapDbPollToUiPoll } from '@/lib/mappers'

const makeDbPoll = (overrides: Record<string, unknown> = {}) => ({
  id: 'poll-001',
  question: 'Should the voting age be lowered to 16?',
  topics: { slug: 'elect' },
  region: 'GB',
  cutoff_at: new Date(Date.now() + 5 * 86_400_000).toISOString(), // 5 days from now
  resolves_at: '2025-03-01T00:00:00.000Z',
  options: ['Yes', 'No', 'Abstain'],
  source_of_truth: 'https://example.com/source',
  status: 'active',
  ...overrides,
})

describe('mapDbPollToUiPoll', () => {
  it('maps id correctly', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 42, false)
    expect(poll.id).toBe('poll-001')
  })

  it('maps question to q field', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 42, false)
    expect(poll.q).toBe('Should the voting age be lowered to 16?')
  })

  it('maps topic from topics.slug', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 42, false)
    expect(poll.topic).toBe('elect')
  })

  it('falls back to empty string when topics is null', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll({ topics: null }), 0, false)
    expect(poll.topic).toBe('')
  })

  it('maps region', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 42, false)
    expect(poll.region).toBe('GB')
  })

  it('maps voteCount to participants', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 1337, false)
    expect(poll.participants).toBe(1337)
  })

  it('maps hasVoted to answered', () => {
    expect(mapDbPollToUiPoll(makeDbPoll(), 0, true).answered).toBe(true)
    expect(mapDbPollToUiPoll(makeDbPoll(), 0, false).answered).toBe(false)
  })

  it('maps options array directly', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 0, false)
    expect(poll.options).toEqual(['Yes', 'No', 'Abstain'])
  })

  it('parses JSON string options', () => {
    const dbPoll = makeDbPoll({ options: '["Yes","No"]' })
    const poll = mapDbPollToUiPoll(dbPoll, 0, false)
    expect(poll.options).toEqual(['Yes', 'No'])
  })

  it('maps source_of_truth to source', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 0, false)
    expect(poll.source).toBe('https://example.com/source')
  })

  it('trims resolves_at to date portion only', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll(), 0, false)
    expect(poll.resolves).toBe('2025-03-01')
  })

  it('returns empty string for resolves when resolves_at is null', () => {
    const poll = mapDbPollToUiPoll(makeDbPoll({ resolves_at: null }), 0, false)
    expect(poll.resolves).toBe('')
  })

  describe('cutoffLabel', () => {
    it('shows "in Xd Yh" for a future cutoff within 30 days', () => {
      const cutoff = new Date(Date.now() + 3 * 86_400_000 + 2 * 3_600_000)
      const poll = mapDbPollToUiPoll(makeDbPoll({ cutoff_at: cutoff.toISOString() }), 0, false)
      expect(poll.cutoffLabel).toMatch(/^in \d+d \d+h$/)
    })

    it('shows "in Xmo" for a cutoff more than 30 days away', () => {
      const cutoff = new Date(Date.now() + 65 * 86_400_000)
      const poll = mapDbPollToUiPoll(makeDbPoll({ cutoff_at: cutoff.toISOString() }), 0, false)
      expect(poll.cutoffLabel).toMatch(/^in \d+mo$/)
    })

    it('shows "in Xh" for a cutoff within the same day', () => {
      const cutoff = new Date(Date.now() + 5 * 3_600_000)
      const poll = mapDbPollToUiPoll(makeDbPoll({ cutoff_at: cutoff.toISOString() }), 0, false)
      expect(poll.cutoffLabel).toMatch(/^in \d+h$/)
    })

    it('shows "closed" for a past cutoff', () => {
      const cutoff = new Date(Date.now() - 86_400_000)
      const poll = mapDbPollToUiPoll(makeDbPoll({ cutoff_at: cutoff.toISOString() }), 0, false)
      expect(poll.cutoffLabel).toBe('closed')
    })
  })

  describe('status derivation', () => {
    it('returns "resolved" when db status is "resolved"', () => {
      const poll = mapDbPollToUiPoll(makeDbPoll({ status: 'resolved' }), 0, false)
      expect(poll.status).toBe('resolved')
    })

    it('returns "active" for a future cutoff with non-resolved status', () => {
      const cutoff = new Date(Date.now() + 86_400_000)
      const poll = mapDbPollToUiPoll(
        makeDbPoll({ cutoff_at: cutoff.toISOString(), status: 'active' }),
        0,
        false,
      )
      expect(poll.status).toBe('active')
    })

    it('returns "closed" for a past cutoff with non-resolved status', () => {
      const cutoff = new Date(Date.now() - 86_400_000)
      const poll = mapDbPollToUiPoll(
        makeDbPoll({ cutoff_at: cutoff.toISOString(), status: 'active' }),
        0,
        false,
      )
      expect(poll.status).toBe('closed')
    })
  })
})
