import { NextRequest, NextResponse } from 'next/server'
import { getEventDetails } from '@/lib/attendanceDb'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const details = await getEventDetails(id)
    if (!details) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    return NextResponse.json(details)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load event' }, { status: 500 })
  }
}
