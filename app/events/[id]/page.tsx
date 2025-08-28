"use client"
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LegacyEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const search = useSearchParams()
  useEffect(() => {
    const m = search?.get('mode') || 'register'
    router.replace(`/attendance?event=${encodeURIComponent(params.id)}&mode=${encodeURIComponent(m)}`)
  }, [router, search, params.id])
  return null
}
