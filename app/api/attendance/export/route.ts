import { NextRequest, NextResponse } from 'next/server'
import { exportAttendanceCSV, exportRegistrationsCSV } from '@/lib/attendanceDb'

// Minimal role check: Expect header 'x-ctf-role: admin|staff'
function isStaffOrAdmin(req: NextRequest) {
  const role = (req.headers.get('x-ctf-role') || '').toLowerCase()
  return role === 'admin' || role === 'staff'
}

export async function GET(req: NextRequest) {
  try {
    if (!isStaffOrAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId') || ''
    const type = (searchParams.get('type') || 'attendance').toLowerCase()
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    const csv = type === 'registrations' ? await exportRegistrationsCSV(eventId) : await exportAttendanceCSV(eventId)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}-${eventId}.csv"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to export CSV' }, { status: 500 })
  }
}
