import crypto from 'crypto'

function getKey(): Buffer {
  const keyB64 = process.env.CTF_ATT_KEY
  if (!keyB64) {
    throw new Error('CTF_ATT_KEY is not set; cannot encrypt/decrypt attendance data')
  }
  // Expect base64-encoded 32-byte key
  const key = Buffer.from(keyB64, 'base64')
  if (key.length !== 32) {
    throw new Error('CTF_ATT_KEY must be a base64-encoded 32-byte key')
  }
  return key
}

export function encryptField(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12) // GCM nonce
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Store iv + tag + ciphertext in base64
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptField(ciphertextB64: string): string {
  const key = getKey()
  const raw = Buffer.from(ciphertextB64, 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const data = raw.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}

export function hmacForUnique(value: string, eventId: string): string {
  const key = getKey()
  // derive HMAC key by hashing the key for domain separation
  const hmacKey = crypto.createHash('sha256').update(Buffer.concat([Buffer.from('att-hmac', 'utf8'), key])).digest()
  const h = crypto.createHmac('sha256', hmacKey)
  h.update(eventId)
  h.update('|')
  h.update(value.toLowerCase().trim())
  return h.digest('hex') // hex safe for indexing
}
