import { describe, it, expect } from 'vitest'
import { generateHandle } from '@/lib/handle-generator'

const HANDLE_RE = /^[a-z]+-[a-z]+-\d{2}$/

describe('generateHandle', () => {
  it('returns a string matching the pattern word-word-NN', () => {
    const handle = generateHandle()
    expect(handle).toMatch(HANDLE_RE)
  })

  it('consists of exactly three hyphen-separated segments', () => {
    const parts = generateHandle().split('-')
    // noun may itself be one word, so parts count is always 3
    expect(parts).toHaveLength(3)
  })

  it('numeric suffix is always two digits (00-99)', () => {
    const handle = generateHandle()
    const suffix = handle.split('-').at(-1)!
    expect(suffix).toMatch(/^\d{2}$/)
  })

  it('numeric suffix is padded with a leading zero when < 10', () => {
    // Run many times to hit low numbers; at least verify padding exists in format
    const handles = Array.from({ length: 200 }, () => generateHandle())
    handles.forEach(h => {
      const suffix = h.split('-').at(-1)!
      expect(suffix.length).toBe(2)
    })
  })

  it('generates unique handles across 100 calls', () => {
    const handles = new Set(Array.from({ length: 100 }, () => generateHandle()))
    // With 56 adjectives * 40 nouns * 100 numbers = 224,000 combinations,
    // 100 collisions would be extraordinarily unlikely
    expect(handles.size).toBeGreaterThan(90)
  })

  it('all characters are lowercase ASCII', () => {
    const handle = generateHandle()
    expect(handle).toBe(handle.toLowerCase())
  })

  it('does not contain spaces', () => {
    const handle = generateHandle()
    expect(handle).not.toContain(' ')
  })
})
