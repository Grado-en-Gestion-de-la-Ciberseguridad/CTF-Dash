import { NextRequest, NextResponse } from 'next/server'
import { registerForEvent } from '@/lib/attendanceDb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, email, phone, attendeeId } = body || {}
    if (!eventId || !email || !phone || !attendeeId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const res = await registerForEvent({ eventId, email, phone, attendeeId })
    return NextResponse.json(res, { status: res.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to register' }, { status: 500 })
  }
}
