'use client'

import { useLocale } from '@/lib/i18n/context'

export default function FooterLocale() {
  const { locale, setLocale } = useLocale()

  return (
    <button
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        padding: '4px 10px',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        background: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'color 150ms, border-color 150ms',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
      }}
    >
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 2a15.3 15.3 0 010 16M10 2a15.3 15.3 0 000 16M2 10h16" strokeLinecap="round" />
      </svg>
      {locale === 'ko' ? '한국어' : 'English'}
    </button>
  )
}
