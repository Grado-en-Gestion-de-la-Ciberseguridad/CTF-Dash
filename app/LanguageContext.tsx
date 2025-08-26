"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { defaultLocale, Locale, translations } from './i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (path: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function get(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('locale') as Locale | null) : null
    if (stored === 'en' || stored === 'es') {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem('locale', l)
    } catch {}
  }

  const t = useMemo(() => {
    return (path: string, params?: Record<string, string | number>) => {
      const dict = translations[locale]
      const value = get(dict, path)
      if (!value || typeof value !== 'string') return path
      if (!params) return value
      return Object.keys(params).reduce((acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key])), value)
    }
  }, [locale])

  const value: LanguageContextValue = { locale, setLocale, t }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
