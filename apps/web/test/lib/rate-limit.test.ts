import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// The rate-limit module uses a module-level Map, so we need a fresh import
// for each test to avoid state leaking between tests.
// We do this by re-importing via a dynamic import workaround — but since
// vitest caches modules, we instead reset via vi.resetModules() in beforeEach.

let rateLimit: (key: string, maxAttempts: number, windowMs: number) => { allowed: boolean; remaining: number }

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('@/lib/rate-limit')
  rateLimit = mod.rateLimit
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('rateLimit', () => {
  const KEY = 'test-ip-127.0.0.1'
  const MAX = 3
  const WINDOW = 60_000

  it('allows the first request and returns correct remaining count', () => {
    const result = rateLimit(KEY, MAX, WINDOW)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(MAX - 1)
  })

  it('allows requests up to the limit', () => {
    for (let i = 0; i < MAX; i++) {
      const result = rateLimit(KEY, MAX, WINDOW)
      expect(result.allowed).toBe(true)
    }
  })

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < MAX; i++) rateLimit(KEY, MAX, WINDOW)
    const result = rateLimit(KEY, MAX, WINDOW)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('remaining decrements correctly with each request', () => {
    const r1 = rateLimit(KEY, MAX, WINDOW)
    expect(r1.remaining).toBe(2)

    const r2 = rateLimit(KEY, MAX, WINDOW)
    expect(r2.remaining).toBe(1)

    const r3 = rateLimit(KEY, MAX, WINDOW)
    expect(r3.remaining).toBe(0)
  })

  it('resets after the window expires', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // Exhaust the limit
    for (let i = 0; i < MAX; i++) rateLimit(KEY, MAX, WINDOW)
    expect(rateLimit(KEY, MAX, WINDOW).allowed).toBe(false)

    // Advance time past the window
    vi.spyOn(Date, 'now').mockReturnValue(now + WINDOW + 1)

    const result = rateLimit(KEY, MAX, WINDOW)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(MAX - 1)
  })

  it('different keys are tracked independently', () => {
    const KEY_A = 'user-a'
    const KEY_B = 'user-b'

    // Exhaust KEY_A
    for (let i = 0; i < MAX; i++) rateLimit(KEY_A, MAX, WINDOW)
    expect(rateLimit(KEY_A, MAX, WINDOW).allowed).toBe(false)

    // KEY_B should still be fresh
    const resultB = rateLimit(KEY_B, MAX, WINDOW)
    expect(resultB.allowed).toBe(true)
    expect(resultB.remaining).toBe(MAX - 1)
  })

  it('allows exactly maxAttempts requests then blocks', () => {
    const results = Array.from({ length: MAX + 2 }, () => rateLimit(KEY, MAX, WINDOW))
    const allowed = results.filter(r => r.allowed)
    const blocked = results.filter(r => !r.allowed)
    expect(allowed).toHaveLength(MAX)
    expect(blocked).toHaveLength(2)
  })
})
