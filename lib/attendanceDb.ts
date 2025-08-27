import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import { encryptField, hmacForUnique, decryptField } from './crypto'

let adb: Database | null = null

function resolveAttDbPath() {
  const envPath = process.env.CTF_ATT_DB_PATH
  if (envPath) return envPath
  const candidates = [
    path.join(process.cwd(), 'data', 'attendance.db'),
    path.join(process.cwd(), '..', 'data', 'attendance.db'),
    path.join(__dirname || '.', 'data', 'attendance.db'),
    path.join(__dirname || '.', '..', 'data', 'attendance.db')
  ]
  const fs = require('fs')
  for (const c of candidates) {
    const dir = path.dirname(c)
    if (fs.existsSync(dir)) return c
  }
  return path.join(process.cwd(), 'data', 'attendance.db')
}

export async function initAttendanceDb() {
  if (adb) return adb
  const dbPath = resolveAttDbPath()
  const fs = require('fs')
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  adb = await open({ filename: dbPath, driver: sqlite3.Database })
  await createTables()
  await migrateEventsSchema()
  await insertDefaultEvents()
  return adb
}

async function createTables() {
  if (!adb) throw new Error('Attendance DB not initialized')

  await adb.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      registration_start DATETIME,
      registration_end DATETIME,
      start_time DATETIME,
      end_time DATETIME,
      location_name TEXT,
      latitude REAL,
      longitude REAL,
      radius_meters INTEGER DEFAULT 150,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await adb.exec(`
    CREATE TABLE IF NOT EXISTS event_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      name TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_meters INTEGER NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events (id)
    )
  `)

  await adb.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      email_enc TEXT NOT NULL,
      phone_enc TEXT NOT NULL,
      attendee_enc TEXT NOT NULL,
      email_hmac TEXT NOT NULL,
      attendee_hmac TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      distance_meters REAL,
      status TEXT NOT NULL CHECK (status IN ('accepted','rejected')),
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id)
    )
  `)

  await adb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_att_event_email_hmac ON attendance(event_id, email_hmac);`)
  await adb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_att_event_attendee_hmac ON attendance(event_id, attendee_hmac);`)

  await adb.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      email_enc TEXT NOT NULL,
      phone_enc TEXT NOT NULL,
      attendee_enc TEXT NOT NULL,
      email_hmac TEXT NOT NULL,
      attendee_hmac TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id)
    )
  `)
  await adb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_event_email_hmac ON registrations(event_id, email_hmac);`)
  await adb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_event_attendee_hmac ON registrations(event_id, attendee_hmac);`)
}

async function migrateEventsSchema() {
  if (!adb) throw new Error('Attendance DB not initialized')
  const cols = await adb.all(`PRAGMA table_info(events)`) as any[]
  const names = new Set((cols || []).map(c => c.name))
  const toAdd: Array<{ name: string; type: string; defaultSql?: string }> = []
  if (!names.has('registration_start')) toAdd.push({ name: 'registration_start', type: 'DATETIME' })
  if (!names.has('registration_end')) toAdd.push({ name: 'registration_end', type: 'DATETIME' })
  for (const c of toAdd) {
    const sql = `ALTER TABLE events ADD COLUMN ${c.name} ${c.type}${c.defaultSql ? ' ' + c.defaultSql : ''}`
    try {
      await adb.exec(sql)
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (!/duplicate column/i.test(msg)) throw err
    }
  }
}

