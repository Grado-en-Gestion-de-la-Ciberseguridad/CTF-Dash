'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Users, Trophy, Settings, FileText, Terminal } from 'lucide-react'
import { useAuth } from './AuthContext'
import Navigation from './Navigation'
import ProtectedRoute from './ProtectedRoute'
import CyberUFVLogo from './components/CyberUFVLogo'

function HomePage() {
  const { user, isAdmin, isStaff, isTeam } = useAuth()
  const [konamiUnlocked, setKonamiUnlocked] = useState(false)
  const [konamiSequence, setKonamiSequence] = useState<string[]>([])

  // Konami code detection
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
    
    const handleKeyPress = (e: KeyboardEvent) => {
      const newSequence = [...konamiSequence, e.code].slice(-10)
      setKonamiSequence(newSequence)
      
      if (newSequence.join(',') === konamiCode.join(',')) {
        setKonamiUnlocked(true)
        // Show celebration effect
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUYrTp66hVFApGn+PxtmMcBjiS2e/NeSsFJHfH8N2QQAoUYrTp66hVFApGnuPxtmMcBjiS2e/NeSsFJHfH8N2QQAoUYrTp66hVFApGn+MBM')
          audio.play().catch(() => {}) // Ignore audio play errors
        } catch (error) {
          // Ignore audio errors
        }
        
        setTimeout(() => {
          setKonamiSequence([])
        }, 3000)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [konamiSequence])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <header className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <CyberUFVLogo size="lg" className="sm:hidden" />
              <CyberUFVLogo size="xl" className="hidden sm:block mr-6" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
              <Shield className="h-10 w-10 sm:h-16 sm:w-16 text-cyber-400 mb-2 sm:mb-0 sm:mr-4 pulse-glow" />
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white text-center">
                Campus Security <span className="text-cyber-400">CTF</span>
              </h1>
            </div>
            <p className="text-sm sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              A hacker has infiltrated campus security systems. Help investigate to identify the hacker, 
              determine stolen documents, and locate their hideout.
            </p>
            {user && (
              <div className="mt-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg max-w-sm sm:max-w-md mx-auto">
                <p className="text-cyan-300 text-sm sm:text-base">Welcome back, <span className="font-semibold">{user.name}</span>!</p>
                {isTeam && <p className="text-xs sm:text-sm text-gray-400">Team: {user.username}</p>}
              </div>
            )}
          </header>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {(isAdmin || isStaff) && (
              <Link href="/teams" className="group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-4 sm:p-6 hover:border-cyber-400 transition-all duration-300 hover:glow">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-cyber-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Team Management</h3>
                  <p className="text-sm sm:text-base text-gray-400">Register teams and manage participants</p>
                </div>
              </Link>
            )}

            <Link href="/challenges" className="group">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-hacker-600/30 rounded-lg p-4 sm:p-6 hover:border-hacker-400 transition-all duration-300 hover:glow">
                <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-hacker-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Challenge Rooms</h3>
                <p className="text-sm sm:text-base text-gray-400">Access security challenges and submit solutions</p>
              </div>
            </Link>

            <Link href="/resources" className="group">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-4 sm:p-6 hover:border-green-400 transition-all duration-300 hover:glow">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Resources Hub</h3>
                <p className="text-sm sm:text-base text-gray-400">Access guides, evidence files, and references</p>
              </div>
            </Link>

            <Link href="/leaderboard" className="group">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4 sm:p-6 hover:border-yellow-400 transition-all duration-300 hover:glow">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Leaderboard</h3>
                <p className="text-sm sm:text-base text-gray-400">View team rankings and progress</p>
              </div>
            </Link>

            {(isAdmin || isStaff) && (
              <Link href="/admin" className="group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-600/30 rounded-lg p-6 hover:border-purple-400 transition-all duration-300 hover:glow">
                  <Settings className="h-12 w-12 text-purple-400 mb-4 group-hover:animate-pulse" />
                  <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
                  <p className="text-gray-400">Staff access for managing the event</p>
                </div>
              </Link>
            )}

            {/* Hidden Terminal - Unlocked by Konami Code */}
            {konamiUnlocked && (
              <Link href="/terminal" className="group animate-bounce">
                <div className="bg-black/80 backdrop-blur-sm border border-green-400/50 rounded-lg p-6 hover:border-green-300 transition-all duration-300 hover:glow shadow-green-400/20 shadow-lg">
                  <Terminal className="h-12 w-12 text-green-400 mb-4 group-hover:animate-pulse" />
                  <h3 className="text-xl font-semibold text-green-400 mb-2">🎮 Secret Terminal</h3>
                  <p className="text-green-300">KONAMI CODE ACTIVATED! Hidden terminal access unlocked!</p>
                  <p className="text-xs text-green-500 mt-2">Find secret phrases for bonus points! 🕵️</p>
                </div>
              </Link>
            )}
          </div>

          {/* Event Information */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Challenge Rooms</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyber-400 mb-2">Security Awareness</h3>
                <p className="text-gray-300 text-sm">Security quiz and phishing email identification</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-hacker-400 mb-2">Password Security</h3>
                <p className="text-gray-300 text-sm">Identify weak passwords and security practices</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">OSINT Investigation</h3>
                <p className="text-gray-300 text-sm">Research the hacker using open source intelligence</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Cryptography Lab</h3>
                <p className="text-gray-300 text-sm">Decode encrypted messages and find clues</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 text-gray-400">
            <p>&copy; 2025 Campus Security CTF Event. Good luck, investigators!</p>
            {!konamiUnlocked && (
              <p className="text-xs mt-2 text-gray-500">
                💡 Hint: Classic gamers might know a special sequence of keys... ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️
              </p>
            )}
            {konamiUnlocked && (
              <p className="text-xs mt-2 text-green-400 animate-pulse">
                🎮 KONAMI CODE MASTER! The secret terminal awaits your investigation...
              </p>
            )}
          </footer>
        </div>
      </main>
    </>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
}
