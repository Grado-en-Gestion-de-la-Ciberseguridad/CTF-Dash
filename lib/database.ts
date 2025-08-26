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
}

async function insertDefaultUsers() {
  if (!db) throw new Error('Database not initialized')

  const adminPasswordHash = await bcrypt.hash('SecureAdmin2025!', 12)
  const staff1PasswordHash = await bcrypt.hash('StaffPass123!', 12)
  const staff2PasswordHash = await bcrypt.hash('StaffPass456!', 12)

  // Insert admin user
  await db.run(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
  `, ['admin', 'ctf_admin', adminPasswordHash, 'admin', 'CTF Administrator'])

  // Insert staff users
  await db.run(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
  `, ['staff1', 'staff1', staff1PasswordHash, 'staff', 'Staff Member 1'])

  await db.run(`
    INSERT OR IGNORE INTO users (id, username, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
  `, ['staff2', 'staff2', staff2PasswordHash, 'staff', 'Staff Member 2'])
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
  points?: number
) {
  const database = await initDatabase()
  
  await database.run(`
    UPDATE submissions 
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_notes = ?, points = ?
    WHERE id = ?
  `, [status, reviewedBy, reviewNotes || null, points || 0, submissionId])
  
  // Update team score if points changed
  if (points) {
    const submission = await database.get(`SELECT team_id FROM submissions WHERE id = ?`, [submissionId])
    if (submission) {
      await database.run(`
        UPDATE teams SET total_score = total_score + ?, last_activity = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [points, submission.team_id])
    }
  }
}
