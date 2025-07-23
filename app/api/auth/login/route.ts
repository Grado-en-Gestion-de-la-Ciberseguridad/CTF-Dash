import { NextRequest, NextResponse } from 'next/server'
import { authenticateTeam, authenticateUser } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // First try admin/staff authentication
    const user = await authenticateUser(username, password)
    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      })
    }

    // Then try team authentication
    const team = await authenticateTeam(username, password)
    if (team) {
      return NextResponse.json({
        success: true,
        user: {
          id: team.id,
          username: team.name,
          role: 'team',
          name: team.name,
          teamId: team.id
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
