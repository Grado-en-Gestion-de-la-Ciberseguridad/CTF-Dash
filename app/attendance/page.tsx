"use client"
import React from 'react'
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
  const [coords, setCoords] = React.useState<{ lat: number; lon: number; acc?: number } | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [result, setResult] = React.useState<{ status: 'accepted' | 'rejected'; distance?: number; message: string } | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
  if (!res.ok) throw new Error(data?.error || t('attendancePage.loading'))
        setEvents(data.events || [])
        if (data.events?.[0]?.id) setSelectedEvent(data.events[0].id)
      } catch (e: any) {
  setError(e.message || t('attendancePage.loading'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const requestLocation = React.useCallback(() => {
    setResult(null)
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy })
      },
      (err) => {
  setError(err.message || t('attendancePage.notCaptured'))
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }, [t])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setError(null)
    if (!selectedEvent) {
      setError(t('attendancePage.selectEvent'))
      return
    }
    if (!coords) {
      setError(t('attendancePage.captureLocation'))
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent,
          email,
          phone,
          attendeeId,
          latitude: coords.lat,
          longitude: coords.lon,
          accuracy: coords.acc
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to record attendance')
      setResult({ status: data.status, distance: data.distance, message: data.message })
    } catch (e: any) {
      setError(e.message || 'Failed to record attendance')
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
                    <input placeholder="you@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.phone')}</label>
                    <input placeholder="+1-555-0100" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-white">{t('attendancePage.attendeeId')}</label>
                    <input placeholder="U12345678" type="text" value={attendeeId} onChange={(e) => setAttendeeId(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600" />
                  </div>
                </div>

                <div className="border border-gray-600 rounded p-3 bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{t('attendancePage.yourLocation')}</div>
                      {coords ? (
                        <div className="text-sm text-gray-300">Lat {coords.lat.toFixed(6)}, Lon {coords.lon.toFixed(6)} {coords.acc ? `(±${Math.round(coords.acc)}m)` : ''}</div>
                      ) : (
                        <div className="text-sm text-gray-300">{t('attendancePage.notCaptured')}</div>
                      )}
                    </div>
                    <button type="button" onClick={requestLocation} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                      {t('attendancePage.captureLocation')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={submitting || !selectedEvent} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting…' : t('attendancePage.recordAttendance')}
                  </button>
                </div>
              </form>
            )}

            {result && (
              <div className={`mt-6 p-3 rounded ${result.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <div className="font-medium">{result.status === 'accepted' ? 'Attendance accepted' : 'Attendance recorded (outside area)'}</div>
                <div className="text-sm">{result.message}{result.distance != null ? ` — Distance: ${Math.round(result.distance)}m` : ''}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
