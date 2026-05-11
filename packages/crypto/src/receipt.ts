import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

export interface VoteReceipt {
  hash: string
  pollId: string
  userId: string
  timestamp: string
  shortHash: string
}

export const generateReceiptHash = (pollId: string, userId: string, encryptedVote: string, timestamp: string): string => {
  const data = `${pollId}:${userId}:${encryptedVote}:${timestamp}`
  return bytesToHex(sha256(new TextEncoder().encode(data)))
}

export const createVoteReceipt = (pollId: string, userId: string, encryptedVote: string): VoteReceipt => {
  const timestamp = new Date().toISOString()
  const hash = generateReceiptHash(pollId, userId, encryptedVote, timestamp)
  const shortHash = `0x${hash.slice(0, 4).toUpperCase()}…${hash.slice(-4).toUpperCase()}`

  return { hash, pollId, userId, timestamp, shortHash }
}
