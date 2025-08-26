'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { useLang } from './LanguageContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: 'admin' | 'staff' | 'team'
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { t } = useLang()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(fallbackPath)
      return
    }

    if (requireRole && user?.role !== requireRole) {
      // If specific role required and user doesn't have it
      if (requireRole === 'admin' && user?.role !== 'admin') {
        router.push('/')
        return
      }
      if (requireRole === 'staff' && !['admin', 'staff'].includes(user?.role || '')) {
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, user, requireRole, router, fallbackPath])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-400 mx-auto mb-4"></div>
          <p>{t('protected.checkingAuth')}</p>
        </div>
      </div>
    )
  }

  if (requireRole && user?.role !== requireRole) {
    if (requireRole === 'staff' && !['admin', 'staff'].includes(user?.role || '')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid flex items-center justify-center">
          <div className="text-white text-center">
            <p>{t('protected.accessDeniedStaff')}</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
