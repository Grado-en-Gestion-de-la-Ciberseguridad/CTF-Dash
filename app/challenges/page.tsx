'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Challenge, Team, Submission } from '../types'
import { useAuth } from '../AuthContext'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'

function ChallengesPageContent() {
  const [teams, setTeams] = useState<Team[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [answer, setAnswer] = useState('')
  const [showHints, setShowHints] = useState(false)
  const { user, isTeam } = useAuth()

  useEffect(() => {
    loadTeams()
    loadSubmissions()
    loadChallengesFromFile()
  }, [])

  const loadChallengesFromFile = async () => {
    try {
      const response = await fetch('/challenges.json')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges)
        // Store in localStorage as backup only
        localStorage.setItem('ctf-challenges-backup', JSON.stringify(data.challenges))
      } else {
        console.error('Failed to load challenges.json')
        // Only use localStorage backup if JSON file fails to load
        const backupChallenges = localStorage.getItem('ctf-challenges-backup')
        if (backupChallenges) {
          setChallenges(JSON.parse(backupChallenges))
        } else {
          setChallenges([])
        }
      }
    } catch (error) {
      console.error('Failed to load challenges from file:', error)
      // Only use localStorage backup if JSON file fails to load
      const backupChallenges = localStorage.getItem('ctf-challenges-backup')
      if (backupChallenges) {
        setChallenges(JSON.parse(backupChallenges))
      } else {
        setChallenges([])
      }
    }
  }

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      } else {
        console.error('Failed to load teams from API')
        setTeams([])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams([])
    }
  }

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else {
        console.error('Failed to load submissions from API')
        setSubmissions([])
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
      setSubmissions([])
    }
  }

  const createSubmission = async (submissionData: {
    teamId: string
    challengeId: string
    answer: string
    status: 'correct' | 'incorrect' | 'pending'
    points: number
    penalty: number
  }) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Reload submissions from server
        await loadSubmissions()
        return true
      } else if (response.status === 409) {
        // Conflict - team already solved this challenge
        alert('🏆 Challenge Already Completed!\n\nThis challenge has been solved and cannot be resubmitted. Great work on completing it!')
        return false
      } else {
        console.error('Failed to create submission:', data.error)
        alert(data.error || 'Failed to submit answer. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error creating submission:', error)
      return false
    }
  }

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.teamId || !selectedChallenge || !answer.trim()) {
      alert('Please provide an answer')
      return
    }

    // Check if team already has a correct submission for this challenge
    const teamSubmissions = getTeamSubmissions(user.teamId, selectedChallenge.id)
    const hasCorrectSubmission = teamSubmissions.some(s => s.status === 'correct')
    
    if (hasCorrectSubmission) {
      alert('🏆 Challenge Already Completed!\n\nThis challenge has been solved and cannot be resubmitted. Great work on completing it!')
      setSelectedChallenge(null)
      setAnswer('')
      return
    }

    // Load challenges directly from JSON to validate answer and check attempt limits
    const validateAndSubmit = async () => {
      try {
        const response = await fetch('/challenges.json')
        if (!response.ok) {
          throw new Error('Failed to load challenges.json')
        }
        
        const data = await response.json()
        const challengeWithAnswer = data.challenges.find((c: Challenge) => c.id === selectedChallenge.id)
        
        if (!challengeWithAnswer) {
          alert('Challenge not found. Please refresh the page.')
          return
        }

        // Check if team has exceeded maximum incorrect attempts using fresh JSON data
        const incorrectAttempts = teamSubmissions.filter(s => s.status === 'incorrect').length
        const maxAttempts = challengeWithAnswer.maxIncorrectAttempts || 999
        
        if (incorrectAttempts >= maxAttempts) {
          alert(`This challenge is locked. Your team has exceeded the maximum number of attempts (${maxAttempts}).`)
          setSelectedChallenge(null)
          setAnswer('')
          return
        }
        
        if (!challengeWithAnswer) {
          alert('Challenge not found. Please refresh the page.')
          return
        }
        
        // Determine grading mode. If requiresManualReview, always mark pending for staff to review.
        let status: 'pending' | 'correct' | 'incorrect' = 'pending'
        let points = 0
        let penalty = 0
        
        if (challengeWithAnswer.requiresManualReview) {
          // Always route to pending review
          status = 'pending'
        } else if (challengeWithAnswer.correctAnswer) {
          const userAnswer = answer.trim().toLowerCase()
          const correctAnswer = challengeWithAnswer.correctAnswer.toLowerCase()
          
          // Check if answer matches correct answer or any accepted answers
          const isCorrect = userAnswer === correctAnswer || 
            (challengeWithAnswer.acceptedAnswers && 
             challengeWithAnswer.acceptedAnswers.some((accepted: string) => 
               accepted.toLowerCase() === userAnswer
             ))
          
          if (isCorrect) {
            status = 'correct'
            points = challengeWithAnswer.points
          } else {
            status = 'incorrect'
            penalty = challengeWithAnswer.penaltyPerIncorrect || 0
            points = penalty > 0 ? -penalty : 0  // Store penalty as negative points
          }
        }

        // Create submission via API (server will check for duplicates)
        const success = await createSubmission({
          teamId: user.teamId!,
          challengeId: selectedChallenge.id,
          answer: answer.trim(),
          status,
          points,
          penalty
        })

        if (success) {
          setAnswer('')
          setSelectedChallenge(null)
          
          if (status === 'correct') {
            alert(`Correct! You earned ${points} points! 🎉`)
          } else if (status === 'incorrect') {
            const penaltyMessage = penalty > 0 ? ` Your team loses ${penalty} penalty points.` : ''
            const remainingAttempts = maxAttempts - incorrectAttempts - 1
            const attemptsMessage = remainingAttempts > 0 ? ` You have ${remainingAttempts} attempts remaining.` : ' This challenge is now locked.'
            alert(`Incorrect answer.${penaltyMessage}${attemptsMessage}`)
          } else {
            alert('Submission recorded! It will be reviewed by staff.')
          }
        } else {
          alert('Failed to submit answer. Please try again.')
        }
        
      } catch (error) {
        console.error('Error validating answer:', error)
        alert('Error validating answer. Please try again.')
      }
    }

    validateAndSubmit()
  }

  const getTeamSubmissions = (teamId: string, challengeId: string) => {
    return submissions.filter(s => s.teamId === teamId && s.challengeId === challengeId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRoomColor = (roomId: string) => {
    switch (roomId) {
      case 'security-awareness': return 'border-cyber-600/30 hover:border-cyber-400'
      case 'password-security': return 'border-hacker-600/30 hover:border-hacker-400'
      case 'osint': return 'border-yellow-600/30 hover:border-yellow-400'
      case 'cryptography': return 'border-purple-600/30 hover:border-purple-400'
      default: return 'border-gray-600/30 hover:border-gray-400'
    }
  }

  const roomGroups = challenges.reduce((groups, challenge) => {
    if (!groups[challenge.roomId]) {
      groups[challenge.roomId] = []
    }
    groups[challenge.roomId].push(challenge)
    return groups
  }, {} as Record<string, Challenge[]>)

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="flex items-center mb-6 sm:mb-8">
            <Link href="/" className="mr-2 sm:mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Link>
            <div className="flex items-center">
              <Shield className="h-6 w-6 sm:h-10 sm:w-10 text-cyber-400 mr-2 sm:mr-4" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Challenge Rooms</h1>
            </div>
          </div>

          {/* Team Info for Teams */}
          {isTeam && user && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Team: {user.username}</h2>
              <p className="text-gray-300">Submit your answers to the challenges below. All submissions will be reviewed by staff.</p>
            </div>
          )}

          {/* Challenge Rooms */}
          {Object.entries(roomGroups).map(([roomId, roomChallenges]) => (
            <div key={roomId} className={`bg-slate-800/50 backdrop-blur-sm border ${getRoomColor(roomId)} rounded-lg p-4 sm:p-6 mb-6 sm:mb-8`}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{roomChallenges[0].roomName}</h2>
              
              <div className="grid gap-3 sm:gap-4">
                {roomChallenges.map((challenge) => {
                  const teamSubmissions = user?.teamId ? getTeamSubmissions(user.teamId, challenge.id) : []
                  const latestSubmission = teamSubmissions[teamSubmissions.length - 1]
                  const hasCorrectSubmission = teamSubmissions.some(s => s.status === 'correct')
                  const incorrectAttempts = teamSubmissions.filter(s => s.status === 'incorrect').length
                  const maxAttempts = challenge.maxIncorrectAttempts || 999
                  const isLocked = incorrectAttempts >= maxAttempts && !hasCorrectSubmission
                  const remainingAttempts = maxAttempts - incorrectAttempts
                  
                  // Debug logging
                  if (challenge.id === 'sec-aware-1') {
                    console.log(`Challenge ${challenge.id}:`, {
                      teamSubmissions: teamSubmissions.length,
                      hasCorrectSubmission,
                      isLocked,
                      isTeam,
                      shouldShowSubmitButton: isTeam && !hasCorrectSubmission && !isLocked
                    })
                  }
                  
                  return (
                    <div key={challenge.id} className={`relative rounded-lg p-3 sm:p-4 border transition-all duration-300 ${
                      hasCorrectSubmission ? 'border-green-500 bg-gradient-to-br from-green-900/20 to-green-800/10 shadow-lg shadow-green-500/20' : 
                      isLocked ? 'border-red-500/50 bg-red-900/10' : 'bg-slate-700/50 border-gray-600'
                    }`}>
                      {hasCorrectSubmission && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 text-white rounded-full p-1 sm:p-2 shadow-lg">
                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h3 className={`text-lg sm:text-xl font-semibold relative mb-2 sm:mb-0 ${
                              hasCorrectSubmission ? 'text-green-300' :
                              isLocked ? 'text-gray-500' : 'text-white'
                            }`}>
                              {hasCorrectSubmission && (
                                <span className="absolute -left-6 sm:-left-8 top-0 text-green-400 text-base sm:text-lg">✓</span>
                              )}
                              {challenge.title}
                              {isLocked && <span className="ml-2 text-red-400 text-xs sm:text-sm">[LOCKED]</span>}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                              {hasCorrectSubmission && (
                                <div className="bg-green-600/30 border-2 border-green-400 rounded-lg px-3 sm:px-4 py-1 sm:py-2 animate-pulse self-start">
                                  <span className="text-green-300 text-xs sm:text-sm font-bold">🏆 COMPLETED</span>
                                </div>
                              )}
                              {isLocked && !hasCorrectSubmission && (
                                <div className="bg-red-600/20 border border-red-500/50 rounded-lg px-2 sm:px-3 py-1 self-start">
                                  <span className="text-red-400 text-xs sm:text-sm font-semibold">🔒 LOCKED</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className={`mb-2 text-sm sm:text-base ${
                            hasCorrectSubmission ? 'text-green-200' :
                            isLocked ? 'text-gray-500' : 'text-gray-300'
                          }`}>{challenge.description}</p>
                          {hasCorrectSubmission && (
                            <div className="mb-3 p-2 bg-green-500/20 border-l-4 border-green-400 rounded">
                              <span className="text-green-300 text-sm font-medium">
                                🎉 Challenge Solved! You earned {challenge.points} points.
                              </span>
                            </div>
                          )}
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                            <span className={`font-semibold ${
                              hasCorrectSubmission ? 'text-green-400' : 'text-hacker-400'
                            }`}>{challenge.points} points</span>
                            <span className={`${getDifficultyColor(challenge.difficulty)} font-semibold capitalize`}>
                              {challenge.difficulty}
                            </span>
                            {challenge.penaltyPerIncorrect && !hasCorrectSubmission && (
                              <span className="text-red-400 font-semibold">
                                -{challenge.penaltyPerIncorrect} penalty per wrong answer
                              </span>
                            )}
                            {challenge.requiresManualReview && (
                              <span className="text-yellow-300 font-semibold flex items-center">
                                <Clock className="h-4 w-4 mr-1" /> Manual review
                              </span>
                            )}
                          </div>
                          {!hasCorrectSubmission && !isLocked && maxAttempts < 999 && (
                            <div className="mt-2">
                              <span className="text-yellow-400 text-sm">
                                Attempts remaining: {remainingAttempts}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-2 mt-3 sm:mt-0">
                          {latestSubmission && (
                            <div className="flex items-center space-x-2 self-start sm:self-auto">
                              {latestSubmission.status === 'correct' && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />}
                              {latestSubmission.status === 'incorrect' && <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />}
                              {latestSubmission.status === 'pending' && <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />}
                              <span className="text-xs sm:text-sm text-gray-400 capitalize">{latestSubmission.status}</span>
                            </div>
                          )}
                          {/* Submit Answer Button - Only show if team is logged in, challenge not completed, and not locked */}
                          {isTeam && !hasCorrectSubmission && !isLocked ? (
                            <button
                              onClick={() => setSelectedChallenge(challenge)}
                              className="bg-cyber-600 hover:bg-cyber-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                            >
                              Submit Answer
                            </button>
                          ) : null}
                          
                          {/* Completed Button - Only show if team is logged in and challenge is completed */}
                          {isTeam && hasCorrectSubmission ? (
                            <button
                              disabled
                              onClick={() => alert('🏆 Challenge Already Completed!\n\nThis challenge has been solved and cannot be resubmitted. Great work on completing it!')}
                              className="bg-gray-600 text-gray-400 px-3 sm:px-4 py-2 rounded-lg cursor-not-allowed opacity-75 text-sm sm:text-base"
                            >
                              ✓ Completed
                            </button>
                          ) : null}
                          
                          {/* Locked Button - Only show if team is logged in, challenge is locked, and not completed */}
                          {isTeam && isLocked && !hasCorrectSubmission ? (
                            <button
                              disabled
                              className="bg-red-600/50 text-red-300 px-3 sm:px-4 py-2 rounded-lg cursor-not-allowed opacity-75 text-sm sm:text-base"
                            >
                              🔒 Locked
                            </button>
                          ) : null}
                        </div>
                      </div>
                      
                      {teamSubmissions.length > 0 && isTeam && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">
                            Submission History ({teamSubmissions.length})
                            {teamSubmissions.some(s => s.penalty && s.penalty > 0) && (
                              <span className="ml-2 text-red-400">
                                (Total Penalties: {teamSubmissions.reduce((sum, s) => sum + (s.penalty || 0), 0)})
                              </span>
                            )}
                          </h4>
                          <div className="space-y-1">
                            {teamSubmissions.slice(-3).map((sub) => (
                              <div key={sub.id} className="text-xs text-gray-400 flex justify-between">
                                <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="capitalize">{sub.status}</span>
                                  {sub.penalty && sub.penalty > 0 && (
                                    <span className="text-red-400">(-{sub.penalty})</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Submission Modal */}
          {selectedChallenge && isTeam && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-slate-800 border border-cyber-600/30 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Submit Answer</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{selectedChallenge.title}</p>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">{selectedChallenge.description}</p>
                {selectedChallenge.requiresManualReview && (
                  <div className="mb-3 sm:mb-4 p-2 bg-yellow-500/10 border-l-4 border-yellow-400 rounded">
                    <span className="text-yellow-300 text-xs sm:text-sm font-medium">
                      This challenge requires manual review. Your submission will be marked as pending until a staff member reviews it.
                    </span>
                  </div>
                )}
                
                {/* Hints Section */}
                {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="text-yellow-400 hover:text-yellow-300 text-xs sm:text-sm font-medium mb-2"
                    >
                      {showHints ? 'Hide Hints' : `Show Hints (${selectedChallenge.hints.length})`}
                    </button>
                    {showHints && (
                      <div className="bg-slate-700/50 rounded p-3 space-y-2">
                        {selectedChallenge.hints.map((hint, index) => (
                          <div key={index} className="text-yellow-300 text-xs sm:text-sm">
                            <span className="font-medium">Hint {index + 1}:</span> {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <form onSubmit={handleSubmission}>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none mb-3 sm:mb-4 text-sm sm:text-base"
                    rows={3}
                    placeholder="Enter your answer here..."
                    required
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      type="submit"
                      className="bg-hacker-600 hover:bg-hacker-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChallenge(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesPageContent />
    </ProtectedRoute>
  )
}
