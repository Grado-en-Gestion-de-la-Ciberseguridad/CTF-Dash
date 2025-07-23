import { NextRequest, NextResponse } from 'next/server'
import { createTeam, getAllTeams, updateTeam, deleteTeam } from '@/lib/database'

export async function GET() {
  try {
    const teams = await getAllTeams()
    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, password, members } = await request.json()

    if (!name || !password || !members || members.length === 0) {
      return NextResponse.json(
        { error: 'Team name, password, and at least one member are required' },
        { status: 400 }
      )
    }

    // Filter out empty member names
    const validMembers = members.filter((member: string) => member.trim())
    
    if (validMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid member name is required' },
        { status: 400 }
      )
    }

    const team = await createTeam(name, password, validMembers)
    
    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        members: team.members
      }
    })

  } catch (error: any) {
    console.error('Create team error:', error)
    
    // Handle duplicate team name
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, password, members } = await request.json()

    if (!id || !name || !members || members.length === 0) {
      return NextResponse.json(
        { error: 'Team ID, name, and at least one member are required' },
        { status: 400 }
      )
    }

    // Filter out empty member names
    const validMembers = members.filter((member: string) => member.trim())
    
    if (validMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid member name is required' },
        { status: 400 }
      )
    }

    const team = await updateTeam(id, name, password, validMembers)
    
    return NextResponse.json({
      success: true,
      team
    })

  } catch (error: any) {
    console.error('Update team error:', error)
    
    // Handle duplicate team name
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    await deleteTeam(id)
    
    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete team error:', error)
    
    if (error.message === 'Team not found') {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
