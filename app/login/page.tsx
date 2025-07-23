'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../AuthContext'
import CyberUFVLogo from '../components/CyberUFVLogo'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login({ username, password })
      if (success) {
        router.push('/')
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid flex items-center justify-center px-4">
      <div className="bg-slate-800/80 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-4 sm:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <CyberUFVLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">CTF Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Enter your credentials to access the system</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username / Team Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-700 text-white pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none transition-colors text-sm sm:text-base"
                placeholder="Enter username or team name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 text-white pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg border border-gray-600 focus:border-cyber-400 focus:outline-none transition-colors text-sm sm:text-base"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600/30 rounded-lg p-3 text-red-300 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyber-600 hover:bg-cyber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
