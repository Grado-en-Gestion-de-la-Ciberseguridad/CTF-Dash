import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import bcrypt from 'bcryptjs'
import path from 'path'

// Database connection
let db: Database | null = null

function resolveDbPath() {
  const envPath = process.env.CTF_DB_PATH || process.env.DATABASE_PATH
  if (envPath) return envPath

  const candidates = [
    path.join(process.cwd(), 'data', 'ctf.db'),
    path.join(process.cwd(), '..', 'data', 'ctf.db'),
    path.join(process.cwd(), '..', '..', 'data', 'ctf.db'),
    path.join(__dirname || '.', 'data', 'ctf.db'),
    path.join(__dirname || '.', '..', 'data', 'ctf.db'),
    path.join(__dirname || '.', '..', '..', 'data', 'ctf.db')
  ]

  const fs = require('fs')
  for (const candidate of candidates) {
    const dir = path.dirname(candidate)
    if (fs.existsSync(dir)) {
      return candidate
    }
  }
  // Fallback to process cwd data dir
  return path.join(process.cwd(), 'data', 'ctf.db')
}

export async function initDatabase() {
  if (db) return db

  const dbPath = resolveDbPath()
  
  // Ensure data directory exists
  const fs = require('fs')
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // Create tables
  await createTables()
  
  // Insert default admin users
  await insertDefaultUsers()
  // Insert default events (public attendance)
  await insertDefaultEvents()

  return db
}

async function createTables() {
  if (!db) throw new Error('Database not initialized')

  // Teams table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      members TEXT NOT NULL, -- JSON array of member names
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_score INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1
    )
  `)

  // Admin/Staff users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `)

  // Submissions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('correct', 'incorrect', 'pending')),
      points INTEGER DEFAULT 0,
      penalty INTEGER DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_by TEXT NULL,
      reviewed_at DATETIME NULL,
      review_notes TEXT NULL,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    )
  `)

  // Add unique constraint to prevent duplicate correct submissions
  // First, clean up any existing duplicates before adding the constraint
  await db.exec(`
    -- Remove duplicate correct submissions, keeping only the first one for each team/challenge
    DELETE FROM submissions 
    WHERE rowid NOT IN (
      SELECT MIN(rowid) 
      FROM submissions 
      WHERE status = 'correct' 
      GROUP BY team_id, challenge_id
    ) AND status = 'correct'
  `)
  
  // Recalculate team scores after removing duplicates
  await db.exec(`
    UPDATE teams SET total_score = (
      COALESCE((SELECT SUM(points) FROM submissions WHERE team_id = teams.id AND status = 'correct'), 0)
      - COALESCE((SELECT SUM(penalty) FROM submissions WHERE team_id = teams.id AND status = 'incorrect'), 0)
    )
  `)
  
  await db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_correct_submission 
    ON submissions (team_id, challenge_id) 
    WHERE status = 'correct'
  `)

  // Challenge attempts tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS challenge_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      is_correct BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id),
      UNIQUE(team_id, challenge_id, attempt_number)
    )
  `)

  // Create indexes for performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_submissions_team_challenge 
    ON submissions (team_id, challenge_id);
    
    CREATE INDEX IF NOT EXISTS idx_submissions_status 
    ON submissions (status);
    
    CREATE INDEX IF NOT EXISTS idx_attempts_team_challenge 
    ON challenge_attempts (team_id, challenge_id);
  `)

  // Events table (for public attendance tracking)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
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

  // Attendance table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      attendee_id TEXT NOT NULL,
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

  // Uniqueness: one attendance per email or attendee_id per event
  await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_att_event_email ON attendance(event_id, email);`)
  await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_att_event_attendee ON attendance(event_id, attendee_id);`)
  
    // Manual score adjustments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS score_adjustments (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        delta INTEGER NOT NULL,
        reason TEXT,
        actor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id)
      )
    `)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_adjustments_team ON score_adjustments(team_id);`)
}

