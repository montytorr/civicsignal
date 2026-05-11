import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

export const hashLeaf = (data: string): string => {
  return bytesToHex(sha256(new TextEncoder().encode(data)))
}

export const hashPair = (left: string, right: string): string => {
  return bytesToHex(sha256(new TextEncoder().encode(left + right)))
}

export const buildMerkleRoot = (leaves: string[]): string => {
  if (leaves.length === 0) return hashLeaf('')
  if (leaves.length === 1) return leaves[0]

  const hashed = leaves.map(hashLeaf)
  let layer = hashed

  while (layer.length > 1) {
    const next: string[] = []
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(hashPair(layer[i], layer[i + 1]))
      } else {
        next.push(layer[i])
      }
    }
    layer = next
  }

  return layer[0]
}

export const buildMerkleTree = (leaves: string[]): { root: string; tree: string[][] } => {
  if (leaves.length === 0) return { root: hashLeaf(''), tree: [[hashLeaf('')]] }

  const hashed = leaves.map(hashLeaf)
  const tree: string[][] = [hashed]
  let layer = hashed

  while (layer.length > 1) {
    const next: string[] = []
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(hashPair(layer[i], layer[i + 1]))
      } else {
        next.push(layer[i])
      }
    }
    tree.push(next)
    layer = next
  }

  return { root: layer[0], tree }
}
