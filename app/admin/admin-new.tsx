'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, ArrowLeft, CheckCircle, XCircle, Clock, Users, Target, Award, Download, Trophy } from 'lucide-react'
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

  useEffect(() => {
    calculateStats()
  }, [teams, submissions])

  const loadData = () => {
    const storedTeams = localStorage.getItem('ctf-teams')
    const storedSubmissions = localStorage.getItem('ctf-submissions')
    const storedChallenges = localStorage.getItem('ctf-challenges')
    
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams))
    }
    
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions))
    }

    if (storedChallenges) {
      setChallenges(JSON.parse(storedChallenges))
    } else {
      // Save default challenges if none exist
      localStorage.setItem('ctf-challenges', JSON.stringify(defaultChallenges))
    }
  }

  const updateChallenge = (challengeId: string, updates: Partial<Challenge>) => {
    const updatedChallenges = challenges.map(challenge => 
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    )
    setChallenges(updatedChallenges)
    localStorage.setItem('ctf-challenges', JSON.stringify(updatedChallenges))
  }

  const calculateStats = () => {
    if (teams.length === 0) return

    const correctSubmissions = submissions.filter(s => s.status === 'correct').length
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length
    const completedChallenges = new Set(submissions.filter(s => s.status === 'correct').map(s => s.challengeId)).size
    
    const teamScores = teams.map(team => {
      const teamSubmissions = submissions.filter(s => s.teamId === team.id && s.status === 'correct')
      return teamSubmissions.reduce((sum, sub) => sum + sub.points, 0)
    })
    
    const averageScore = teamScores.length > 0 ? teamScores.reduce((a, b) => a + b, 0) / teamScores.length : 0
    const topTeam = teams.find(team => {
      const teamScore = submissions.filter(s => s.teamId === team.id && s.status === 'correct')
        .reduce((sum, sub) => sum + sub.points, 0)
      return teamScore === Math.max(...teamScores)
    })

    setAdminStats({
      totalTeams: teams.length,
      totalSubmissions: submissions.length,
      completedChallenges,
      averageScore,
      topTeam: topTeam?.name || 'N/A'
    })
  }

  const updateSubmissionStatus = (submissionId: string, status: 'correct' | 'incorrect', points: number, notes: string) => {
    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          status: status as 'pending' | 'correct' | 'incorrect' | 'reviewed',
          points,
          reviewNotes: notes,
          reviewedBy: user?.username
        }
      }
      return submission
    })

    setSubmissions(updatedSubmissions)
    localStorage.setItem('ctf-submissions', JSON.stringify(updatedSubmissions))
    setSelectedSubmission(null)
    setReviewNotes('')
    setAssignedPoints(0)
  }

  const exportData = () => {
    const data = {
      teams,
      submissions,
      challenges,
      adminStats,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cyberufv-ctf-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-white">CyberUFV Admin Dashboard</h1>
                  <p className="text-slate-300">System oversight and submission review</p>
                </div>
              </div>
            </div>
            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'submissions', label: 'Submissions', icon: Clock },
              { id: 'answers', label: 'Answer Management', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-cyber-600 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {adminStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Total Teams</p>
                        <p className="text-2xl font-bold text-white">{adminStats.totalTeams}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-green-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Submissions</p>
                        <p className="text-2xl font-bold text-white">{adminStats.totalSubmissions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-cyber-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Solved Challenges</p>
                        <p className="text-2xl font-bold text-white">{adminStats.completedChallenges}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Avg Score</p>
                        <p className="text-2xl font-bold text-white">{Math.round(adminStats.averageScore)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-gold-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Leading Team</p>
                        <p className="text-lg font-bold text-white truncate">{adminStats.topTeam}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Submissions</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {submissions.slice(-10).reverse().map((submission) => {
                      const team = teams.find(t => t.id === submission.teamId)
                      const challenge = challenges.find(c => c.id === submission.challengeId)
                      return (
                        <div key={submission.id} className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{team?.name || 'Unknown Team'}</p>
                              <p className="text-sm text-gray-400">{challenge?.title || 'Unknown Challenge'}</p>
                            </div>
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.status === 'correct' ? 'bg-green-600 text-white' :
                                submission.status === 'incorrect' ? 'bg-red-600 text-white' :
                                'bg-yellow-600 text-white'
                              }`}>
                                {submission.status}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(submission.submittedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Team Performance</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {teams.map((team) => {
                      const teamSubmissions = submissions.filter(s => s.teamId === team.id && s.status === 'correct')
                      const teamScore = teamSubmissions.reduce((sum, sub) => sum + sub.points, 0)
                      return (
                        <div key={team.id} className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{team.name}</p>
                              <p className="text-sm text-gray-400">{team.members.length} members</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-cyber-400">{teamScore}</p>
                              <p className="text-xs text-gray-400">points</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Pending Submissions ({pendingSubmissions.length})</h3>
                
                {pendingSubmissions.length === 0 ? (
                  <p className="text-gray-400">No pending submissions</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions.map((submission) => {
                      const team = teams.find(t => t.id === submission.teamId)
                      const challenge = challenges.find(c => c.id === submission.challengeId)
                      return (
                        <div key={submission.id} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{team?.name}</h4>
                              <p className="text-cyber-400">{challenge?.title}</p>
                              <p className="text-sm text-gray-400">{challenge?.roomName} - {challenge?.points} points</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-1">Submitted Answer:</p>
                            <p className="text-white bg-slate-600/50 p-2 rounded">{submission.answer}</p>
                          </div>

                          {challenge?.correctAnswer && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">Expected Answer:</p>
                              <p className="text-green-400 bg-slate-600/50 p-2 rounded">{challenge.correctAnswer}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'correct', challenge?.points || 0, 'Correct answer')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'incorrect', 0, 'Incorrect answer')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'answers' && (
            <AnswerManagement 
              challenges={challenges}
              onUpdateChallenge={updateChallenge}
            />
          )}
        </div>
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
