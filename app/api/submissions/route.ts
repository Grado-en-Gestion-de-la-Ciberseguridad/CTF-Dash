import { NextRequest, NextResponse } from 'next/server'
import { createSubmission, getAllSubmissions, getTeamSubmissions, updateSubmissionStatus } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const challengeId = searchParams.get('challengeId')

    if (teamId) {
      const rows: any[] = await getTeamSubmissions(teamId, challengeId || undefined)
      const submissions = rows.map((s: any) => ({
        id: s.id,
        teamId: s.team_id,
        challengeId: s.challenge_id,
        answer: s.answer,
        submittedAt: s.submitted_at,
        status: s.status,
        points: s.points,
        penalty: s.penalty,
        reviewedBy: s.reviewed_by || undefined,
        reviewNotes: s.review_notes || undefined
      }))
      return NextResponse.json({ submissions })
    } else {
      const rows: any[] = await getAllSubmissions()
      const submissions = rows.map((s: any) => ({
        id: s.id,
        teamId: s.team_id,
        challengeId: s.challenge_id,
        answer: s.answer,
        submittedAt: s.submitted_at,
        status: s.status,
        points: s.points,
        penalty: s.penalty,
        reviewedBy: s.reviewed_by || undefined,
        reviewNotes: s.review_notes || undefined,
        teamName: s.team_name
      }))
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

    // If the challenge requires manual review, force status to 'pending' regardless of client input.
    let finalStatus: 'correct'|'incorrect'|'pending' = status
    try {
      const fs = await import('fs')
      const path = await import('path')
      const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'challenges.json'), 'utf8')
      const parsed = JSON.parse(raw)
      const ch = Array.isArray(parsed?.challenges) ? parsed.challenges.find((c: any) => c.id === challengeId) : null
      if (ch && ch.requiresManualReview) {
        finalStatus = 'pending'
      }
    } catch (_) {
      // ignore file errors; trust client status if file unavailable
    }

    const submission = await createSubmission(
      teamId,
      challengeId,
      answer,
      finalStatus,
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
    const { submissionId, status, reviewedBy, reviewNotes, points, penalty } = await request.json()

    if (!submissionId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: 'SubmissionId, status, and reviewedBy are required' },
        { status: 400 }
      )
    }

    await updateSubmissionStatus(submissionId, status, reviewedBy, reviewNotes, points, penalty)

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
