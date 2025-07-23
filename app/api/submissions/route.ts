import { NextRequest, NextResponse } from 'next/server'
import { createSubmission, getAllSubmissions, getTeamSubmissions, updateSubmissionStatus } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const challengeId = searchParams.get('challengeId')

    if (teamId) {
      const submissions = await getTeamSubmissions(teamId, challengeId || undefined)
      return NextResponse.json({ submissions })
    } else {
      const submissions = await getAllSubmissions()
      return NextResponse.json({ submissions })
    }
  } catch (error) {
    console.error('Get submissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teamId, challengeId, answer, status, points, penalty } = await request.json()

    if (!teamId || !challengeId || !answer || !status) {
      return NextResponse.json(
        { error: 'TeamId, challengeId, answer, and status are required' },
        { status: 400 }
      )
    }

    // SECURITY CHECK: Prevent any submissions to already completed challenges
    const existingSubmissions = await getTeamSubmissions(teamId, challengeId)
    const hasCorrectSubmission = existingSubmissions.some(s => s.status === 'correct')
    
    if (hasCorrectSubmission) {
      return NextResponse.json(
        { error: 'Challenge already completed! This challenge has been solved and cannot be resubmitted.' },
        { status: 409 } // Conflict status code
      )
    }

    // Additional check for correct submissions (redundant but safe)
    if (status === 'correct') {
      const existingCorrectSubmissions = await getTeamSubmissions(teamId, challengeId)
      const hasCorrectSubmissionCheck = existingCorrectSubmissions.some(s => s.status === 'correct')
      
      if (hasCorrectSubmissionCheck) {
        return NextResponse.json(
          { error: 'Team has already correctly solved this challenge' },
          { status: 409 } // Conflict status code
        )
      }
    }

    const submission = await createSubmission(
      teamId,
      challengeId,
      answer,
      status,
      points || 0,
      penalty || 0
    )

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error) {
    console.error('Create submission error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { submissionId, status, reviewedBy, reviewNotes, points } = await request.json()

    if (!submissionId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: 'SubmissionId, status, and reviewedBy are required' },
        { status: 400 }
      )
    }

    await updateSubmissionStatus(submissionId, status, reviewedBy, reviewNotes, points)

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully'
    })

  } catch (error) {
    console.error('Update submission error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}
