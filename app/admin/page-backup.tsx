'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Settings, ArrowLeft, CheckCircle, XCircle, Clock, Users, Target, Award } from 'lucide-react'
import { Team, Submission, AdminStats, Challenge } from '../types'
import { useAuth } from '../AuthContext'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'
import AnswerManagement from '../components/AnswerManagement'

// Default challenges for the CTF
const defaultChallenges: Challenge[] = [
  // Security Awareness Challenges
  {
    id: 'sec-aware-1',
    roomId: 'security-awareness',
    roomName: 'Security Awareness',
    title: 'Phishing Email Analysis',
    description: 'Analyze the suspicious email and identify the phishing indicators.',
    points: 100,
    difficulty: 'easy',
    type: 'security-awareness',
    isActive: true
  },
  {
    id: 'sec-aware-2',
    roomId: 'security-awareness',
    roomName: 'Security Awareness',
    title: 'Social Engineering Detection',
    description: 'Identify the social engineering technique used in the scenario.',
    points: 150,
    difficulty: 'medium',
    type: 'security-awareness',
    isActive: true
  },
  // Password Security Challenges
  {
    id: 'pass-sec-1',
    roomId: 'password-security',
    roomName: 'Password Security',
    title: 'Password Strength Analysis',
    description: 'Evaluate password strength and suggest improvements.',
    points: 100,
    difficulty: 'easy',
    type: 'password-security',
    isActive: true
  },
  {
    id: 'pass-sec-2',
    roomId: 'password-security',
    roomName: 'Password Security',
    title: 'Hash Cracking',
    description: 'Crack the password hash using appropriate techniques.',
    points: 200,
    difficulty: 'hard',
    type: 'password-security',
    isActive: true
  },
  // OSINT Challenges
  {
    id: 'osint-1',
    roomId: 'osint-investigation',
    roomName: 'OSINT Investigation',
    title: 'Digital Footprint Analysis',
    description: 'Find information about the target using public sources.',
    points: 150,
    difficulty: 'medium',
    type: 'osint',
    isActive: true
  },
  {
    id: 'osint-2',
    roomId: 'osint-investigation',
    roomName: 'OSINT Investigation',
    title: 'Geolocation Challenge',
    description: 'Determine the location from the given image.',
    points: 200,
    difficulty: 'hard',
    type: 'osint',
    isActive: true
  },
  // Cryptography Challenges
  {
    id: 'crypto-1',
    roomId: 'cryptography-lab',
    roomName: 'Cryptography Lab',
    title: 'Caesar Cipher Decode',
    description: 'Decrypt the Caesar cipher to reveal the hidden message.',
    points: 100,
    difficulty: 'easy',
    type: 'cryptography',
    isActive: true
  },
  {
    id: 'crypto-2',
    roomId: 'cryptography-lab',
    roomName: 'Cryptography Lab',
    title: 'RSA Key Analysis',
    description: 'Analyze the RSA implementation and find the vulnerability.',
    points: 250,
    difficulty: 'hard',
    type: 'cryptography',
    isActive: true
  }
]

