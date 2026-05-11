import { describe, it, expect } from 'vitest'
import { generatePollKeypair, encryptVote, decryptVote } from '../src/encryption'

describe('generatePollKeypair', () => {
  it('returns an object with publicKey and secretKey', () => {
    const keypair = generatePollKeypair()
    expect(keypair).toHaveProperty('publicKey')
    expect(keypair).toHaveProperty('secretKey')
  })

  it('publicKey and secretKey are non-empty base64 strings', () => {
    const { publicKey, secretKey } = generatePollKeypair()
    const base64Re = /^[A-Za-z0-9+/]+=*$/
    expect(publicKey).toMatch(base64Re)
    expect(secretKey).toMatch(base64Re)
  })

  it('generates unique keypairs each call', () => {
    const kp1 = generatePollKeypair()
    const kp2 = generatePollKeypair()
    expect(kp1.publicKey).not.toBe(kp2.publicKey)
    expect(kp1.secretKey).not.toBe(kp2.secretKey)
  })

  it('publicKey is 32 bytes (44 chars base64 with padding)', () => {
    const { publicKey } = generatePollKeypair()
    // nacl box public key is 32 bytes → 44 base64 chars with padding
    expect(Buffer.from(publicKey, 'base64').length).toBe(32)
  })

  it('secretKey is 32 bytes', () => {
    const { secretKey } = generatePollKeypair()
    expect(Buffer.from(secretKey, 'base64').length).toBe(32)
  })
})

describe('encryptVote + decryptVote roundtrip', () => {
  it('decrypts to the original plaintext', () => {
    const { publicKey, secretKey } = generatePollKeypair()
    const plaintext = 'Option A'
    const encrypted = encryptVote(plaintext, publicKey)
    const decrypted = decryptVote(encrypted, secretKey)
    expect(decrypted).toBe(plaintext)
  })

  it('roundtrips for multi-word answers', () => {
    const { publicKey, secretKey } = generatePollKeypair()
    const plaintext = 'Strongly Agree'
    expect(decryptVote(encryptVote(plaintext, publicKey), secretKey)).toBe(plaintext)
  })

  it('roundtrips for answers with special characters', () => {
    const { publicKey, secretKey } = generatePollKeypair()
    const plaintext = 'Option: Yes (100%)'
    expect(decryptVote(encryptVote(plaintext, publicKey), secretKey)).toBe(plaintext)
  })

  it('encrypted output differs from plaintext', () => {
    const { publicKey } = generatePollKeypair()
    const plaintext = 'Yes'
    const encrypted = encryptVote(plaintext, publicKey)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted).not.toContain(plaintext)
  })

  it('encrypting the same plaintext twice produces different ciphertext (random nonce)', () => {
    const { publicKey } = generatePollKeypair()
    const plaintext = 'Same answer'
    const enc1 = encryptVote(plaintext, publicKey)
    const enc2 = encryptVote(plaintext, publicKey)
    expect(enc1).not.toBe(enc2)
  })

  it('encrypted output is a valid base64 string', () => {
    const { publicKey } = generatePollKeypair()
    const encrypted = encryptVote('test', publicKey)
    const base64Re = /^[A-Za-z0-9+/]+=*$/
    expect(encrypted).toMatch(base64Re)
  })

  it('throws when decrypting with the wrong secret key', () => {
    const { publicKey } = generatePollKeypair()
    const { secretKey: wrongSecretKey } = generatePollKeypair()
    const encrypted = encryptVote('secret vote', publicKey)
    expect(() => decryptVote(encrypted, wrongSecretKey)).toThrow('Decryption failed')
  })
})