async function insertDefaultEvents() {
  if (!adb) throw new Error('Attendance DB not initialized')
  const row = await adb.get(`SELECT COUNT(*) as cnt FROM events`)
  if (row && row.cnt > 0) return
  const now = Date.now()
  const defaultLat = 40.442205
  const defaultLon = -3.834616
  const defaultRad = 100
  const events = [
    { id: 'opening-ceremony', name: 'Opening Ceremony', description: 'Welcome!', start_time: new Date(now + 3600e3).toISOString(), end_time: new Date(now + 3*3600e3).toISOString(), location_name: 'Main Hall', latitude: defaultLat, longitude: defaultLon, radius_meters: defaultRad, is_active: 1 },
    { id: 'workshop-cryptography', name: 'Cryptography Workshop', description: 'Hands-on crypto', start_time: new Date(now + 4*3600e3).toISOString(), end_time: new Date(now + 6*3600e3).toISOString(), location_name: 'Lab A', latitude: defaultLat, longitude: defaultLon, radius_meters: defaultRad, is_active: 1 }
  ]
  for (const e of events) {
    const regStart = new Date(now).toISOString()
    const regEnd = new Date(now + 45*60*1000).toISOString()
    await adb.run(`INSERT OR IGNORE INTO events (id,name,description,registration_start,registration_end,start_time,end_time,location_name,latitude,longitude,radius_meters,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [e.id, e.name, e.description, regStart, regEnd, e.start_time, e.end_time, e.location_name, e.latitude, e.longitude, e.radius_meters, e.is_active])
  }
  // Add example secondary location for opening ceremony
  await adb.run(`INSERT INTO event_locations (event_id, name, latitude, longitude, radius_meters) VALUES (?,?,?,?,?)`, ['opening-ceremony', 'Overflow Room', defaultLat + 0.0007, defaultLon + 0.0011, 100])
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getPublicEvents() {
  const database = await initAttendanceDb()
  return await database.all(`SELECT id, name, description, registration_start, registration_end, start_time, end_time, location_name, latitude, longitude, radius_meters, is_active FROM events WHERE is_active = 1 ORDER BY start_time ASC`)
}

export async function recordAttendance(params: {
  eventId: string,
  email: string,
  phone: string,
  attendeeId: string,
  latitude: number,
  longitude: number,
  accuracy?: number
}) {
  const database = await initAttendanceDb()
  const event = await database.get(`SELECT * FROM events WHERE id = ? AND is_active = 1`, [params.eventId])
  if (!event) return { success: false, status: 'rejected' as const, message: 'Event not found or inactive' }

  // Time window: only allow attendance between start_time and end_time
  const nowIso = new Date().toISOString()
  if (event.start_time && nowIso < event.start_time) {
    return { success: false, status: 'rejected' as const, message: 'Check-in not open yet' }
  }
  if (event.end_time && nowIso > event.end_time) {
    return { success: false, status: 'rejected' as const, message: 'Check-in closed' }
  }

  const locs = await database.all(`SELECT latitude, longitude, radius_meters FROM event_locations WHERE event_id = ?`, [params.eventId])
  const candidates = Array.isArray(locs) && locs.length > 0 ? locs : (typeof event.latitude === 'number' && typeof event.longitude === 'number' ? [{ latitude: event.latitude, longitude: event.longitude, radius_meters: event.radius_meters ?? 150 }] : [])
  if (candidates.length === 0) return { success: false, status: 'rejected' as const, message: 'Event location not configured' }

  let minDistance = Infinity
  let accepted = false
  for (const c of candidates) {
    const d = haversine(c.latitude, c.longitude, params.latitude, params.longitude)
    minDistance = Math.min(minDistance, d)
    if (d <= (c.radius_meters ?? 150)) accepted = true
  }

  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const status: 'accepted' | 'rejected' = accepted ? 'accepted' : 'rejected'
  const reason = accepted ? null : `Outside allowed radius (min ${Math.round(minDistance)}m)`

  const emailEnc = encryptField(params.email)
  const phoneEnc = encryptField(params.phone)
  const attendeeEnc = encryptField(params.attendeeId)
  const emailHmac = hmacForUnique(params.email, params.eventId)
  const attendeeHmac = hmacForUnique(params.attendeeId, params.eventId)

  try {
    await database.run(
      `INSERT INTO attendance (id,event_id,email_enc,phone_enc,attendee_enc,email_hmac,attendee_hmac,latitude,longitude,accuracy,distance_meters,status,reason)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, params.eventId, emailEnc, phoneEnc, attendeeEnc, emailHmac, attendeeHmac, params.latitude, params.longitude, params.accuracy ?? null, isFinite(minDistance) ? minDistance : null, status, reason]
    )
    return { success: true, status, distance: isFinite(minDistance) ? minDistance : undefined, message: status === 'accepted' ? 'Attendance recorded' : (reason || 'Attendance rejected') }
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { success: false, status: 'rejected', message: 'Already recorded for this event' }
    }
    throw err
  }
}

