import { describe, it, expect } from 'vitest'
import { buildMerkleRoot, hashLeaf, hashPair } from '../src/merkle'

describe('buildMerkleRoot', () => {
  it('returns the hash of an empty string when given no leaves', () => {
    const result = buildMerkleRoot([])
    expect(result).toBe(hashLeaf(''))
    expect(result).toHaveLength(64)
  })

  it('returns the single leaf value unchanged when given one leaf', () => {
    const leaf = 'only-leaf'
    const result = buildMerkleRoot([leaf])
    // Single leaf is returned as-is (no re-hashing)
    expect(result).toBe(leaf)
  })

  it('returns hash of the pair when given two leaves', () => {
    const leaves = ['alpha', 'beta']
    const result = buildMerkleRoot(leaves)
    const expected = hashPair(hashLeaf('alpha'), hashLeaf('beta'))
    expect(result).toBe(expected)
  })

  it('produces deterministic output for the same input', () => {
    const leaves = ['vote-1', 'vote-2', 'vote-3', 'vote-4']
    const first = buildMerkleRoot(leaves)
    const second = buildMerkleRoot(leaves)
    expect(first).toBe(second)
  })

  it('produces different roots for different inputs', () => {
    const rootA = buildMerkleRoot(['a', 'b', 'c'])
    const rootB = buildMerkleRoot(['a', 'b', 'd'])
    expect(rootA).not.toBe(rootB)
  })

  it('handles an odd number of leaves without throwing', () => {
    expect(() => buildMerkleRoot(['x', 'y', 'z'])).not.toThrow()
    const result = buildMerkleRoot(['x', 'y', 'z'])
    expect(result).toHaveLength(64)
  })

  it('produces a 64-character hex root for a balanced tree', () => {
    const result = buildMerkleRoot(['a', 'b', 'c', 'd'])
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('root changes when leaf order changes', () => {
    const rootAB = buildMerkleRoot(['leaf-a', 'leaf-b'])
    const rootBA = buildMerkleRoot(['leaf-b', 'leaf-a'])
    expect(rootAB).not.toBe(rootBA)
  })
})

describe('hashLeaf', () => {
  it('returns a 64-character hex string', () => {
    expect(hashLeaf('test')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic', () => {
    expect(hashLeaf('determinism')).toBe(hashLeaf('determinism'))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashLeaf('a')).not.toBe(hashLeaf('b'))
  })
})
