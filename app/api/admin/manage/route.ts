import { NextRequest, NextResponse } from 'next/server'
import { adjustTeamScore, listUsers, setUserActive, upsertUserAdmin } from '@/lib/database'

function isStaffOrAdmin(req: NextRequest) {
  const role = (req.headers.get('x-ctf-role') || '').toLowerCase()
  return role === 'admin' || role === 'staff'
}

function isAdmin(req: NextRequest) {
  const role = (req.headers.get('x-ctf-role') || '').toLowerCase()
  return role === 'admin'
}

export async function POST(req: NextRequest) {
  if (!isStaffOrAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { action } = body || {}

    if (action === 'adjustScore') {
      const { teamId, delta, reason, actor } = body
      if (!teamId || typeof delta !== 'number') return NextResponse.json({ error: 'teamId and numeric delta are required' }, { status: 400 })
      const res = await adjustTeamScore(teamId, delta, reason ?? null, actor ?? null)
      return NextResponse.json({ success: true, adjustment: res })
    }

    if (action === 'listUsers') {
      if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const users = await listUsers()
      return NextResponse.json({ users })
    }

    if (action === 'upsertUser') {
      if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { username, password, role, name } = body
      if (!username || !role) return NextResponse.json({ error: 'username and role are required' }, { status: 400 })
      const result = await upsertUserAdmin({ username, password, role, name })
      return NextResponse.json({ success: true, ...result })
    }

    if (action === 'setUserActive') {
      if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { username, isActive } = body
      if (!username || typeof isActive !== 'boolean') return NextResponse.json({ error: 'username and isActive are required' }, { status: 400 })
      const result = await setUserActive(username, isActive)
      return NextResponse.json({ success: result.success })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
