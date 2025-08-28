"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../Navigation'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useLang } from '../LanguageContext'

type EventItem = {
  id: string
  name: string
  description?: string
  start_time?: string
  end_time?: string
  location_name?: string
  latitude?: number
  longitude?: number
  radius_meters?: number
}

export default function AttendancePage() {
  const { t } = useLang()
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<string>('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [attendeeId, setAttendeeId] = React.useState('')
  // Geolocation removed: no need to capture location for attendance
  const [coords, setCoords] = React.useState<{ lat: number; lon: number; acc?: number } | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [result, setResult] = React.useState<{ status: 'accepted' | 'rejected'; distance?: number; message: string } | null>(null)
  const [mode, setMode] = React.useState<'register' | 'checkin'>('register')
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
  if (!res.ok) throw new Error(data?.error || t('attendancePage.loading'))
        setEvents(data.events || [])
        // Preselect from URL ?event=ID, else first event
        const urlEvent = searchParams?.get('event') || ''
        const initial = urlEvent && (data.events || []).some((e: any) => e.id === urlEvent) ? urlEvent : (data.events?.[0]?.id || '')
        setSelectedEvent(initial)
      } catch (e: any) {
  setError(e.message || t('attendancePage.loading'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t, searchParams])

  React.useEffect(() => {
    // Preselect mode from URL ?mode=register|checkin
    const m = (searchParams?.get('mode') || '').toLowerCase()
    if (m === 'register' || m === 'checkin') setMode(m)
  }, [searchParams])

  // Geolocation disabled; keep stub to avoid breaking references
  const requestLocation = React.useCallback(() => {
    setResult(null)
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setError(null)
    if (!selectedEvent) {
      setError(t('attendancePage.selectEvent'))
      return
    }
    // Basic front-end validation for formats
    const emailValid = /.+@.+\..+/.test(email)
    const phoneValid = /^[+0-9 ()-]{7,20}$/.test(phone)
    const attendeeValid = /^[A-Za-z0-9_-]{3,32}$/.test(attendeeId)
    if (!emailValid) { setError('Please provide a valid email address (e.g., you@school.edu)'); return }
    if (!phoneValid) { setError('Please provide a valid phone number (digits, "+", spaces, dashes)'); return }
    if (!attendeeValid) { setError('Attendee ID must be 3-32 characters: letters, numbers, underscore, or dash'); return }
    try {
      setSubmitting(true)
      let res: Response
      if (mode === 'register') {
        res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: selectedEvent, email, phone, attendeeId })
        })
      } else {
        res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: selectedEvent, email, phone, attendeeId })
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || (mode === 'register' ? 'Registration failed' : 'Failed to record attendance'))
      if (mode === 'register') {
        setResult({ status: 'accepted', message: 'Registration submitted successfully' })
      } else {
        setResult({ status: data.status, distance: data.distance, message: data.message })
      }
    } catch (e: any) {
      setError(e.message || (mode === 'register' ? 'Registration failed' : 'Failed to record attendance'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          {/* Header (matches Team Management/Calendar) */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/" className="mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
              <div className="flex items-center">
                <CalendarDays className="h-10 w-10 text-cyan-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">{t('attendancePage.title')}</h1>
              </div>
            </div>
            <Link href="/calendar" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              {t('calendar.title')}
            </Link>
          </div>

          {/* Content card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6 max-w-3xl">
            <p className="text-sm text-gray-300 mb-6">{t('attendancePage.subtitle')}</p>

            {loading && <div className="text-gray-400">{t('attendancePage.loading')}</div>}
            {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>}
            {!loading && events.length === 0 && (
              <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">{t('attendancePage.noEvents')}</div>
            )}

            {events.length > 0 && (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Mode toggle */}
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setMode('register')} className={`px-3 py-1 rounded ${mode === 'register' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-200'}`}>Register</button>
                  <button type="button" onClick={() => setMode('checkin')} className={`px-3 py-1 rounded ${mode === 'checkin' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-200'}`}>Check-in</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.selectEvent')}</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} {ev.location_name ? `— ${ev.location_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.email')}</label>
                    <input placeholder="you@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" pattern=".+@.+\..+" title="Valid email address, e.g., you@school.edu" />
                    <p className="text-xs text-gray-400 mt-1">Expected: valid email address</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.phone')}</label>
                    <input placeholder="+1 555 0100" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" pattern="^[+0-9 ()-]{7,20}$" title="Digits, +, spaces, or dashes; 7-20 chars" />
                    <p className="text-xs text-gray-400 mt-1">Expected: digits with optional +, spaces, or dashes</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.attendeeId')}</label>
                    <input placeholder="U12345678" type="text" value={attendeeId} onChange={(e) => setAttendeeId(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" pattern="^[A-Za-z0-9_-]{3,32}$" title="3-32 chars: letters, numbers, underscore, dash" />
                    <p className="text-xs text-gray-400 mt-1">Expected: 3-32 chars (letters, numbers, _ or -)</p>
                  </div>
                </div>

                {/* Geolocation removed */}

                <div className="flex gap-3">
                  <button type="submit" disabled={submitting || !selectedEvent} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting…' : (mode === 'register' ? 'Register' : t('attendancePage.recordAttendance'))}
                  </button>
                </div>
              </form>
            )}

            {result && (
              <div className={`mt-6 p-3 rounded ${result.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <div className="font-medium">{mode === 'register' ? 'Registration' : 'Attendance'} {result.status === 'accepted' ? 'accepted' : 'recorded'}</div>
                <div className="text-sm">{result.message}{result.distance != null ? ` — Distance: ${Math.round(result.distance)}m` : ''}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