async function insertDefaultUsers() {
  if (!db) throw new Error('Database not initialized')

  const fs = require('fs') as typeof import('fs')
  const credPath = path.join(process.cwd(), 'admin-credentials.json')
  let usersFromFile: Array<{ username: string; password: string; role: 'admin'|'staff'; name?: string }> | null = null

  try {
    if (fs.existsSync(credPath)) {
      const raw = fs.readFileSync(credPath, 'utf8')
      const parsed = JSON.parse(raw)
      const admins = Array.isArray(parsed?.admin) ? parsed.admin : []
      const staff = Array.isArray(parsed?.staff) ? parsed.staff : []
      const combined = [...admins, ...staff]
      usersFromFile = combined
        .map((u: any) => ({
          username: String(u?.username || ''),
          password: String(u?.password || ''),
          role: (String(u?.role || '').toLowerCase() === 'admin' ? 'admin' : 'staff') as 'admin'|'staff',
          name: u?.name ? String(u.name) : undefined
        }))
        .filter(u => u.username && u.password)
    }
  } catch (e) {
    // Ignore file errors and fallback to defaults
    usersFromFile = null
  }

  const upsertUser = async (u: { username: string; password: string; role: 'admin'|'staff'; name?: string }) => {
    const id = `${u.role}-${u.username}`
    const name = u.name || (u.role === 'admin' ? 'CTF Administrator' : 'Staff Member')
    const hash = await bcrypt.hash(u.password, 12)
    // Try UPSERT; if unsupported, fallback to manual select/update
    try {
      await db!.run(
        `INSERT INTO users (id, username, password_hash, role, name, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash, role=excluded.role, name=excluded.name, is_active=1`
      , [id, u.username, hash, u.role, name])
    } catch (err: any) {
      const existing = await db!.get(`SELECT id FROM users WHERE username = ?`, [u.username])
      if (existing) {
        await db!.run(`UPDATE users SET password_hash = ?, role = ?, name = ?, is_active = 1 WHERE username = ?`, [hash, u.role, name, u.username])
      } else {
        await db!.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, name, is_active) VALUES (?,?,?,?,?,1)`, [id, u.username, hash, u.role, name])
      }
    }
  }

  if (usersFromFile && usersFromFile.length > 0) {
    for (const u of usersFromFile) {
      await upsertUser(u)
    }
    return
  }

  // Fallback hardcoded defaults if no credentials file
  const defaults: Array<{ username: string; password: string; role: 'admin'|'staff'; name: string; id: string }> = [
    { id: 'admin', username: 'ctf_admin', password: 'SecureAdmin2025!', role: 'admin', name: 'CTF Administrator' },
    { id: 'staff1', username: 'staff1', password: 'StaffPass123!', role: 'staff', name: 'Staff Member 1' },
    { id: 'staff2', username: 'staff2', password: 'StaffPass456!', role: 'staff', name: 'Staff Member 2' }
  ]
  for (const d of defaults) {
    const hash = await bcrypt.hash(d.password, 12)
    await db.run(`
      INSERT OR IGNORE INTO users (id, username, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `, [d.id, d.username, hash, d.role, d.name])
  }
}

async function insertDefaultEvents() {
  if (!db) throw new Error('Database not initialized')
  const row = await db.get(`SELECT COUNT(*) as cnt FROM events`)
  if (row && row.cnt > 0) return

  const now = Date.now()
  const events = [
    {
      id: 'opening-ceremony',
      name: 'Opening Ceremony',
      description: 'Welcome to the CTF event! Check in to confirm attendance.',
      start_time: new Date(now + 60 * 60 * 1000).toISOString(),
      end_time: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      location_name: 'Main Hall',
      latitude: 40.7128,
      longitude: -74.0060,
      radius_meters: 200,
      is_active: 1
    },
    {
      id: 'workshop-cryptography',
      name: 'Cryptography Workshop',
      description: 'Hands-on session exploring crypto challenges.',
      start_time: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
      location_name: 'Lab A',
      latitude: 40.7128,
      longitude: -74.0060,
      radius_meters: 150,
      is_active: 1
    }
  ]

  for (const e of events) {
    await db.run(`
      INSERT OR IGNORE INTO events (id, name, description, start_time, end_time, location_name, latitude, longitude, radius_meters, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [e.id, e.name, e.description, e.start_time, e.end_time, e.location_name, e.latitude, e.longitude, e.radius_meters, e.is_active])
  }
}

// Utility: Haversine distance in meters
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
  const database = await initDatabase()
  return await database.all(`
    SELECT id, name, description, start_time, end_time, location_name, latitude, longitude, radius_meters, is_active
    FROM events WHERE is_active = 1 ORDER BY start_time ASC
  `)
}

export async function getEventById(eventId: string) {
  const database = await initDatabase()
  return await database.get(`SELECT * FROM events WHERE id = ?`, [eventId])
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
  const database = await initDatabase()
  const event = await getEventById(params.eventId)
  if (!event || !event.is_active) {
    return { success: false, status: 'rejected' as const, message: 'Event not found or inactive' }
  }

  let distance: number | null = null
  let status: 'accepted' | 'rejected' = 'rejected'
  let reason: string | null = null
  if (typeof event.latitude === 'number' && typeof event.longitude === 'number') {
    distance = haversine(event.latitude, event.longitude, params.latitude, params.longitude)
    const radius = event.radius_meters ?? 150
    if (distance <= radius) {
      status = 'accepted'
    } else {
      status = 'rejected'
      reason = `Outside allowed radius (${Math.round(distance)}m > ${radius}m)`
    }
  } else {
    reason = 'Event location not configured'
  }

  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  try {
    await database.run(`
      INSERT INTO attendance (id, event_id, email, phone, attendee_id, latitude, longitude, accuracy, distance_meters, status, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, params.eventId, params.email, params.phone, params.attendeeId, params.latitude, params.longitude, params.accuracy ?? null, distance, status, reason])
    return { success: true, status, distance, message: status === 'accepted' ? 'Attendance recorded' : (reason || 'Attendance rejected') }
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { success: false, status: 'rejected', message: 'Already recorded for this event' }
    }
    throw err
  }
}

// Team operations
export async function createTeam(name: string, password: string, members: string[]) {
  const database = await initDatabase()
  const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const passwordHash = await bcrypt.hash(password, 12)
  
  await database.run(`
    INSERT INTO teams (id, name, password_hash, members)
    VALUES (?, ?, ?, ?)
  `, [id, name, passwordHash, JSON.stringify(members)])
  
  return { id, name, members }
}

export async function updateTeam(id: string, name: string, password?: string, members?: string[]) {
  const database = await initDatabase()
  
  // Check if team exists
  const existingTeam = await database.get(`SELECT * FROM teams WHERE id = ?`, [id])
  if (!existingTeam) {
    throw new Error('Team not found')
  }
  
  let updateQuery = `UPDATE teams SET name = ?, last_activity = CURRENT_TIMESTAMP`
  const params = [name]
  
  // Only update password if provided
  if (password) {
    const passwordHash = await bcrypt.hash(password, 12)
    updateQuery += `, password_hash = ?`
    params.push(passwordHash)
  }
  
  // Only update members if provided
  if (members) {
    updateQuery += `, members = ?`
    params.push(JSON.stringify(members))
  }
  
  updateQuery += ` WHERE id = ?`
  params.push(id)
  
  await database.run(updateQuery, params)
  
  // Return updated team data
  const updatedTeam = await database.get(`
    SELECT id, name, members, created_at, last_activity, total_score, is_active
    FROM teams WHERE id = ?
  `, [id])
  
  return {
    ...updatedTeam,
    members: JSON.parse(updatedTeam.members)
  }
}

export async function deleteTeam(id: string) {
  const database = await initDatabase()
  
  // Check if team exists
  const existingTeam = await database.get(`SELECT * FROM teams WHERE id = ?`, [id])
  if (!existingTeam) {
    throw new Error('Team not found')
  }
  
  // Soft delete - mark as inactive instead of hard delete to preserve submission history
  await database.run(`
    UPDATE teams SET is_active = 0, last_activity = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [id])
  
  return { success: true, message: 'Team deactivated successfully' }
}

export async function adjustTeamScore(teamId: string, delta: number, reason: string | null, actor: string | null) {
  const database = await initDatabase()
  const team = await database.get(`SELECT id FROM teams WHERE id = ? AND is_active = 1`, [teamId])
  if (!team) throw new Error('Team not found')
  await database.run(`UPDATE teams SET total_score = total_score + ?, last_activity = CURRENT_TIMESTAMP WHERE id = ?`, [delta, teamId])
  const id = `adj-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  await database.run(`INSERT INTO score_adjustments (id, team_id, delta, reason, actor) VALUES (?,?,?,?,?)`, [id, teamId, delta, reason ?? null, actor ?? null])
  return { id, teamId, delta }
}

export async function authenticateTeam(name: string, password: string) {
  const database = await initDatabase()
  const team = await database.get(`
    SELECT * FROM teams WHERE name = ? AND is_active = 1
  `, [name])
  
  if (!team) return null
  
  const isValid = await bcrypt.compare(password, team.password_hash)
  if (!isValid) return null
  
  // Update last activity
  await database.run(`
    UPDATE teams SET last_activity = CURRENT_TIMESTAMP WHERE id = ?
  `, [team.id])
  
  return {
    id: team.id,
    name: team.name,
    members: JSON.parse(team.members),
    totalScore: team.total_score
  }
}

export async function authenticateUser(username: string, password: string) {
  const database = await initDatabase()
  const user = await database.get(`
    SELECT * FROM users WHERE username = ? AND is_active = 1
  `, [username])
  
  if (!user) return null
  
  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) return null
  
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name
  }
}

// User management
export async function listUsers() {
  const database = await initDatabase()
  return await database.all(`SELECT id, username, role, name, is_active, created_at FROM users ORDER BY role DESC, username ASC`)
}

export async function upsertUserAdmin(params: { username: string, password?: string, role: 'admin'|'staff', name?: string }) {
  const database = await initDatabase()
  const existing = await database.get(`SELECT * FROM users WHERE username = ?`, [params.username])
  const name = params.name || (params.role === 'admin' ? 'CTF Administrator' : 'Staff Member')
  if (existing) {
    // Update
    if (params.password) {
      const hash = await bcrypt.hash(params.password, 12)
      await database.run(`UPDATE users SET password_hash = ?, role = ?, name = ?, is_active = 1 WHERE username = ?`, [hash, params.role, name, params.username])
    } else {
      await database.run(`UPDATE users SET role = ?, name = ?, is_active = 1 WHERE username = ?`, [params.role, name, params.username])
    }
    return { updated: true }
  } else {
    // Insert
    if (!params.password) throw new Error('Password required for new user')
    const hash = await bcrypt.hash(params.password, 12)
    const id = `${params.role}-${params.username}`
    await database.run(`INSERT INTO users (id, username, password_hash, role, name, is_active) VALUES (?,?,?,?,?,1)`, [id, params.username, hash, params.role, name])
    return { created: true }
  }
}

export async function setUserActive(username: string, isActive: boolean) {
  const database = await initDatabase()
  const res: any = await database.run(`UPDATE users SET is_active = ? WHERE username = ?`, [isActive ? 1 : 0, username])
  const changes = res && typeof res.changes === 'number' ? res.changes : 0
  return { success: changes > 0 }
}

// Submission operations
export async function createSubmission(
  teamId: string, 
  challengeId: string, 
  answer: string, 
  status: 'correct' | 'incorrect' | 'pending',
  points: number = 0,
  penalty: number = 0
) {
  const database = await initDatabase()
  const id = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    await database.run(`
      INSERT INTO submissions (id, team_id, challenge_id, answer, status, points, penalty)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, teamId, challengeId, answer, status, points, penalty])
    
    // Update team's total score if points were awarded
    if (points > 0) {
      await database.run(`
        UPDATE teams SET total_score = total_score + ?, last_activity = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [points, teamId])
    }
    
    // Apply penalty if any
    if (penalty > 0) {
      await database.run(`
        UPDATE teams SET total_score = total_score - ?, last_activity = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [penalty, teamId])
    }
    
    return { id, teamId, challengeId, answer, status, points, penalty }
  } catch (error: any) {
    // Check if this is a unique constraint violation for correct submissions
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && status === 'correct') {
      throw new Error('Team has already correctly solved this challenge')
    }
    throw error
  }
}

