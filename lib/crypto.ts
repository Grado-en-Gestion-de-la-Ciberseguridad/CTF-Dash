import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey

  const keyB64 = process.env.CTF_ATT_KEY
  if (keyB64) {
    const key = Buffer.from(keyB64, 'base64')
    if (key.length !== 32) {
      throw new Error('CTF_ATT_KEY must be a base64-encoded 32-byte key')
    }
    cachedKey = key
    return cachedKey
  }

  // Development fallback: try to load from data/ctf_att_key. If not present, generate and persist.
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const keyFile = path.join(dataDir, 'ctf_att_key')
    if (fs.existsSync(keyFile)) {
      const fileB64 = fs.readFileSync(keyFile, 'utf8').trim()
      const key = Buffer.from(fileB64, 'base64')
      if (key.length === 32) {
        cachedKey = key
        return cachedKey
      } else {
        console.warn('Existing data/ctf_att_key is not a base64-encoded 32-byte key; ignoring')
      }
    }
    // Generate a new key and persist it
    const gen = crypto.randomBytes(32)
    const genB64 = gen.toString('base64')
    fs.mkdirSync(dataDir, { recursive: true })
    fs.writeFileSync(keyFile, genB64, { encoding: 'utf8', mode: 0o600 })
    console.warn('CTF_ATT_KEY not set. Generated a development key at data/ctf_att_key. For production, set CTF_ATT_KEY to a base64-encoded 32-byte key.')
    cachedKey = gen
    return cachedKey
  } catch (e) {
    throw new Error('CTF_ATT_KEY is not set and a fallback key could not be created. Set CTF_ATT_KEY to a base64-encoded 32-byte key.')
  }
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
