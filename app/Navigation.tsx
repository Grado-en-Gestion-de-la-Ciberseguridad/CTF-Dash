'use client'

import Link from 'next/link'
import { useAuth } from './AuthContext'
import { Shield, LogOut, User } from 'lucide-react'
import CyberUFVLogo from './components/CyberUFVLogo'

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <nav className="bg-slate-800/90 backdrop-blur-sm border-b border-cyber-600/30 sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-2">
            <CyberUFVLogo size="sm" />
            <span className="text-lg sm:text-xl font-bold text-white hidden sm:block">CTF Dashboard</span>
            <span className="text-sm font-bold text-white sm:hidden">CTF</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-gray-300 truncate max-w-20 sm:max-w-none">{user?.name}</span>
              <span className="px-1 sm:px-2 py-1 bg-cyber-600/30 text-cyber-300 rounded text-xs capitalize hidden sm:inline">
                {user?.role}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
