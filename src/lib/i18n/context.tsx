'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { dict, type Locale, type DictKey } from './dict'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'learnpath_locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: DictKey) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ko',
  setLocale: () => {},
  t: (key) => dict.ko[key],
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko')

  // 초기값: localStorage → 브라우저 언어 → 기본 'ko'
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'ko' || stored === 'en') {
      setLocaleState(stored)
      return
    }
    const browser = navigator.language.toLowerCase()
    if (browser.startsWith('en')) setLocaleState('en')
  }, [])

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)

    // 로그인 사용자: DB preference 저장 (fire-and-forget)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_locale: l })
          .eq('id', user.id)
      }
    } catch {
      // locale 저장 실패는 조용히 무시
    }
  }, [])

  const t = useCallback((key: DictKey): string => {
    return dict[locale][key] ?? dict.ko[key]
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
