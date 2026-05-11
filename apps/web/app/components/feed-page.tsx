'use client'

import { useState } from 'react'
import { PollCard, Eyebrow, topicById } from '@civicsignal/ui'
import type { Poll } from '@civicsignal/ui'

const SORT_OPTIONS = ['Cutoff', 'Newest', 'Popular'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

interface Props {
  polls: Poll[]
  topics: string[]
}

export const FeedPage = ({ polls, topics }: Props) => {
  const allTopics = ['All', ...topics]
  const [topic, setTopic] = useState('All')
  const [sort, setSort] = useState<SortOption>('Cutoff')
  const [region, setRegion] = useState('All regions')

  const filtered = polls.filter(
    (poll) => topic === 'All' || topicById(poll.topic)?.label === topic,
  )

  return (
    <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>
      <main style={{ padding: '40px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div>
            <Eyebrow>Active polls</Eyebrow>
            <h1 style={{ margin: '8px 0 0', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-parchment-ink)' }}>
              What civic questions are open right now
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              className="font-mono"
              style={{ fontSize: 26, color: 'var(--color-parchment-ink)', fontVariantNumeric: 'tabular-nums' }}
            >
              {filtered.length}
            </div>
            <Eyebrow>Open polls</Eyebrow>
          </div>
        </div>

        {/* Subhead */}
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--color-parchment-ink-soft)', maxWidth: 620 }}>
          Vote totals and percentages are hidden while a poll is open. You see only the question, the topic, the source-of-truth, and how many other verified humans have already answered.
        </p>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--color-parchment-line)', marginBottom: 24 }}>
          <Eyebrow>Filter</Eyebrow>

          {/* Topic pills */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            {allTopics.map((t) => {
              const active = t === topic
              return (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12.5,
                    color: active ? 'var(--color-parchment-bg)' : 'var(--color-parchment-ink-soft)',
                    background: active ? 'var(--color-parchment-ink)' : 'transparent',
                    border: `1px solid ${active ? 'var(--color-parchment-ink)' : 'var(--color-parchment-line)'}`,
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Region select */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              appearance: 'none',
              padding: '8px 28px 8px 12px',
              fontSize: 12.5,
              color: 'var(--color-parchment-ink-soft)',
              background: 'var(--color-parchment-surface)',
              border: '1px solid var(--color-parchment-line)',
              borderRadius: 4,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option>All regions</option>
            <option>Global</option>
            <option>United States</option>
            <option>European Union</option>
            <option>United Nations</option>
            <option>OPEC+</option>
          </select>

          {/* Sort tabs */}
          <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--color-parchment-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span>SORT</span>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  color: sort === s ? 'var(--color-parchment-ink)' : 'var(--color-parchment-muted)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: sort === s ? '1px solid var(--color-parchment-ink)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Poll grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map((poll) => (
            <PollCard key={poll.id} poll={poll} href={`/polls/${poll.id}`} />
          ))}
        </div>
      </main>
    </div>
  )
}
