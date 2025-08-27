import { NextResponse } from 'next/server'
import { getPublicEvents } from '@/lib/attendanceDb'

export async function GET() {
  try {
    const events = await getPublicEvents()
    return NextResponse.json({ events })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load events' }, { status: 500 })
  }
}
