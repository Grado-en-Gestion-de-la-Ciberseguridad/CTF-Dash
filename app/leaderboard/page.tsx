'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, ArrowLeft, Medal, Users, Target, Clock } from 'lucide-react'
import { Team, Submission, TeamProgress } from '../types'
import { useAuth } from '../AuthContext'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'

function LeaderboardPageContent() {
  const [teams, setTeams] = useState<Team[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [teamProgress, setTeamProgress] = useState<TeamProgress[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load teams from API
      const teamsResponse = await fetch('/api/teams')
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        console.log('Loaded teams:', teamsData)
        setTeams(teamsData)
      } else {
        console.error('Failed to load teams:', teamsResponse.status)
      }

      // Load submissions from API  
      const submissionsResponse = await fetch('/api/submissions')
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        console.log('Loaded submissions:', submissionsData)
        // The API returns { submissions: [...] }
        setSubmissions(submissionsData.submissions || [])
      } else {
        console.error('Failed to load submissions:', submissionsResponse.status)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    calculateProgress()
  }, [teams, submissions])

  const calculateProgress = () => {
    if (!teams || !Array.isArray(teams)) {
      setTeamProgress([])
      return
    }
    
    // Initialize submissions as empty array if not loaded yet
    const submissionsArray = submissions || []
    
    const progress = teams.map(team => {
      // Use the database calculated total_score directly
      const teamSubmissions = submissionsArray.filter(s => (s as any).team_id === team.id)
      const correctSubmissions = teamSubmissions.filter(s => s.status === 'correct')
      const penaltySubmissions = teamSubmissions.filter(s => s.penalty && s.penalty > 0)
      
      const totalPoints = correctSubmissions.reduce((sum, sub) => sum + sub.points, 0)
      const totalPenalties = penaltySubmissions.reduce((sum, sub) => sum + (sub.penalty || 0), 0)
      
      const completedChallenges = correctSubmissions.map(s => (s as any).challenge_id)
      const lastSubmission = teamSubmissions.length > 0 
        ? (teamSubmissions[teamSubmissions.length - 1] as any).submitted_at 
        : (team as any).created_at || (team as any).createdAt

      return {
        teamId: team.id,
        teamName: team.name,
        completedChallenges,
        totalScore: (team as any).total_score || team.totalScore || 0, // Use database calculated score
        totalPoints,
        totalPenalties,
        lastSubmission,
        rank: 0
      }
    })

    // Sort by score (descending) and assign ranks
    progress.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }
      // If scores are equal, earlier submission wins
      return new Date(a.lastSubmission).getTime() - new Date(b.lastSubmission).getTime()
    })

    progress.forEach((team, index) => {
      team.rank = index + 1
    })

    setTeamProgress(progress)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Medal className="h-6 w-6 text-yellow-400" />
      case 2: return <Medal className="h-6 w-6 text-gray-300" />
      case 3: return <Medal className="h-6 w-6 text-orange-400" />
      default: return <span className="h-6 w-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
      case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-black'
      case 3: return 'bg-gradient-to-r from-orange-500 to-orange-600 text-black'
      default: return 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
    }
  }

  const getTeamStats = (teamId: string) => {
    // Database uses team_id instead of teamId
    const submissionsArray = submissions || []
    const teamSubs = submissionsArray.filter(s => (s as any).team_id === teamId)
    const penaltyTotal = teamSubs.reduce((sum, s) => sum + (s.penalty || 0), 0)
    return {
      totalSubmissions: teamSubs.length,
      correctSubmissions: teamSubs.filter(s => s.status === 'correct').length,
      pendingSubmissions: teamSubs.filter(s => s.status === 'pending').length,
      incorrectSubmissions: teamSubs.filter(s => s.status === 'incorrect').length,
      totalPenalties: penaltyTotal
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-4 sm:mb-8">
          <Link href="/" className="mr-2 sm:mr-4 p-1.5 sm:p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </Link>
          <div className="flex items-center">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400 mr-2 sm:mr-4 animate-pulse-slow" />
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Leaderboard</h1>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Teams</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{teams.length}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-cyber-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-hacker-600/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Submissions</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{submissions.length}</p>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-hacker-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Correct Solutions</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {submissions.filter(s => s.status === 'correct').length}
                </p>
              </div>
              <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-600/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Pending Review</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2" />
            Team Rankings
          </h2>
          
          {teamProgress.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">No teams in leaderboard yet</p>
              <p className="text-gray-500 text-sm mb-4">Teams: {teams.length} | Submissions: {submissions.length}</p>
              <Link href="/teams" className="text-cyber-400 hover:text-cyber-300 underline text-sm sm:text-base">
                Register a team to get started
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {teamProgress.map((team, index) => {
                const stats = getTeamStats(team.teamId)
                const teamData = teams.find(t => t.id === team.teamId)
                
                return (
                  <div 
                    key={team.teamId} 
                    className={`border rounded-lg p-3 sm:p-6 transition-all duration-300 ${
                      team.rank <= 3 
                        ? 'border-yellow-400/50 bg-gradient-to-r from-slate-700/50 to-slate-800/50 glow' 
                        : 'border-gray-600 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-bold text-sm sm:text-base flex-shrink-0 ${getRankBadgeColor(team.rank)}`}>
                          {getRankIcon(team.rank)}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">{team.teamName}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">
                            Members: {teamData?.members.join(', ') || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="text-2xl sm:text-3xl font-bold text-hacker-400">
                          {team.totalScore}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {team.totalPenalties && team.totalPenalties > 0 ? (
                            <span>
                              {team.totalPoints} - {team.totalPenalties} penalties
                            </span>
                          ) : (
                            'points'
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="text-center p-2 bg-slate-600/30 rounded">
                        <div className="text-green-400 font-semibold">{stats.correctSubmissions}</div>
                        <div className="text-gray-400">Correct</div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/30 rounded">
                        <div className="text-yellow-400 font-semibold">{stats.pendingSubmissions}</div>
                        <div className="text-gray-400">Pending</div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/30 rounded">
                        <div className="text-red-400 font-semibold">{stats.incorrectSubmissions}</div>
                        <div className="text-gray-400">Incorrect</div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/30 rounded">
                        <div className="text-cyber-400 font-semibold">{team.completedChallenges.length}</div>
                        <div className="text-gray-400">Solved</div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/30 rounded">
                        <div className="text-orange-400 font-semibold">{stats.totalPenalties}</div>
                        <div className="text-gray-400">Penalties</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Last activity: {new Date(team.lastSubmission).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardPageContent />
    </ProtectedRoute>
  )
}
