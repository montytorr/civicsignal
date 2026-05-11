import nacl from 'tweetnacl'

const base64ToUint8 = (b64: string): Uint8Array => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const uint8ToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export const encryptVoteClient = (answer: string, pollPublicKeyB64: string): string => {
  const message = new TextEncoder().encode(answer)
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const ephemeral = nacl.box.keyPair()
  const pollPubKey = base64ToUint8(pollPublicKeyB64)

  const encrypted = nacl.box(message, nonce, pollPubKey, ephemeral.secretKey)

  const packed = new Uint8Array(ephemeral.publicKey.length + nonce.length + encrypted.length)
  packed.set(ephemeral.publicKey)
  packed.set(nonce, ephemeral.publicKey.length)
  packed.set(encrypted, ephemeral.publicKey.length + nonce.length)

  return uint8ToBase64(packed)
}
