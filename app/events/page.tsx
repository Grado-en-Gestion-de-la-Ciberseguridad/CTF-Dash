'use client'

import React from 'react'
import Link from 'next/link'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import Navigation from '../Navigation'
import ProtectedRoute from '../ProtectedRoute'
import { useLang } from '../LanguageContext'
import { useAuth } from '../AuthContext'

type EventItem = {
  id: string
  name: string
  description?: string
  registration_start?: string
  registration_end?: string
  start_time?: string
  end_time?: string
}

function EventsPageContent() {
  const { t } = useLang()
  const { isAdmin, isStaff } = useAuth()
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<string>('')
  const [regList, setRegList] = React.useState<any[]>([])
  const [attList, setAttList] = React.useState<any[]>([])
  const sel = events.find(e => e.id === selectedEvent)

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || t('calendar.loading'))
        setEvents(data.events || [])
        if (data.events?.[0]?.id) setSelectedEvent(data.events[0].id)
      } catch (e: any) {
        setError(e.message || t('calendar.loading'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const refreshAdminLists = React.useCallback(async (eventId?: string) => {
    if (!isAdmin) return
    const id = eventId || selectedEvent
    if (!id) return
    try {
      const [regsRes, attRes] = await Promise.all([
        fetch(`/api/admin/attendance?type=registrations&eventId=${encodeURIComponent(id)}`, { headers: { 'x-ctf-role': 'admin' } }),
        fetch(`/api/admin/attendance?eventId=${encodeURIComponent(id)}`, { headers: { 'x-ctf-role': 'admin' } })
      ])
      const regs = await regsRes.json()
      const atts = await attRes.json()
      setRegList(regs.registrations || [])
      setAttList(atts.attendance || [])
    } catch {}
  }, [isAdmin, selectedEvent])

  React.useEffect(() => {
    if (isAdmin && selectedEvent) refreshAdminLists(selectedEvent)
  }, [isAdmin, selectedEvent, refreshAdminLists])

  const downloadCSV = (eventId: string) => {
    const url = `/api/attendance/export?eventId=${encodeURIComponent(eventId)}`
    fetch(url, { headers: { 'x-ctf-role': 'admin' } }).then(async res => {
      if (!res.ok) { alert('Export failed'); return }
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `attendance-${eventId}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          {/* Header - match Team Management styling */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/" className="mr-4 p-2 rounded-lg border border-cyber-600/30 hover:border-cyber-400 transition-colors">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
              <div className="flex items-center">
                <CalendarDays className="h-10 w-10 text-cyan-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">{t('admin.tabs.events')}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/calendar" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors">{t('homeEvents.viewCalendar')}</Link>
              <Link href="/attendance" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors">{t('homeEvents.goToCheckin')}</Link>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Event selector and details */}
            <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-cyber-600/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{t('calendar.selectedEvent')}</h2>
              {loading && <div className="text-gray-400">{t('calendar.loading')}</div>}
              {error && <div className="mb-3 p-3 rounded bg-red-100 text-red-800">{error}</div>}
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="w-full p-3 rounded bg-slate-700 text-white mb-4">
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
              {sel ? (
                <div className="space-y-2 text-sm">
                  <div className="text-white font-medium">{sel.name}</div>
                  {sel.description && <div className="text-gray-300">{sel.description}</div>}
                  <div className="text-gray-400">{t('homeEvents.reg')}: {sel.registration_start || 'n/a'} → {sel.registration_end || 'n/a'}</div>
                  <div className="text-gray-400">{t('homeEvents.event')}: {sel.start_time || 'n/a'} → {sel.end_time || 'n/a'}</div>
                  <div className="pt-2 flex gap-2">
                    <a href={`/events/${encodeURIComponent(sel.id)}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-indigo-600 text-white">{t('homeEvents.openPage')}</a>
                    {isAdmin && (
                      <button onClick={() => downloadCSV(sel.id)} className="px-3 py-2 rounded bg-green-700 text-white">{t('admin.events.exportCsv')}</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">{t('homeEvents.noEvents')}</div>
              )}
            </div>

            {/* Right: Admin lists */}
            <div className="lg:col-span-2 space-y-6">
              {(isAdmin || isStaff) ? (
                <>
                  {/* Create/Publish event */}
                  <CreateEventCard onCreated={(id) => { setSelectedEvent(id); refreshAdminLists(id); }} />

                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{t('admin.events.registrations')}</h3>
                      <button onClick={() => refreshAdminLists()} className="text-sm text-cyan-300 underline">{t('admin.events.refresh')}</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {regList.map((r) => (
                        <div key={r.id} className="bg-slate-700/50 rounded p-2 text-sm text-white">
                          <div className="flex justify-between"><span>{r.event_name}</span><span className="text-gray-400">{r.created_at}</span></div>
                          <div className="text-gray-300">{r.email} • {r.phone} • {r.attendee_id}</div>
                        </div>
                      ))}
                      {regList.length === 0 && <div className="text-gray-400">{t('attendancePage.noEvents')}</div>}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{t('admin.events.attendance')}</h3>
                      <button onClick={() => refreshAdminLists()} className="text-sm text-cyan-300 underline">{t('admin.events.refresh')}</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {attList.map((a) => (
                        <div key={a.id} className="bg-slate-700/50 rounded p-2 text-sm text-white">
                          <div className="flex justify-between"><span>{a.event_name}</span><span className="text-gray-400">{a.created_at}</span></div>
                          <div className="text-gray-300">{a.email} • {a.phone} • {a.attendee_id}</div>
                          <div className="text-gray-400">{a.status}{a.distance_meters != null ? ` • ${Math.round(a.distance_meters)}m` : ''}{a.reason ? ` • ${a.reason}` : ''}</div>
                        </div>
                      ))}
                      {attList.length === 0 && <div className="text-gray-400">{t('attendancePage.noEvents')}</div>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-6 text-gray-300">
                  <p>{t('calendar.subtitle')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsPageContent />
    </ProtectedRoute>
  )
}

function CreateEventCard({ onCreated }: { onCreated: (id: string) => void }) {
  const { t } = useLang()
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [registration_start, setRegStart] = React.useState('')
  const [registration_end, setRegEnd] = React.useState('')
  const [start_time, setStart] = React.useState('')
  const [end_time, setEnd] = React.useState('')
  const [locName, setLocName] = React.useState('')
  const [latitude, setLat] = React.useState<string>('')
  const [longitude, setLon] = React.useState<string>('')
  const [radius, setRadius] = React.useState<string>('150')
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)

  const captureMyLocation = () => {
    setMsg(null)
    if (!navigator.geolocation) { setMsg('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(String(pos.coords.latitude)); setLon(String(pos.coords.longitude)) },
      (err) => setMsg(err.message || 'Failed to get location'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }

  const publish = async () => {
    setMsg(null)
    if (!name) { setMsg('Name required'); return }
    setBusy(true)
    try {
      // 1) Create/Upsert event (no id)
      const payload: any = {
        action: 'upsertEvent',
        name,
        description,
        registration_start: registration_start || null,
        registration_end: registration_end || null,
        start_time: start_time || null,
        end_time: end_time || null,
        location_name: locName || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        radius_meters: radius ? Number(radius) : null,
        is_active: 1
      }
      const res = await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ctf-role': 'staff' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save event')
      const eventId = data.id
      // 2) If separate geofence provided (lat/lon/radius), also add explicit location row
      if (latitude && longitude && radius) {
        const res2 = await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ctf-role': 'staff' }, body: JSON.stringify({ action: 'addLocation', eventId, name: locName || undefined, latitude: Number(latitude), longitude: Number(longitude), radius_meters: Number(radius) }) })
        if (!res2.ok) {
          const d2 = await res2.json().catch(() => ({}))
          throw new Error(d2?.error || 'Failed to add location')
        }
      }
      setMsg('Event published')
      onCreated(eventId)
      // reset
      setName(''); setDescription(''); setRegStart(''); setRegEnd(''); setStart(''); setEnd(''); setLocName(''); setLat(''); setLon(''); setRadius('150')
    } catch (e: any) {
      setMsg(e.message || 'Failed to publish')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">{t('admin.events.createUpdate')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.registration_start')} value={registration_start} onChange={(e) => setRegStart(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.registration_end')} value={registration_end} onChange={(e) => setRegEnd(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.start_time')} value={start_time} onChange={(e) => setStart(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.end_time')} value={end_time} onChange={(e) => setEnd(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.location_name')} value={locName} onChange={(e) => setLocName(e.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.latitude')} value={latitude} onChange={(e) => setLat(e.target.value)} />
          <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.longitude')} value={longitude} onChange={(e) => setLon(e.target.value)} />
          <input className="p-2 rounded bg-slate-700 text-white" placeholder={t('admin.events.field.radius_meters')} value={radius} onChange={(e) => setRadius(e.target.value)} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={publish} className="bg-cyber-600 hover:bg-cyber-700 disabled:bg-slate-600 text-white px-4 py-2 rounded">{t('admin.events.save')}</button>
        <button type="button" onClick={captureMyLocation} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">{t('eventPage.captureLocation')}</button>
      </div>
      {msg && <div className="mt-2 text-sm text-gray-300">{msg}</div>}
    </div>
  )
}
