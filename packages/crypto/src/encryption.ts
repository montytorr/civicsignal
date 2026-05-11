import nacl from 'tweetnacl'

export const generatePollKeypair = () => {
  const keypair = nacl.box.keyPair()
  return {
    publicKey: Buffer.from(keypair.publicKey).toString('base64'),
    secretKey: Buffer.from(keypair.secretKey).toString('base64'),
  }
}

export const encryptVote = (answer: string, pollPublicKey: string): string => {
  const message = new TextEncoder().encode(answer)
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const ephemeralKeypair = nacl.box.keyPair()
  const publicKeyBytes = Buffer.from(pollPublicKey, 'base64')

  const encrypted = nacl.box(message, nonce, publicKeyBytes, ephemeralKeypair.secretKey)

  // Pack: ephemeral public key + nonce + ciphertext
  const packed = new Uint8Array(ephemeralKeypair.publicKey.length + nonce.length + encrypted.length)
  packed.set(ephemeralKeypair.publicKey)
  packed.set(nonce, ephemeralKeypair.publicKey.length)
  packed.set(encrypted, ephemeralKeypair.publicKey.length + nonce.length)

  return Buffer.from(packed).toString('base64')
}

export const decryptVote = (encryptedVote: string, pollSecretKey: string): string => {
  const packed = Buffer.from(encryptedVote, 'base64')
  const ephemeralPublicKey = packed.slice(0, nacl.box.publicKeyLength)
  const nonce = packed.slice(nacl.box.publicKeyLength, nacl.box.publicKeyLength + nacl.box.nonceLength)
  const ciphertext = packed.slice(nacl.box.publicKeyLength + nacl.box.nonceLength)
  const secretKeyBytes = Buffer.from(pollSecretKey, 'base64')

  const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPublicKey, secretKeyBytes)
  if (!decrypted) throw new Error('Decryption failed')

  return new TextDecoder().decode(decrypted)
}
