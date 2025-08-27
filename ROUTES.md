# Routes and API Endpoints

This document lists the available routes (pages) and API endpoints in the CTF Dashboard, with notes about access and purpose.

## App Routes (Pages)

- `/login`
  - Access: Public (unauthenticated)
  - Purpose: Sign in with username/team and password. Language toggle available.

- `/` (Home)
  - Access: Authenticated (any role)
  - Purpose: Landing dashboard with links to key areas and event info; Konami easter egg unlocks `/terminal`.

- `/challenges`
  - Access: Authenticated (teams, staff, admin)
  - Purpose: View challenge rooms and submit answers.

- `/leaderboard`
  - Access: Public
  - Purpose: View team rankings and progress.

- `/resources`
  - Access: Public
  - Purpose: Browse guides, evidence files, and references.

- `/stats`
  - Access: Public
  - Purpose: Public statistics dashboard (real-time overview).

- `/teams`
  - Access: Authenticated (staff, admin)
  - Purpose: Register teams and manage participants.

- `/admin`
  - Access: Authenticated (admin only)
  - Purpose: Admin dashboard with system oversight and submission review.

- `/terminal`
  - Access: Authenticated (any role) but hidden; unlocked via Konami code on Home.
  - Purpose: Secret CTF terminal for hidden commands and phrases.

- `/social`
  - Access: Public
  - Purpose: Social Engineering training module (fictional employee directory).

- `/agent`
  - Access: Public
  - Purpose: Secret Agent briefing mini-game (codes and rewards).

- `/qr-hunt`
  - Access: Public
  - Purpose: QR Code treasure hunt instructions and progress.

- `/cafe`
  - Access: Public
  - Purpose: "Hacker Café" fun page.

- `/attendance`
  - Access: Public
  - Purpose: Event attendance check-in with geolocation verification. PII stored encrypted in a separate attendance database.

## API Endpoints

All API endpoints are under `/api`. Unless otherwise noted, they are public from the app’s perspective (no auth middleware is implemented yet). Use responsibly.

- `GET /api/health`
  - Returns health status, DB connectivity, uptime, timestamp.

- `POST /api/auth/login`
  - Body: `{ username: string, password: string }`
  - Success: `{ success: true, user: { id, username, role: 'admin'|'staff'|'team', name, teamId? } }`
  - Errors: 400 (missing fields), 401 (invalid credentials), 500 (server error)

- `GET /api/teams`
  - Returns `{ teams }` with active teams and scores.

- `POST /api/teams`
  - Body: `{ name: string, password: string, members: string[] }`
  - Creates team; returns `{ success: true, team }`. 409 if duplicate.

- `PUT /api/teams`
  - Body: `{ id: string, name: string, password?: string, members: string[] }`
  - Updates team; returns `{ success: true, team }`.

- `DELETE /api/teams?id=<teamId>`
  - Soft-deletes (deactivates) a team; returns `{ success: true }`.

- `GET /api/submissions`
  - Optional query: `?teamId=...&challengeId=...`
  - Returns `{ submissions }` for a team/challenge or all submissions.

- `POST /api/submissions`
  - Body: `{ teamId, challengeId, answer, status: 'correct'|'incorrect'|'pending', points?: number, penalty?: number }`
  - Creates submission; prevents resubmission of solved challenges.

- `PUT /api/submissions`
  - Body: `{ submissionId, status, reviewedBy, reviewNotes?, points? }`
  - Updates submission; adjusts team score if points provided.

- `GET /api/stats`
  - Returns leaderboard, recent submissions feed, and challenge statistics.

- `GET /api/debug`
  - Returns counts and sample data for quick inspection (non-production use).

- `GET /api/events`
  - Returns `{ events }` list of active public events (id, name, times, location, radius).

- `POST /api/attendance`
  - Body: `{ eventId, email, phone, attendeeId, latitude, longitude, accuracy? }`
  - Returns: `{ success, status: 'accepted'|'rejected', distance?, message }`

- `GET /api/attendance/export?eventId=<id>`
  - Access: Admin only (provide header `x-ctf-role: admin`)
  - Returns decrypted CSV of attendance records for a given event.

## Notes

- Protected routes use `app/ProtectedRoute.tsx` with roles: `admin`, `staff`, `team`.
- Client-side session stored under `localStorage['ctf-user']` via `app/AuthContext.tsx`.
- Database: SQLite in `data/ctf.db`, initialized by `lib/database.ts`.