export async function registerForEvent(params: {
  eventId: string,
  email: string,
  phone: string,
  attendeeId: string
}) {
  const database = await initAttendanceDb()
  const event = await database.get(`SELECT * FROM events WHERE id = ? AND is_active = 1`, [params.eventId])
  if (!event) return { success: false, message: 'Event not found or inactive' }
  const nowIso = new Date().toISOString()
  if (event.registration_start && nowIso < event.registration_start) {
    return { success: false, message: 'Registration not open yet' }
  }
  if (event.registration_end && nowIso > event.registration_end) {
    return { success: false, message: 'Registration closed' }
  }
  const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const emailEnc = encryptField(params.email)
  const phoneEnc = encryptField(params.phone)
  const attendeeEnc = encryptField(params.attendeeId)
  const emailHmac = hmacForUnique(params.email, params.eventId)
  const attendeeHmac = hmacForUnique(params.attendeeId, params.eventId)
  try {
    await database.run(`INSERT INTO registrations (id,event_id,email_enc,phone_enc,attendee_enc,email_hmac,attendee_hmac) VALUES (?,?,?,?,?,?,?)`, [id, params.eventId, emailEnc, phoneEnc, attendeeEnc, emailHmac, attendeeHmac])
    return { success: true, id }
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { success: false, message: 'Already registered for this event' }
    }
    throw err
  }
}

export async function listAttendanceDecrypted(eventId?: string) {
  const dbx = await initAttendanceDb()
  const rows = await dbx.all(
    `SELECT a.*, e.name as event_name FROM attendance a JOIN events e ON a.event_id = e.id ${eventId ? 'WHERE a.event_id = ?' : ''} ORDER BY a.created_at DESC`,
    eventId ? [eventId] : []
  )
  return (rows as any[]).map(r => ({
    id: r.id,
    event_id: r.event_id,
    event_name: r.event_name,
    created_at: r.created_at,
    email: decryptField(r.email_enc),
    phone: decryptField(r.phone_enc),
    attendee_id: decryptField(r.attendee_enc),
    latitude: r.latitude,
    longitude: r.longitude,
    accuracy: r.accuracy,
    distance_meters: r.distance_meters,
    status: r.status,
    reason: r.reason
  }))
}

export async function listRegistrationsDecrypted(eventId?: string) {
  const dbx = await initAttendanceDb()
  const rows = await dbx.all(
    `SELECT r.*, e.name as event_name FROM registrations r JOIN events e ON r.event_id = e.id ${eventId ? 'WHERE r.event_id = ?' : ''} ORDER BY r.created_at DESC`,
    eventId ? [eventId] : []
  )
  return (rows as any[]).map(r => ({
    id: r.id,
    event_id: r.event_id,
    event_name: r.event_name,
    created_at: r.created_at,
    email: decryptField(r.email_enc),
    phone: decryptField(r.phone_enc),
    attendee_id: decryptField(r.attendee_enc)
  }))
}

export async function upsertEvent(e: {
  id?: string,
  name: string,
  description?: string,
  registration_start?: string | null,
  registration_end?: string | null,
  start_time?: string | null,
  end_time?: string | null,
  location_name?: string | null,
  latitude?: number | null,
  longitude?: number | null,
  radius_meters?: number | null,
  is_active?: number
}) {
  const dbx = await initAttendanceDb()
  if (e.id) {
    await dbx.run(
      `UPDATE events SET name=?, description=?, registration_start=?, registration_end=?, start_time=?, end_time=?, location_name=?, latitude=?, longitude=?, radius_meters=?, is_active=? WHERE id=?`,
      [e.name, e.description ?? null, e.registration_start ?? null, e.registration_end ?? null, e.start_time ?? null, e.end_time ?? null, e.location_name ?? null, e.latitude ?? null, e.longitude ?? null, e.radius_meters ?? null, e.is_active ?? 1, e.id]
    )
    return { id: e.id }
  } else {
    const id = `event-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    await dbx.run(
      `INSERT INTO events (id,name,description,registration_start,registration_end,start_time,end_time,location_name,latitude,longitude,radius_meters,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, e.name, e.description ?? null, e.registration_start ?? null, e.registration_end ?? null, e.start_time ?? null, e.end_time ?? null, e.location_name ?? null, e.latitude ?? null, e.longitude ?? null, e.radius_meters ?? null, e.is_active ?? 1]
    )
    return { id }
  }
}

