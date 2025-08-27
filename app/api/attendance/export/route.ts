import { NextRequest, NextResponse } from 'next/server'
import { exportAttendanceCSV } from '@/lib/attendanceDb'

// Minimal admin check: Expect header 'x-ctf-role: admin'
function isAdmin(req: NextRequest) {
  const role = req.headers.get('x-ctf-role') || ''
  return role.toLowerCase() === 'admin'
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId') || ''
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    const csv = await exportAttendanceCSV(eventId)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendance-${eventId}.csv"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to export CSV' }, { status: 500 })
  }
}
