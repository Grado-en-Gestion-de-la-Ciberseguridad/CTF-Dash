'use client'

import { useState, useEffect } from 'react'
import { Challenge } from '../types'
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react'

interface AnswerManagementProps {
  challenges: Challenge[]
  onUpdateChallenge: (challengeId: string, updates: Partial<Challenge>) => void
}

export default function AnswerManagement({ challenges, onUpdateChallenge }: AnswerManagementProps) {
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    correctAnswer: '',
    acceptedAnswers: [''],
    hints: ['']
  })

  const startEditing = (challenge: Challenge) => {
    setEditingChallenge(challenge.id)
    setEditForm({
      correctAnswer: challenge.correctAnswer || '',
      acceptedAnswers: challenge.acceptedAnswers || [''],
      hints: challenge.hints || ['']
    })
  }

  const saveChanges = () => {
    if (!editingChallenge) return
    
    const updates = {
      correctAnswer: editForm.correctAnswer,
      acceptedAnswers: editForm.acceptedAnswers.filter(answer => answer.trim() !== ''),
      hints: editForm.hints.filter(hint => hint.trim() !== '')
    }
    
    onUpdateChallenge(editingChallenge, updates)
    setEditingChallenge(null)
  }

  const addAcceptedAnswer = () => {
    setEditForm(prev => ({
      ...prev,
      acceptedAnswers: [...prev.acceptedAnswers, '']
    }))
  }

  const removeAcceptedAnswer = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      acceptedAnswers: prev.acceptedAnswers.filter((_, i) => i !== index)
    }))
  }

  const updateAcceptedAnswer = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      acceptedAnswers: prev.acceptedAnswers.map((answer, i) => i === index ? value : answer)
    }))
  }

  const addHint = () => {
    setEditForm(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }))
  }

  const removeHint = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }))
  }

  const updateHint = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Answer Management</h3>
        <p className="text-gray-300 mb-6">
          Set correct answers and hints for challenges. Teams will be automatically scored based on these answers.
        </p>

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{challenge.title}</h4>
                  <p className="text-sm text-gray-400">{challenge.roomName} - {challenge.points} points</p>
                </div>
                {editingChallenge === challenge.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveChanges}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingChallenge(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(challenge)}
                    className="bg-cyber-600 hover:bg-cyber-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>

              {editingChallenge === challenge.id ? (
                <div className="space-y-4">
                  {/* Correct Answer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Correct Answer
                    </label>
                    <input
                      type="text"
                      value={editForm.correctAnswer}
                      onChange={(e) => setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                      placeholder="Enter the main correct answer"
                    />
                  </div>

                  {/* Accepted Answers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Additional Accepted Answers
                      </label>
                      <button
                        onClick={addAcceptedAnswer}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editForm.acceptedAnswers.map((answer, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => updateAcceptedAnswer(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                            placeholder="Alternative correct answer"
                          />
                          <button
                            onClick={() => removeAcceptedAnswer(index)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hints */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Hints (optional)
                      </label>
                      <button
                        onClick={addHint}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editForm.hints.map((hint, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => updateHint(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-cyber-400"
                            placeholder="Hint for teams"
                          />
                          <button
                            onClick={() => removeHint(index)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Correct Answer: </span>
                    <span className="text-white">
                      {challenge.correctAnswer || <span className="text-red-400">Not set</span>}
                    </span>
                  </div>
                  {challenge.acceptedAnswers && challenge.acceptedAnswers.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400">Accepted Answers: </span>
                      <span className="text-white">{challenge.acceptedAnswers.join(', ')}</span>
                    </div>
                  )}
                  {challenge.hints && challenge.hints.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400">Hints: </span>
                      <span className="text-white">{challenge.hints.length} hint(s) available</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