export async function addEventLocation(eventId: string, loc: { name?: string, latitude: number, longitude: number, radius_meters: number }) {
  const dbx = await initAttendanceDb()
  await dbx.run(`INSERT INTO event_locations (event_id,name,latitude,longitude,radius_meters) VALUES (?,?,?,?,?)`, [eventId, loc.name ?? null, loc.latitude, loc.longitude, loc.radius_meters])
  return { success: true }
}

export async function listAllEvents() {
  const dbx = await initAttendanceDb()
  return await dbx.all(`SELECT * FROM events ORDER BY start_time ASC`)
}

export async function getEventDetails(eventId: string) {
  const dbx = await initAttendanceDb()
  const event = await dbx.get(`SELECT * FROM events WHERE id = ?`, [eventId])
  if (!event) return null
  const locations = await dbx.all(`SELECT id, name, latitude, longitude, radius_meters FROM event_locations WHERE event_id = ?`, [eventId])
  return { event, locations }
}

export async function manualAttendance(params: { eventId: string, email: string, phone: string, attendeeId: string, overrideWindow?: boolean }) {
  const dbx = await initAttendanceDb()
  const event = await dbx.get(`SELECT * FROM events WHERE id = ? AND is_active = 1`, [params.eventId])
  if (!event) return { success: false, message: 'Event not found or inactive' }
  if (!params.overrideWindow) {
    const nowIso = new Date().toISOString()
    if (event.start_time && nowIso < event.start_time) return { success: false, message: 'Check-in not open yet' }
    if (event.end_time && nowIso > event.end_time) return { success: false, message: 'Check-in closed' }
  }
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const emailEnc = encryptField(params.email)
  const phoneEnc = encryptField(params.phone)
  const attendeeEnc = encryptField(params.attendeeId)
  const emailHmac = hmacForUnique(params.email, params.eventId)
  const attendeeHmac = hmacForUnique(params.attendeeId, params.eventId)
  try {
    await dbx.run(
      `INSERT INTO attendance (id,event_id,email_enc,phone_enc,attendee_enc,email_hmac,attendee_hmac,latitude,longitude,accuracy,distance_meters,status,reason)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, params.eventId, emailEnc, phoneEnc, attendeeEnc, emailHmac, attendeeHmac, null, null, null, null, 'accepted', 'manual']
    )
    return { success: true, id }
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('UNIQUE') || msg.includes('unique')) return { success: false, message: 'Already recorded for this event' }
    throw err
  }
}

export async function exportAttendanceCSV(eventId: string): Promise<string> {
  const database = await initAttendanceDb()
  const rows = await database.all(
    `SELECT a.*, e.name as event_name FROM attendance a JOIN events e ON a.event_id = e.id WHERE a.event_id = ? ORDER BY a.created_at ASC`,
    [eventId]
  )
  const headers = [
    'event_id','event_name','created_at','email','phone','attendee_id','latitude','longitude','accuracy','distance_meters','status','reason'
  ]
  const lines = [headers.join(',')]
  for (const r of rows as any[]) {
    const email = safeCsv(decryptField(r.email_enc))
    const phone = safeCsv(decryptField(r.phone_enc))
    const attendee = safeCsv(decryptField(r.attendee_enc))
    const vals = [
      r.event_id,
      safeCsv(r.event_name),
      r.created_at,
      email,
      phone,
      attendee,
      r.latitude ?? '',
      r.longitude ?? '',
      r.accuracy ?? '',
      r.distance_meters ?? '',
      r.status,
      safeCsv(r.reason || '')
    ]
    lines.push(vals.map(v => String(v)).join(','))
  }
  return lines.join('\n')
}

function safeCsv(s: string): string {
  if (s == null) return ''
  // Quote if needed and escape quotes
  const needs = /[",\n]/.test(s)
  const esc = s.replace(/"/g, '""')
  return needs ? `"${esc}"` : esc
}
