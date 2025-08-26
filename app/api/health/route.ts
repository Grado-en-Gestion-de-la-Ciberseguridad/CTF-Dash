import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

export async function GET() {
  try {
    const db = await initDatabase()
    const row = await db.get('SELECT 1 as ok')
    return NextResponse.json({
      ok: true,
      db: row?.ok === 1,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
