"use client"
import React from 'react'
import { useLang } from '../../LanguageContext'

type EventDetails = {
  event: {
    id: string
    name: string
    description?: string
    registration_start?: string
    registration_end?: string
    start_time?: string
    end_time?: string
    location_name?: string
  }
  locations: Array<{ id: number, name?: string, latitude: number, longitude: number, radius_meters: number }>
}

export default function EventPage({ params }: { params: { id: string } }) {
  const { t } = useLang()
  const { id } = params
  const [details, setDetails] = React.useState<EventDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [attendeeId, setAttendeeId] = React.useState('')
  const [coords, setCoords] = React.useState<{ lat: number; lon: number; acc?: number } | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(id)}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || t('eventPage.loading'))
        setDetails(data)
      } catch (e: any) {
        setError(e.message || t('eventPage.loading'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const now = new Date()
  const inRange = (a?: string, b?: string) => {
    const start = a ? new Date(a) : undefined
    const end = b ? new Date(b) : undefined
    if (start && now < start) return -1
    if (end && now > end) return 1
    return 0
  }

  const getState = () => {
    if (!details) return 'loading'
    const reg = inRange(details.event.registration_start, details.event.registration_end)
    const evt = inRange(details.event.start_time, details.event.end_time)
    if (evt === 0) return 'checkin'
    if (evt === 1) return 'finished'
    if (reg === 0) return 'register'
    return 'upcoming'
  }

  const captureLocation = () => {
    setMsg(null)
  if (!navigator.geolocation) { setMsg('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy }),
  (err) => setMsg(err.message || t('attendancePage.notCaptured')),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }

  const onRegister = async () => {
    setMsg(null)
    try {
      const res = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: id, email, phone, attendeeId }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Registration failed')
      setMsg(t('calendar.register'))
    } catch (e: any) {
      setMsg(e.message || 'Registration failed')
    }
  }

  const onCheckIn = async () => {
    setMsg(null)
  if (!coords) { setMsg(t('attendancePage.captureLocation')); return }
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: id, email, phone, attendeeId, latitude: coords.lat, longitude: coords.lon, accuracy: coords.acc }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Check-in failed')
      setMsg(data.message || t('eventPage.checkin'))
    } catch (e: any) {
      setMsg(e.message || 'Check-in failed')
    }
  }

  if (loading) return <div className="p-4">{t('eventPage.loading')}</div>
  if (error) return <div className="p-4 text-red-400">{error}</div>
  if (!details) return <div className="p-4">Event not found</div>

  const state = getState()

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-1">{details.event.name}</h1>
      {details.event.description && <p className="text-gray-400 mb-4">{details.event.description}</p>}
      {details.locations?.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">{t('eventPage.geofences')}: {details.locations.map(l => `${l.name || 'Location'} (${l.radius_meters}m)`).join(', ')}</div>
      )}

      {state === 'upcoming' && (
        <div className="p-3 rounded bg-yellow-100 text-yellow-800">{t('eventPage.registrationNotOpen')}</div>
      )}

      {state === 'register' && (
        <div className="space-y-3">
          <div className="p-3 rounded bg-blue-100 text-blue-800">{t('eventPage.registrationOpen')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder={t('attendancePage.email')} className="p-2 rounded bg-slate-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder={t('attendancePage.phone')} className="p-2 rounded bg-slate-700 text-white" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder={t('attendancePage.attendeeId')} className="p-2 rounded bg-slate-700 text-white" value={attendeeId} onChange={(e) => setAttendeeId(e.target.value)} />
          </div>
          <button onClick={onRegister} className="px-3 py-2 rounded bg-cyber-600 text-white">{t('eventPage.register')}</button>
        </div>
      )}

      {state === 'checkin' && (
        <div className="space-y-3">
          <div className="p-3 rounded bg-green-100 text-green-800">{t('eventPage.eventInProgress')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder={t('attendancePage.email')} className="p-2 rounded bg-slate-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder={t('attendancePage.phone')} className="p-2 rounded bg-slate-700 text-white" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder={t('attendancePage.attendeeId')} className="p-2 rounded bg-slate-700 text-white" value={attendeeId} onChange={(e) => setAttendeeId(e.target.value)} />
          </div>
          <div className="flex items-center justify-between border rounded p-3">
            <div className="text-sm text-gray-400">{coords ? `Lat ${coords.lat.toFixed(6)}, Lon ${coords.lon.toFixed(6)} ${coords.acc ? `(±${Math.round(coords.acc)}m)` : ''}` : t('attendancePage.notCaptured')}</div>
            <button onClick={captureLocation} className="px-3 py-2 rounded bg-blue-700 text-white">{t('eventPage.captureLocation')}</button>
          </div>
          <button onClick={onCheckIn} className="px-3 py-2 rounded bg-green-700 text-white">{t('eventPage.checkin')}</button>
        </div>
      )}

      {state === 'finished' && (
        <div className="p-3 rounded bg-gray-800 text-gray-200">{t('eventPage.eventEnded')}</div>
      )}

      {msg && <div className="mt-4 p-3 rounded bg-white/10 text-white">{msg}</div>}
    </div>
  )
}
