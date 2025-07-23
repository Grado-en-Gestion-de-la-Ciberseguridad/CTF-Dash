import { NextResponse } from 'next/server'
import { getPublicStats } from '@/lib/database'

export async function GET() {
  try {
    const stats = await getPublicStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
