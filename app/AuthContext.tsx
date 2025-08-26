'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { User, LoginCredentials, AuthContextType } from './types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const keepAliveTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('ctf-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsInitialized(true)

    // Optional: start a periodic keep-alive to keep the tab/session warm
    // (No server session implemented; this can be a no-op or health ping)
    try {
      keepAliveTimer.current = setInterval(() => {
        fetch('/api/health').catch(() => {})
      }, 5 * 60 * 1000) // every 5 minutes
    } catch {}

    return () => {
      if (keepAliveTimer.current) clearInterval(keepAliveTimer.current)
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        localStorage.setItem('ctf-user', JSON.stringify(data.user))
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ctf-user')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isTeam: user?.role === 'team',
    isInitialized
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
