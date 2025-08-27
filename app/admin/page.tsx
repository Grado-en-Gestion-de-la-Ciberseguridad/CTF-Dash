'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, ArrowLeft, CheckCircle, XCircle, Clock, Users, Target, Award, Download, Trophy, Terminal } from 'lucide-react'
import { Team, Submission, AdminStats, Challenge } from '../types'
import { useAuth } from '../AuthContext'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'
import AnswerManagement from '../components/AnswerManagement'
import ChallengeEditor from '../components/ChallengeEditor'

function AdminPageContent() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [assignedPoints, setAssignedPoints] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'answers' | 'editor' | 'events'>('overview')
  const [events, setEvents] = useState<any[]>([])
  const [regList, setRegList] = useState<any[]>([])
  const [attList, setAttList] = useState<any[]>([])
  const [evForm, setEvForm] = useState<any>({ name: '', description: '', registration_start: '', registration_end: '', start_time: '', end_time: '', location_name: '', latitude: '', longitude: '', radius_meters: 150, is_active: 1 })
  const [manForm, setManForm] = useState<any>({ eventId: '', email: '', phone: '', attendeeId: '', overrideWindow: false })

  useEffect(() => {
    loadData()
    loadChallengesFromFile()
    loadEvents()
  }, [])

  const loadChallengesFromFile = async () => {
    try {
      const response = await fetch('/challenges.json')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges)
        // Always update localStorage with latest JSON data
        localStorage.setItem('ctf-challenges', JSON.stringify(data.challenges))
      } else {
        console.error('Failed to load challenges.json')
        // Fallback to localStorage only if JSON fails
        const storedChallenges = localStorage.getItem('ctf-challenges')
        if (storedChallenges) {
          setChallenges(JSON.parse(storedChallenges))
        }
      }
    } catch (error) {
      console.error('Failed to load challenges from file:', error)
      // Fallback to localStorage only if JSON fails
      const storedChallenges = localStorage.getItem('ctf-challenges')
      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges))
      }
    }
  }

  const addChallenge = (challenge: Challenge) => {
    const updatedChallenges = [...challenges, challenge]
    setChallenges(updatedChallenges)
    localStorage.setItem('ctf-challenges', JSON.stringify(updatedChallenges))
  }

  const deleteChallenge = (challengeId: string) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      const updatedChallenges = challenges.filter(c => c.id !== challengeId)
      setChallenges(updatedChallenges)
      localStorage.setItem('ctf-challenges', JSON.stringify(updatedChallenges))
    }
  }

  useEffect(() => {
    calculateStats()
  }, [teams, submissions])

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
      const teamSubmissions = submissions.filter(s => s.teamId === team.id)
      const correctSubs = teamSubmissions.filter(s => s.status === 'correct')
      const totalPoints = correctSubs.reduce((sum, sub) => sum + sub.points, 0)
      const totalPenalties = teamSubmissions.reduce((sum, sub) => sum + (sub.penalty || 0), 0)
      return Math.max(0, totalPoints - totalPenalties)
    })
    
    const averageScore = teamScores.length > 0 ? teamScores.reduce((a, b) => a + b, 0) / teamScores.length : 0
    const topTeam = teams.find(team => {
      const teamSubmissions = submissions.filter(s => s.teamId === team.id)
      const correctSubs = teamSubmissions.filter(s => s.status === 'correct')
      const totalPoints = correctSubs.reduce((sum, sub) => sum + sub.points, 0)
      const totalPenalties = teamSubmissions.reduce((sum, sub) => sum + (sub.penalty || 0), 0)
      const teamScore = Math.max(0, totalPoints - totalPenalties)
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

  async function loadEvents() {
    try {
      const res = await fetch('/api/admin/attendance?type=events', { headers: { 'x-ctf-role': 'admin' } })
      const data = await res.json()
      setEvents(data.events || [])
    } catch {}
  }

  async function refreshLists(eventId?: string) {
    try {
      const qs = eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''
      const [regsRes, attRes] = await Promise.all([
        fetch(`/api/admin/attendance?type=registrations${qs}`, { headers: { 'x-ctf-role': 'admin' } }),
        fetch(`/api/admin/attendance${qs}`, { headers: { 'x-ctf-role': 'admin' } })
      ])
      const regs = await regsRes.json()
      const atts = await attRes.json()
      setRegList(regs.registrations || [])
      setAttList(atts.attendance || [])
    } catch {}
  }

  async function saveEvent() {
    const payload = { action: 'upsertEvent', ...evForm, latitude: evForm.latitude ? Number(evForm.latitude) : null, longitude: evForm.longitude ? Number(evForm.longitude) : null, radius_meters: evForm.radius_meters ? Number(evForm.radius_meters) : null }
    const res = await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ctf-role': 'admin' }, body: JSON.stringify(payload) })
  if (res.ok) { setEvForm({ name: '', description: '', registration_start: '', registration_end: '', start_time: '', end_time: '', location_name: '', latitude: '', longitude: '', radius_meters: 150, is_active: 1 }); await loadEvents() }
  }

  async function addLocation(evId: string) {
    const name = prompt('Location name (optional)') || undefined
    const lat = Number(prompt('Latitude') || '')
    const lon = Number(prompt('Longitude') || '')
    const rad = Number(prompt('Radius (m)') || '150')
    if (Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(rad)) {
      await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ctf-role': 'admin' }, body: JSON.stringify({ action: 'addLocation', eventId: evId, name, latitude: lat, longitude: lon, radius_meters: rad }) })
      alert('Location added')
    }
  }

  async function manualCheckIn() {
    const res = await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ctf-role': 'admin' }, body: JSON.stringify({ action: 'manualAttendance', ...manForm }) })
    const data = await res.json()
    alert(data.message || (data.success ? 'Recorded' : 'Failed'))
    if (data.success) { setManForm({ eventId: '', email: '', phone: '', attendeeId: '', overrideWindow: false }); refreshLists() }
  }

  function downloadCSV(eventId: string) {
    const url = `/api/attendance/export?eventId=${encodeURIComponent(eventId)}`
    fetch(url, { headers: { 'x-ctf-role': 'admin' } }).then(async res => {
      if (!res.ok) { alert('Export failed'); return }
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `attendance-${eventId}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }

  const updateSubmissionStatus = (submissionId: string, status: 'correct' | 'incorrect', points: number, notes: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (!submission) return
    
    // If marking as correct, check if team already has a correct submission for this challenge
    if (status === 'correct') {
      const existingCorrect = submissions.find(s => 
        s.teamId === submission.teamId && 
        s.challengeId === submission.challengeId && 
        s.status === 'correct' &&
        s.id !== submissionId
      )
      
      if (existingCorrect) {
        if (!confirm('This team already has a correct submission for this challenge. Are you sure you want to mark this as correct too?')) {
          return
        }
      }
    }
    
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === submissionId) {
        // Calculate penalty for incorrect answers
        let penalty = 0
        if (status === 'incorrect') {
          const challenge = challenges.find(c => c.id === sub.challengeId)
          penalty = challenge?.penaltyPerIncorrect || 0
        }
        
        return {
          ...sub,
          status: status as 'pending' | 'correct' | 'incorrect' | 'reviewed',
          points,
          penalty,
          reviewNotes: notes,
          reviewedBy: user?.username
        }
      }
      return sub
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
              { id: 'answers', label: 'Answer Management', icon: CheckCircle },
              { id: 'events', label: 'Events', icon: Users }
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

              {/* Quick Actions */}
              <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link 
                    href="/terminal" 
                    className="flex items-center gap-3 bg-black/50 border border-green-400/30 rounded-lg p-4 hover:border-green-400 transition-all duration-300 group"
                  >
                    <Terminal className="h-6 w-6 text-green-400 group-hover:animate-pulse" />
                    <div>
                      <h4 className="text-green-400 font-semibold">Secret Terminal</h4>
                      <p className="text-green-300 text-sm">Access hidden terminal for demos</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/resources" 
                    className="flex items-center gap-3 bg-slate-700/50 border border-gray-600/30 rounded-lg p-4 hover:border-gray-400 transition-all duration-300 group"
                  >
                    <Settings className="h-6 w-6 text-gray-400 group-hover:animate-pulse" />
                    <div>
                      <h4 className="text-white font-semibold">Resources Hub</h4>
                      <p className="text-gray-300 text-sm">View all CTF resources</p>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-3 bg-blue-600/20 border border-blue-600/30 rounded-lg p-4 hover:border-blue-400 transition-all duration-300 group"
                  >
                    <Download className="h-6 w-6 text-blue-400 group-hover:animate-pulse" />
                    <div>
                      <h4 className="text-blue-400 font-semibold">Export Data</h4>
                      <p className="text-blue-300 text-sm">Download all submissions</p>
                    </div>
                  </button>
                </div>
              </div>

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
                              {submission.penalty && submission.penalty > 0 && (
                                <p className="text-xs text-red-400">Penalty: -{submission.penalty} points</p>
                              )}
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
                      const teamSubmissions = submissions.filter(s => s.teamId === team.id)
                      const correctSubmissions = teamSubmissions.filter(s => s.status === 'correct')
                      const teamPoints = correctSubmissions.reduce((sum, sub) => sum + sub.points, 0)
                      const teamPenalties = teamSubmissions.reduce((sum, sub) => sum + (sub.penalty || 0), 0)
                      const teamScore = Math.max(0, teamPoints - teamPenalties)
                      return (
                        <div key={team.id} className="bg-slate-700/50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{team.name}</p>
                              <p className="text-sm text-gray-400">{team.members.length} members</p>
                              {teamPenalties > 0 && (
                                <p className="text-xs text-red-400">Penalties: -{teamPenalties}</p>
                              )}
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

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Create / Update Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['id','name','description','registration_start','registration_end','start_time','end_time','location_name','latitude','longitude','radius_meters','is_active'].map((k) => (
                    <div key={k}>
                      <label className="block text-sm text-gray-300 mb-1">{k}</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-white"
                        value={evForm[k] ?? ''}
                        onChange={(e) => setEvForm((s: any) => ({ ...s, [k]: e.target.value }))}
                        placeholder={k}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={saveEvent} className="bg-cyber-600 hover:bg-cyber-700 text-white px-4 py-2 rounded">Save Event</button>
                  <button onClick={() => setEvForm({ name: '', description: '', registration_start: '', registration_end: '', start_time: '', end_time: '', location_name: '', latitude: '', longitude: '', radius_meters: 150, is_active: 1 })} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded">Clear</button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Events</h3>
                  <button onClick={() => loadEvents()} className="text-sm text-cyan-300 underline">Refresh</button>
                </div>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <div key={ev.id} className="bg-slate-700/50 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{ev.name}</p>
                          <p className="text-xs text-gray-400">{ev.id}</p>
                          <p className="text-xs text-gray-400">{ev.start_time} → {ev.end_time}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEvForm(ev)} className="px-3 py-1 bg-slate-600 text-white rounded">Edit</button>
                          <a href={`/events/${encodeURIComponent(ev.id)}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-indigo-600 text-white rounded">Open Page</a>
                          <button onClick={() => addLocation(ev.id)} className="px-3 py-1 bg-purple-600 text-white rounded">Add Location</button>
                          <button onClick={() => { refreshLists(ev.id); }} className="px-3 py-1 bg-blue-600 text-white rounded">View Lists</button>
                          <button onClick={() => downloadCSV(ev.id)} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Manual Check-in</h3>
                  <button onClick={() => manualCheckIn()} className="px-3 py-1 bg-green-700 text-white rounded">Record</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {['eventId','email','phone','attendeeId'].map((k) => (
                    <div key={k}>
                      <label className="block text-sm text-gray-300 mb-1">{k}</label>
                      <input className="w-full p-2 rounded bg-slate-700 text-white" value={manForm[k] ?? ''} onChange={(e) => setManForm((s: any) => ({ ...s, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex items-end">
                    <label className="text-sm text-gray-300 mr-2">Override Window</label>
                    <input type="checkbox" checked={manForm.overrideWindow} onChange={(e) => setManForm((s: any) => ({ ...s, overrideWindow: e.target.checked }))} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Registrations</h3>
                    <button onClick={() => refreshLists()} className="text-sm text-cyan-300 underline">Refresh</button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {regList.map((r) => (
                      <div key={r.id} className="bg-slate-700/50 rounded p-2 text-sm text-white">
                        <div className="flex justify-between"><span>{r.event_name}</span><span className="text-gray-400">{r.created_at}</span></div>
                        <div className="text-gray-300">{r.email} • {r.phone} • {r.attendee_id}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Attendance</h3>
                    <button onClick={() => refreshLists()} className="text-sm text-cyan-300 underline">Refresh</button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {attList.map((a) => (
                      <div key={a.id} className="bg-slate-700/50 rounded p-2 text-sm text-white">
                        <div className="flex justify-between"><span>{a.event_name}</span><span className="text-gray-400">{a.created_at}</span></div>
                        <div className="text-gray-300">{a.email} • {a.phone} • {a.attendee_id}</div>
                        <div className="text-gray-400">{a.status}{a.distance_meters != null ? ` • ${Math.round(a.distance_meters)}m` : ''}{a.reason ? ` • ${a.reason}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
