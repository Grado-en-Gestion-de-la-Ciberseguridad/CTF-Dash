import { NextRequest, NextResponse } from 'next/server'
import { addEventLocation, listAttendanceDecrypted, listRegistrationsDecrypted, manualAttendance, upsertEvent, listAllEvents } from '@/lib/attendanceDb'

function isStaffOrAdmin(req: NextRequest) {
  const role = (req.headers.get('x-ctf-role') || '').toLowerCase()
  return role === 'admin' || role === 'staff'
}

export async function GET(req: NextRequest) {
  if (!isStaffOrAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'attendance'
  if (type === 'events') {
    const events = await listAllEvents()
    return NextResponse.json({ events })
  }
  const eventId = searchParams.get('eventId') || undefined
  if (type === 'registrations') {
    const rows = await listRegistrationsDecrypted(eventId)
    return NextResponse.json({ registrations: rows })
  }
  const rows = await listAttendanceDecrypted(eventId)
  return NextResponse.json({ attendance: rows })
}

export async function POST(req: NextRequest) {
  if (!isStaffOrAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { action } = body || {}
    if (action === 'upsertEvent') {
      const { id, name, description, banner_url, speaker_name, registration_start, registration_end, start_time, end_time, location_name, latitude, longitude, radius_meters, is_active } = body
      const res = await upsertEvent({ id, name, description, banner_url, speaker_name, registration_start, registration_end, start_time, end_time, location_name, latitude, longitude, radius_meters, is_active })
      return NextResponse.json(res)
    } else if (action === 'addLocation') {
      const { eventId, name, latitude, longitude, radius_meters } = body
      if (!eventId || typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius_meters !== 'number') return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
      const res = await addEventLocation(eventId, { name, latitude, longitude, radius_meters })
      return NextResponse.json(res)
    } else if (action === 'manualAttendance') {
      const { eventId, email, phone, attendeeId, overrideWindow } = body
      if (!eventId || !email || !phone || !attendeeId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
      const res = await manualAttendance({ eventId, email, phone, attendeeId, overrideWindow })
      return NextResponse.json(res, { status: res.success ? 200 : 400 })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
