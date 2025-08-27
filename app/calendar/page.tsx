"use client"
import React from 'react'
import Link from 'next/link'
import { useLang } from '../LanguageContext'
import Navigation from '../Navigation'
import { ArrowLeft, CalendarDays } from 'lucide-react'

type EventItem = {
  id: string
  name: string
  description?: string
  registration_start?: string
  registration_end?: string
  start_time?: string
  end_time?: string
  location_name?: string
}

export default function EventsCalendarPage() {
  const { t } = useLang()
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<string>('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [attendeeId, setAttendeeId] = React.useState('')
  const [result, setResult] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
  if (!res.ok) throw new Error(data?.error || t('calendar.loading'))
        setEvents(data.events || [])
      } catch (e: any) {
  setError(e.message || t('calendar.loading'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setError(null)
  if (!selectedEvent) return setError(t('calendar.selectedEvent'))
    setSubmitting(true)
    try {
      const res = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: selectedEvent, email, phone, attendeeId }) })
      const data = await res.json()
  if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to register')
  setResult(t('calendar.register'))
      setEmail(''); setPhone(''); setAttendeeId('')
    } catch (e: any) {
  setError(e.message || 'Failed to register')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          {/* Header (matches Team Management) */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/" className="mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
              <div className="flex items-center">
                <CalendarDays className="h-10 w-10 text-cyan-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">{t('calendar.title')}</h1>
              </div>
            </div>
            <Link href="/attendance" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              {t('calendar.goToCheckin')}
            </Link>
          </div>

          {/* Content card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6">
            <p className="text-sm text-gray-300 mb-6">{t('calendar.subtitle')}</p>

            {loading && <div className="text-gray-400">{t('calendar.loading')}</div>}
            {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>}

            {events.length > 0 && (
              <div className="space-y-3 mb-6">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-slate-700/50 border border-gray-600 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{ev.name}</div>
                        <div className="text-gray-300 text-sm">{ev.description}</div>
                        <div className="text-gray-400 text-xs mt-1">Reg: {ev.registration_start || 'n/a'} → {ev.registration_end || 'n/a'} | Event: {ev.start_time || 'n/a'} → {ev.end_time || 'n/a'}</div>
                      </div>
                      <button className="px-3 py-1 rounded bg-cyber-600 text-white" onClick={() => setSelectedEvent(ev.id)}>{t('calendar.select')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={onRegister} className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-white">{t('calendar.selectedEvent')}</label>
                <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600">
                  <option value="">{t('calendar.select')}</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input placeholder="you@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="p-2 rounded bg-slate-700 text-white border border-gray-600" />
                <input placeholder="+1-555-0100" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="p-2 rounded bg-slate-700 text-white border border-gray-600" />
                <input placeholder="U12345678" value={attendeeId} onChange={(e) => setAttendeeId(e.target.value)} required className="p-2 rounded bg-slate-700 text-white border border-gray-600" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={!selectedEvent || submitting} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">{submitting ? t('calendar.registering') : t('calendar.register')}</button>
                <Link href="/attendance" className="px-3 py-2 rounded bg-blue-700 text-white">{t('calendar.goToCheckin')}</Link>
              </div>
            </form>

            {result && <div className="mt-4 p-3 rounded bg-green-100 text-green-800">{result}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
