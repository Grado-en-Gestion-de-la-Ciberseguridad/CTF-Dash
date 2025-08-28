'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Users, Trophy, Settings, FileText, Terminal, CalendarDays, Lock, Radar, Activity, Sparkles } from 'lucide-react'
import { useAuth } from './AuthContext'
import Navigation from './Navigation'
import CyberUFVLogo from './components/CyberUFVLogo'
import { useLang } from './LanguageContext'

function HomePage() {
  const { user, isAdmin, isStaff, isTeam, isAuthenticated } = useAuth()
  const { t } = useLang()
  const [konamiUnlocked, setKonamiUnlocked] = useState(false)
  const [konamiSequence, setKonamiSequence] = useState<string[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const defaultBanner = 'https://www.ufv.es/wp-content/themes/UFV-THEME/img/logo_UFV_positivo.svg'

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

  useEffect(() => {
    // Load public events to showcase on home
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok) {
          setUpcoming(data.events || [])
        }
      } catch {}
      setLoadingEvents(false)
    }
    load()
  }, [])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 cyber-grid">
        <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <header className="text-center mb-10 sm:mb-14">
            <div className="flex items-center justify-center mb-5 sm:mb-8">
              <CyberUFVLogo size="lg" className="sm:hidden" />
              <CyberUFVLogo size="xl" className="hidden sm:block mr-6" />
            </div>
            <div className="flex flex-col items-center justify-center mb-3">
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-cyber-400 mb-3 pulse-glow" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {t('home.title')}
              </h1>
            </div>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              {t('home.subtitle')}
            </p>
            {/* CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/events" className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-900/30 transition">
                Ver eventos
              </Link>
              <Link href="/attendance" className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-lg shadow-emerald-900/30 transition">
                Ir al check-in
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-100 border border-slate-600/50 transition">
                  Iniciar sesión
                </Link>
              )}
              {(isAdmin || isStaff) && (
                <Link href="/admin" className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30 transition">
                  Panel de administración
                </Link>
              )}
              {isTeam && (
                <Link href="/challenges" className="px-4 py-2.5 rounded-lg bg-hacker-600 hover:bg-hacker-500 text-white border border-hacker-400/30 transition">
                  Ir a retos
                </Link>
              )}
            </div>
            {user && (
              <div className="mt-5 p-4 bg-slate-800/50 rounded-lg max-w-sm sm:max-w-md mx-auto border border-slate-700/60">
                <p className="text-cyan-300 text-sm sm:text-base">{t('home.welcomeBack', { name: user.name })}</p>
                {isTeam && <p className="text-xs sm:text-sm text-gray-400">{t('home.teamLabel', { team: user.username })}</p>}
              </div>
            )}
          </header>

          {/* Quick navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 items-stretch">
            {(isAdmin || isStaff) && (
              <Link href="/teams" className="group">
                <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-4 sm:p-6 hover:border-cyber-400 transition-all duration-300 hover:glow flex flex-col">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-cyber-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.team.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-400">{t('cards.team.desc')}</p>
                </div>
              </Link>
            )}

            <Link href="/challenges" className="group">
              <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-hacker-600/30 rounded-lg p-4 sm:p-6 hover:border-hacker-400 transition-all duration-300 hover:glow flex flex-col">
                <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-hacker-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.challenges.title')}</h3>
                <p className="text-sm sm:text-base text-gray-400">{t('cards.challenges.desc')}</p>
              </div>
            </Link>

            <Link href="/resources" className="group">
              <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-green-600/30 rounded-lg p-4 sm:p-6 hover:border-green-400 transition-all duration-300 hover:glow flex flex-col">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.resources.title')}</h3>
                <p className="text-sm sm:text-base text-gray-400">{t('cards.resources.desc')}</p>
              </div>
            </Link>

            <Link href="/events" className="group">
              <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-cyan-600/30 rounded-lg p-4 sm:p-6 hover:border-cyan-400 transition-all duration-300 hover:glow flex flex-col">
                <CalendarDays className="h-8 w-8 sm:h-12 sm:w-12 text-cyan-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.events.title')}</h3>
                <p className="text-sm sm:text-base text-gray-400">{t('cards.events.desc')}</p>
              </div>
            </Link>

            <Link href="/leaderboard" className="group">
              <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4 sm:p-6 hover:border-yellow-400 transition-all duration-300 hover:glow flex flex-col">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.leaderboard.title')}</h3>
                <p className="text-sm sm:text-base text-gray-400">{t('cards.leaderboard.desc')}</p>
              </div>
            </Link>

            {(isAdmin || isStaff) && (
              <Link href="/admin" className="group">
                <div className="h-full min-h-48 bg-slate-800/50 backdrop-blur-sm border border-purple-600/30 rounded-lg p-4 sm:p-6 hover:border-purple-400 transition-all duration-300 hover:glow flex flex-col">
                  <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('cards.admin.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-400">{t('cards.admin.desc')}</p>
                </div>
              </Link>
            )}

            {/* Hidden Terminal - Unlocked by Konami Code */}
            {konamiUnlocked && (
              <Link href="/terminal" className="group animate-bounce">
                <div className="h-full min-h-48 bg-black/80 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 sm:p-6 hover:border-green-300 transition-all duration-300 hover:glow shadow-green-400/20 shadow-lg flex flex-col">
                  <Terminal className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mb-3 sm:mb-4 group-hover:animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">{t('cards.secret.title')}</h3>
                  <p className="text-sm sm:text-base text-green-300">{t('cards.secret.desc1')}</p>
                  <p className="text-xs text-green-500 mt-2">{t('cards.secret.desc2')}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Features */}
          <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-lg p-6 sm:p-8 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Características destacadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <Activity className="h-8 w-8 text-cyan-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Progreso en tiempo real</h3>
                <p className="text-gray-300 text-sm">Clasificación instantánea y seguimiento de puntos por equipo.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <Sparkles className="h-8 w-8 text-emerald-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Salas de retos</h3>
                <p className="text-gray-300 text-sm">Concienciación, contraseñas, OSINT y criptografía.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <Users className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Gestión de equipos</h3>
                <p className="text-gray-300 text-sm">Registro sencillo y administración centralizada.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <Settings className="h-8 w-8 text-yellow-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Panel administrativo</h3>
                <p className="text-gray-300 text-sm">Herramientas para personal y administración del evento.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <Lock className="h-8 w-8 text-red-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Datos cifrados</h3>
                <p className="text-gray-300 text-sm">Registro y asistencia con PII protegida y exportaciones seguras.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <CalendarDays className="h-8 w-8 text-cyan-300 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Calendario de eventos</h3>
                <p className="text-gray-300 text-sm">Inscripción y check-in en un solo lugar.</p>
              </div>
            </div>
          </section>

          {/* Event Information */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{t('events.header')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyber-400 mb-2">{t('events.security.title')}</h3>
                <p className="text-gray-300 text-sm">{t('events.security.desc')}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-hacker-400 mb-2">{t('events.password.title')}</h3>
                <p className="text-gray-300 text-sm">{t('events.password.desc')}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">{t('events.osint.title')}</h3>
                <p className="text-gray-300 text-sm">{t('events.osint.desc')}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">{t('events.crypto.title')}</h3>
                <p className="text-gray-300 text-sm">{t('events.crypto.desc')}</p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-cyan-400" /> {t('homeEvents.title')}</h3>
              {loadingEvents ? (
                <div className="text-sm text-gray-400">{t('calendar.loading')}</div>
              ) : upcoming.length === 0 ? (
                <div className="text-sm text-gray-400">{t('homeEvents.noEvents')}</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcoming.slice(0, 6).map((ev: any) => (
                    <div key={ev.id} className="bg-slate-800/60 rounded overflow-hidden border border-slate-700">
                      {(ev.banner_url || defaultBanner) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ev.banner_url || defaultBanner} alt={ev.name} className="w-full h-28 object-cover bg-slate-900" />
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-white">{ev.name}</div>
                            {ev.speaker_name && <div className="text-xs text-cyan-300">Ponente: {ev.speaker_name}</div>}
                            {ev.description && <div className="text-xs text-gray-400 mt-1">{ev.description}</div>}
                            <div className="text-xs text-gray-500 mt-1">{t('homeEvents.reg')}: {ev.registration_start || 'n/a'} → {ev.registration_end || 'n/a'}</div>
                            <div className="text-xs text-gray-500">{t('homeEvents.event')}: {ev.start_time || 'n/a'} → {ev.end_time || 'n/a'}</div>
                          </div>
                          <a className="text-cyan-300 text-xs underline" href={`/events/${encodeURIComponent(ev.id)}`} target="_blank" rel="noreferrer">{t('homeEvents.openPage')}</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Link href="/calendar" className="px-3 py-2 rounded bg-cyan-700/40 text-cyan-200 border border-cyan-600/40">{t('homeEvents.viewCalendar')}</Link>
                <Link href="/attendance" className="px-3 py-2 rounded bg-emerald-700/40 text-emerald-200 border border-emerald-600/40">{t('homeEvents.goToCheckin')}</Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 text-gray-400">
            <p>{t('footer.copyright')}</p>
            {!konamiUnlocked && (
              <p className="text-xs mt-2 text-gray-500">💡 {t('footer.hint')}</p>
            )}
            {konamiUnlocked && (
              <p className="text-xs mt-2 text-green-400 animate-pulse">{t('footer.mastered')}</p>
            )}
          </footer>
        </div>
      </main>
    </>
  )
}

export default function Home() {
  return <HomePage />
}
