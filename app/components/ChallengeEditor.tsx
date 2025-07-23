'use client'

import { useState } from 'react'
import { Challenge } from '../types'
import { Edit, Save, X, Plus, Trash2, Download, Upload } from 'lucide-react'

interface ChallengeEditorProps {
  challenges: Challenge[]
  onUpdateChallenge: (challengeId: string, updates: Partial<Challenge>) => void
  onAddChallenge: (challenge: Challenge) => void
  onDeleteChallenge: (challengeId: string) => void
}

export default function ChallengeEditor({ 
  challenges, 
  onUpdateChallenge, 
  onAddChallenge, 
  onDeleteChallenge 
}: ChallengeEditorProps) {
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Challenge>>({})

  const startEditing = (challenge: Challenge) => {
    setEditingChallenge(challenge.id)
    setEditForm(challenge)
  }

  const saveChanges = () => {
    if (!editingChallenge) return
    onUpdateChallenge(editingChallenge, editForm)
    setEditingChallenge(null)
    setEditForm({})
  }

  const cancelEditing = () => {
    setEditingChallenge(null)
    setEditForm({})
  }

  const handleAddChallenge = () => {
    if (!editForm.id || !editForm.title) return
    
    const newChallenge: Challenge = {
      id: editForm.id,
      roomId: editForm.roomId || '',
      roomName: editForm.roomName || '',
      title: editForm.title,
      description: editForm.description || '',
      points: editForm.points || 100,
      difficulty: editForm.difficulty || 'easy',
      type: editForm.type || 'security-awareness',
      isActive: editForm.isActive !== false,
      correctAnswer: editForm.correctAnswer,
      acceptedAnswers: editForm.acceptedAnswers || [],
      hints: editForm.hints || []
    }
    
    onAddChallenge(newChallenge)
    setShowAddForm(false)
    setEditForm({})
  }

  const exportChallenges = () => {
    const data = {
      challenges: challenges,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cyberufv-challenges-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importChallenges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.challenges && Array.isArray(data.challenges)) {
          data.challenges.forEach((challenge: Challenge) => {
            onAddChallenge(challenge)
          })
          alert(`Imported ${data.challenges.length} challenges successfully!`)
        }
      } catch (error) {
        alert('Failed to import challenges. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Challenge Editor</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Challenge
            </button>
            <button
              onClick={exportChallenges}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importChallenges}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Add Challenge Form */}
        {showAddForm && (
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Challenge</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Challenge ID"
                value={editForm.id || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, id: e.target.value }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              />
              <input
                type="text"
                placeholder="Title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              />
              <input
                type="text"
                placeholder="Room ID"
                value={editForm.roomId || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, roomId: e.target.value }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              />
              <input
                type="text"
                placeholder="Room Name"
                value={editForm.roomName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, roomName: e.target.value }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              />
              <input
                type="number"
                placeholder="Points"
                value={editForm.points || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              />
              <select
                value={editForm.difficulty || 'easy'}
                onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <textarea
              placeholder="Description"
              value={editForm.description || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full mt-4 px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddChallenge}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Challenge
              </button>
              <button
                onClick={() => { setShowAddForm(false); setEditForm({}) }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Challenge List */}
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{challenge.title}</h4>
                  <p className="text-sm text-gray-400">
                    {challenge.roomName} - {challenge.points} points - {challenge.difficulty}
                  </p>
                </div>
                <div className="flex gap-2">
                  {editingChallenge === challenge.id ? (
                    <>
                      <button
                        onClick={saveChanges}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(challenge)}
                        className="bg-cyber-600 hover:bg-cyber-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteChallenge(challenge.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingChallenge === challenge.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                    placeholder="Title"
                  />
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                    rows={3}
                    placeholder="Description"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={editForm.points || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                      className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                      placeholder="Points"
                    />
                    <select
                      value={editForm.difficulty || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">{challenge.description}</p>
                  <div className="text-sm text-gray-400">
                    {challenge.correctAnswer && (
                      <p>✓ Answer: {challenge.correctAnswer}</p>
                    )}
                    {challenge.hints && challenge.hints.length > 0 && (
                      <p>💡 {challenge.hints.length} hint(s) available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
