import { NextRequest, NextResponse } from 'next/server'
import { recordAttendance } from '@/lib/attendanceDb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventId,
      email,
      phone,
      attendeeId,
      latitude,
      longitude,
      accuracy
    } = body || {}

    if (!eventId || !email || !phone || !attendeeId || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await recordAttendance({ eventId, email, phone, attendeeId, latitude, longitude, accuracy })
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to record attendance' }, { status: 500 })
  }
}
