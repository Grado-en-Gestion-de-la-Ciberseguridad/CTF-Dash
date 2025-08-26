'use client'

import { useState, useEffect } from 'react'
import { Trophy, Users, Target, Clock, TrendingUp, Activity } from 'lucide-react'

interface TeamStats {
  name: string
  total_score: number
  solved_challenges: number
}

interface RecentSubmission {
  team_name: string
  challenge_id: string
  status: 'correct' | 'incorrect'
  points: number
  submitted_at: string
}

interface ChallengeStats {
  challenge_id: string
  total_attempts: number
  correct_solves: number
  incorrect_attempts: number
}

interface PublicStats {
  teams: TeamStats[]
  recentSubmissions: RecentSubmission[]
  challengeStats: ChallengeStats[]
  totalTeams: number
  totalSubmissions: number
}

export default function PublicStatsPage() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) {
        throw new Error('Failed to load stats')
      }
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error loading stats:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatChallengeName = (challengeId: string) => {
    return challengeId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'text-green-400'
      case 'incorrect': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct': return '✓'
      case 'incorrect': return '✗'
      default: return '⏳'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid flex items-center justify-center">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            🏆 CTF Live Statistics
          </h1>
          <p className="text-sm sm:text-xl text-gray-300">Real-time competition dashboard</p>
          <div className="flex flex-col sm:flex-row justify-center items-center mt-3 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center text-cyber-400 text-sm sm:text-base">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span>Auto-refreshes every 30 seconds</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-2 sm:mr-3" />
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Teams</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats?.totalTeams || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-2 sm:mr-3" />
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-white">{stats?.totalSubmissions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-2 sm:mr-3" />
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Active Challenges</p>
                <p className="text-2xl font-bold text-white">{stats?.challengeStats.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-2 sm:mr-3" />
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Last Updated</p>
                <p className="text-lg font-bold text-white" suppressHydrationWarning>
                  {mounted ? new Date().toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Leaderboard */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center mb-4 sm:mb-6">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2 sm:mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Leaderboard</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {stats?.teams.slice(0, 10).map((team, index) => (
                <div key={team.name} className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-xs sm:text-sm ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm sm:text-base truncate">{team.name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">{team.solved_challenges} challenges solved</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-cyber-400 font-bold text-base sm:text-lg">{team.total_score}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
            <div className="flex items-center mb-4 sm:mb-6">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2 sm:mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Live Activity</h2>
            </div>
            
            <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
              {stats?.recentSubmissions.slice(0, 20).map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <span className={`text-base sm:text-lg mr-2 sm:mr-3 flex-shrink-0 ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{submission.team_name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{formatChallengeName(submission.challenge_id)}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className={`font-bold text-sm sm:text-base ${
                      submission.points > 0 
                        ? 'text-green-400' 
                        : submission.points < 0 
                          ? 'text-red-400' 
                          : 'text-gray-400'
                    }`}>
                      {submission.points > 0 
                        ? `+${submission.points}` 
                        : submission.points < 0 
                          ? `${submission.points}` 
                          : '0'} pts
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">{formatTime(submission.submitted_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Statistics */}
        <div className="mt-4 sm:mt-8 bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-3 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
            Challenge Statistics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stats?.challengeStats.map((challenge) => {
              const solveRate = challenge.total_attempts > 0 
                ? Math.round((challenge.correct_solves / challenge.total_attempts) * 100)
                : 0
              
              return (
                <div key={challenge.challenge_id} className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base truncate">
                    {formatChallengeName(challenge.challenge_id)}
                  </h3>
                  
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Attempts:</span>
                      <span className="text-white">{challenge.total_attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Solved:</span>
                      <span className="text-green-400">{challenge.correct_solves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="text-red-400">{challenge.incorrect_attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className={`font-bold ${solveRate > 70 ? 'text-green-400' : solveRate > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {solveRate}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${solveRate}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            🚀 Powered by Next.js + SQLite • Real-time CTF Dashboard
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Statistics update automatically every 30 seconds
          </p>
        </div>
      </div>
    </div>
  )
}