function AdminPageContent() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [assignedPoints, setAssignedPoints] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'answers'>('overview')

  useEffect(() => {
    loadData()
  }, [])

  const calculateStats = useCallback(() => {
    if (teams.length === 0) return

    const correctSubmissions = submissions.filter(s => s.status === 'correct')
    const teamScores = teams.map(team => {
      const teamCorrectSubs = correctSubmissions.filter(s => s.teamId === team.id)
      return teamCorrectSubs.reduce((sum, sub) => sum + sub.points, 0)
    })

    const averageScore = teamScores.length > 0 
      ? teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length 
      : 0

    const topTeamScore = Math.max(...teamScores, 0)
    const topTeam = teams.find(team => {
      const teamScore = correctSubmissions
        .filter(s => s.teamId === team.id)
        .reduce((sum, sub) => sum + sub.points, 0)
      return teamScore === topTeamScore
    })

    setAdminStats({
      totalTeams: teams.length,
      totalSubmissions: submissions.length,
      completedChallenges: correctSubmissions.length,
      averageScore: Math.round(averageScore),
      topTeam: topTeam?.name || 'None'
    })
  }, [teams, submissions])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  const loadData = () => {
    const storedTeams = localStorage.getItem('ctf-teams')
    const storedSubmissions = localStorage.getItem('ctf-submissions')
    
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams))
    }
    
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions))
    }
  }

  const saveSubmissions = (newSubmissions: Submission[]) => {
    localStorage.setItem('ctf-submissions', JSON.stringify(newSubmissions))
    setSubmissions(newSubmissions)
  }

  // calculateStats is memoized above

  const handleReview = (submission: Submission, status: 'correct' | 'incorrect') => {
    const challengePoints = getChallengePoints(submission.challengeId)
    const points = status === 'correct' ? (assignedPoints || challengePoints) : 0

    const updatedSubmission = {
      ...submission,
      status,
      points,
      reviewedBy: 'Admin',
      reviewNotes: reviewNotes.trim() || undefined
    }

    const updatedSubmissions = submissions.map(s => 
      s.id === submission.id ? updatedSubmission : s
    )

    saveSubmissions(updatedSubmissions)
    setSelectedSubmission(null)
    setReviewNotes('')
    setAssignedPoints(0)
  }

  const getChallengePoints = (challengeId: string): number => {
    const challengePoints: Record<string, number> = {
      'security-quiz': 100,
      'phishing-emails': 150,
      'weak-passwords': 100,
      'osint-investigation': 300,
      'crypto-caesar': 200,
      'crypto-substitution': 250
    }
    return challengePoints[challengeId] || 100
  }

  const getChallengeName = (challengeId: string): string => {
    const challengeNames: Record<string, string> = {
      'security-quiz': 'Security Quiz',
      'phishing-emails': 'Phishing Email Identification',
      'weak-passwords': 'Weak Password Identification',
      'osint-investigation': 'OSINT Investigation',
      'crypto-caesar': 'Caesar Cipher',
      'crypto-substitution': 'Substitution Cipher'
    }
    return challengeNames[challengeId] || challengeId
  }

  const getTeamName = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Unknown Team'
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const recentSubmissions = submissions
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <div className="flex items-center">
            <Settings className="h-10 w-10 text-purple-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>

        {/* Statistics */}
        {adminStats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Teams</p>
                  <p className="text-2xl font-bold text-white">{adminStats.totalTeams}</p>
                </div>
                <Users className="h-8 w-8 text-cyber-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-hacker-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Submissions</p>
                  <p className="text-2xl font-bold text-white">{adminStats.totalSubmissions}</p>
                </div>
                <Target className="h-8 w-8 text-hacker-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{adminStats.completedChallenges}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Score</p>
                  <p className="text-2xl font-bold text-white">{adminStats.averageScore}</p>
                </div>
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Top Team</p>
                  <p className="text-lg font-bold text-white truncate">{adminStats.topTeam}</p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Reviews */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="h-6 w-6 text-yellow-400 mr-2" />
              Pending Reviews ({pendingSubmissions.length})
            </h2>
            
            {pendingSubmissions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending submissions</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-slate-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{getChallengeName(submission.challengeId)}</h4>
                        <p className="text-sm text-gray-400">Team: {getTeamName(submission.teamId)}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-slate-600/30 rounded p-3 mb-3">
                      <p className="text-gray-300 text-sm font-mono break-words">{submission.answer}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setAssignedPoints(getChallengePoints(submission.challengeId))
                        }}
                        className="bg-cyber-600 hover:bg-cyber-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 text-cyber-400 mr-2" />
              Recent Activity
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="bg-slate-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{getTeamName(submission.teamId)}</p>
                      <p className="text-sm text-gray-400">{getChallengeName(submission.challengeId)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.status === 'correct' && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {submission.status === 'incorrect' && <XCircle className="h-5 w-5 text-red-400" />}
                      {submission.status === 'pending' && <Clock className="h-5 w-5 text-yellow-400" />}
                      <span className="text-sm text-gray-400">
                        {submission.points > 0 ? `${submission.points}pts` : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-cyber-600/30 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Review Submission</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Challenge</label>
                  <p className="text-white">{getChallengeName(selectedSubmission.challengeId)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Team</label>
                  <p className="text-white">{getTeamName(selectedSubmission.teamId)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Submitted Answer</label>
                  <div className="bg-slate-700 p-3 rounded font-mono text-sm text-gray-300">
                    {selectedSubmission.answer}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Points to Award</label>
                  <input
                    type="number"
                    value={assignedPoints}
                    onChange={(e) => setAssignedPoints(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyber-400 focus:outline-none"
                    min="0"
                    max="500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Review Notes (Optional)</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyber-400 focus:outline-none"
                    rows={3}
                    placeholder="Add any feedback or notes..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handleReview(selectedSubmission, 'correct')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark Correct
                </button>
                <button
                  onClick={() => handleReview(selectedSubmission, 'incorrect')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Mark Incorrect
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminPageContent />
    </ProtectedRoute>
  )
}
