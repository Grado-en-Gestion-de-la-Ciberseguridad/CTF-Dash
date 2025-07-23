import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

export async function GET() {
  try {
    const database = await initDatabase()
    
    const teams = await database.all('SELECT * FROM teams WHERE is_active = 1')
    const submissions = await database.all('SELECT * FROM submissions')
    
    return NextResponse.json({
      teams: teams.length,
      submissions: submissions.length,
      teamsData: teams,
      submissionsData: submissions.slice(0, 5) // First 5 submissions
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to debug', details: error },
      { status: 500 }
    )
  }
}
