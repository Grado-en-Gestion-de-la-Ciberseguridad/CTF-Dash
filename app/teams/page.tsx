'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Team } from '../types'
import { useAuth } from '../AuthContext'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'

function TeamsPageContent() {
  const [teams, setTeams] = useState<Team[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    members: [''],
    password: ''
  })
  const { isAdmin, isStaff } = useAuth()

  useEffect(() => {
    loadTeams()
  }, [])

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

  const saveTeams = async (newTeam: any) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeam.name,
          password: newTeam.password,
          members: newTeam.members
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reload teams from server
        await loadTeams()
        return true
      } else {
        alert(data.error || 'Failed to create team')
        return false
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Error creating team. Please try again.')
      return false
    }
  }

  const updateTeam = async (teamData: any) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      })

      const data = await response.json()

      if (data.success) {
        // Reload teams from server
        await loadTeams()
        return true
      } else {
        alert(data.error || 'Failed to update team')
        return false
      }
    } catch (error) {
      console.error('Error updating team:', error)
      alert('Error updating team. Please try again.')
      return false
    }
  }

  const removeTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams?id=${teamId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Reload teams from server
        await loadTeams()
        return true
      } else {
        alert(data.error || 'Failed to delete team')
        return false
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Error deleting team. Please try again.')
      return false
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || (!editingTeam && !formData.password) || formData.members.filter(m => m.trim()).length === 0) {
      alert('Please provide team name, password (for new teams), and at least one member')
      return
    }

    // Check if team name already exists (for new teams or when changing name)
    const nameChanged = editingTeam && editingTeam.name !== formData.name
    if ((!editingTeam || nameChanged) && teams.some(t => t.name.toLowerCase() === formData.name.toLowerCase())) {
      alert('Team name already exists. Please choose a different name.')
      return
    }

    const validMembers = formData.members.filter(member => member.trim())

    if (editingTeam) {
      // Update existing team
      const success = await updateTeam({
        id: editingTeam.id,
        name: formData.name,
        password: formData.password || undefined, // Only update password if provided
        members: validMembers
      })

      if (success) {
        alert(`Team "${formData.name}" updated successfully!`)
        resetForm()
      }
    } else {
      // Create new team
      const success = await saveTeams({
        name: formData.name,
        password: formData.password,
        members: validMembers
      })

      if (success) {
        alert(`Team "${formData.name}" created successfully!`)
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', members: [''], password: '' })
    setShowForm(false)
    setEditingTeam(null)
  }

  const addMemberField = () => {
    setFormData({
      ...formData,
      members: [...formData.members, '']
    })
  }

  const updateMember = (index: number, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = value
    setFormData({ ...formData, members: newMembers })
  }

  const removeMember = (index: number) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index)
      setFormData({ ...formData, members: newMembers })
    }
  }

  const editTeam = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      members: team.members,
      password: '' // Start with empty password for editing
    })
    setShowForm(true)
  }

  const deleteTeam = async (teamId: string) => {
    if (confirm('Are you sure you want to delete this team? This will deactivate the team but preserve submission history.')) {
      const success = await removeTeam(teamId)
      if (success) {
        alert('Team deleted successfully!')
      }
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/" className="mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
              <div className="flex items-center">
                <Users className="h-10 w-10 text-cyber-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">Team Management</h1>
              </div>
            </div>
            {(isAdmin || isStaff) && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-cyber-600 hover:bg-cyber-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Team
              </button>
            )}
          </div>

          {/* Registration Form */}
          {showForm && (isAdmin || isStaff) && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingTeam ? 'Edit Team' : 'Register New Team'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-semibold">Team Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none"
                    placeholder="Enter team name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">
                    Team Password {editingTeam && <span className="text-gray-400 text-sm">(leave blank to keep current)</span>}
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none pr-12"
                        placeholder={editingTeam ? "Enter new password (optional)" : "Enter team password"}
                        required={!editingTeam}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="bg-hacker-600 hover:bg-hacker-700 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {editingTeam 
                      ? "Leave blank to keep the current password" 
                      : "Teams will use this password to log in"
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-semibold">Team Members</label>
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updateMember(index, e.target.value)}
                        className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none mr-2"
                        placeholder={`Member ${index + 1} name`}
                      />
                      {formData.members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMemberField}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    + Add Member
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-hacker-600 hover:bg-hacker-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {editingTeam ? 'Update Team' : 'Register Team'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams List */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Registered Teams ({teams.length})</h2>
            
            {teams.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No teams registered yet. Add the first team!</p>
            ) : (
              <div className="grid gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="bg-slate-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                        <div className="text-gray-300 mb-2">
                          <strong>Members:</strong> {team.members.join(', ')}
                        </div>
                        {(isAdmin || isStaff) && (
                          <div className="text-sm text-gray-400 mb-2">
                            <strong>Password:</strong> <span className="font-mono bg-slate-600 px-2 py-1 rounded">{team.password}</span>
                          </div>
                        )}
                        <div className="text-sm text-gray-400 grid grid-cols-2 gap-4">
                          <span>Score: <span className="text-hacker-400 font-semibold">{team.totalScore}</span></span>
                          <span>Registered: {new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                        {team.currentMembers && team.currentMembers.length > 0 && (
                          <div className="text-sm text-green-400 mt-2">
                            <strong>Currently Online:</strong> {team.currentMembers.join(', ')}
                          </div>
                        )}
                      </div>
                      {(isAdmin || isStaff) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editTeam(team)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTeam(team.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsPageContent />
    </ProtectedRoute>
  )
}