export async function getTeamSubmissions(teamId: string, challengeId?: string) {
  const database = await initDatabase()
  let query = `SELECT * FROM submissions WHERE team_id = ?`
  const params = [teamId]
  
  if (challengeId) {
    query += ` AND challenge_id = ?`
    params.push(challengeId)
  }
  
  query += ` ORDER BY submitted_at DESC`
  
  return await database.all(query, params)
}

export async function getAllSubmissions() {
  const database = await initDatabase()
  return await database.all(`
    SELECT s.*, t.name as team_name 
    FROM submissions s 
    JOIN teams t ON s.team_id = t.id 
    ORDER BY s.submitted_at DESC
  `)
}

export async function getAllTeams() {
  const database = await initDatabase()
  const teams = await database.all(`
    SELECT id, name, members, created_at, last_activity, total_score, is_active
    FROM teams 
    WHERE is_active = 1
    ORDER BY total_score DESC, name ASC
  `)
  
  return teams.map((team: any) => ({
    ...team,
    members: JSON.parse(team.members)
  }))
}

export async function getPublicStats() {
  const database = await initDatabase()
  
  // Get team leaderboard
  const teams = await database.all(`
    SELECT name, total_score, 
           (SELECT COUNT(*) FROM submissions WHERE team_id = teams.id AND status = 'correct') as solved_challenges
    FROM teams 
    WHERE is_active = 1
    ORDER BY total_score DESC, name ASC
  `)
  
  // Get recent submissions (public feed)
  const recentSubmissions = await database.all(`
    SELECT t.name as team_name, s.challenge_id, s.status, 
           CASE 
             WHEN s.status = 'incorrect' AND s.points = 0 AND s.penalty > 0 THEN -s.penalty
             ELSE s.points 
           END as points,
           s.submitted_at
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    WHERE s.status IN ('correct', 'incorrect')
    ORDER BY s.submitted_at DESC
    LIMIT 50
  `)
  
  // True total submissions count (all statuses)
  const totalSubmissionsRow = await database.get(`
    SELECT COUNT(*) as cnt FROM submissions
  `)
  
  // Get challenge stats
  const challengeStats = await database.all(`
    SELECT challenge_id, 
           COUNT(*) as total_attempts,
           SUM(CASE WHEN status = 'correct' THEN 1 ELSE 0 END) as correct_solves,
           SUM(CASE WHEN status = 'incorrect' THEN 1 ELSE 0 END) as incorrect_attempts
    FROM submissions
    GROUP BY challenge_id
  `)
  
  return {
    teams,
    recentSubmissions,
    challengeStats,
    totalTeams: teams.length,
    totalSubmissions: totalSubmissionsRow?.cnt || 0
  }
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: 'correct' | 'incorrect' | 'pending',
  reviewedBy: string,
  reviewNotes?: string,
  points?: number,
  penalty?: number
) {
  const database = await initDatabase()

  // Load existing to compute delta for team score
  const existing: any = await database.get(`SELECT team_id, points as old_points, penalty as old_penalty FROM submissions WHERE id = ?`, [submissionId])
  if (!existing) throw new Error('Submission not found')

  const newPoints = points ?? 0
  const newPenalty = status === 'incorrect' ? (penalty ?? 0) : 0

  await database.run(`
    UPDATE submissions 
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_notes = ?, points = ?, penalty = ?
    WHERE id = ?
  `, [status, reviewedBy, reviewNotes || null, newPoints, newPenalty, submissionId])

  // Adjust team total score by the delta between old and new (penalty subtracts)
  const oldPoints = Number(existing.old_points || 0)
  const oldPenalty = Number(existing.old_penalty || 0)
  const delta = (newPoints - oldPoints) - (newPenalty - oldPenalty)
  if (delta !== 0) {
    await database.run(`
      UPDATE teams SET total_score = total_score + ?, last_activity = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [delta, existing.team_id])
  }
}
