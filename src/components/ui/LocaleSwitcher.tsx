'use client'

import { useRef, useState, useEffect } from 'react'
import { useLocale } from '@/lib/i18n/context'

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options: { value: 'ko' | 'en'; label: string }[] = [
    { value: 'ko', label: t('locale_ko') },
    { value: 'en', label: t('locale_en') },
  ]

  const current = options.find(o => o.value === locale)

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={t('locale_label')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: open ? 'var(--accent-light)' : 'transparent',
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          transition: 'all 150ms',
          letterSpacing: '0.2px',
        }}
        onMouseEnter={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          }
        }}
      >
        {/* Globe icon */}
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 2a15.3 15.3 0 010 16M10 2a15.3 15.3 0 000 16M2 10h16" strokeLinecap="round" />
        </svg>
        <span>{current?.label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          minWidth: 130,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          zIndex: 300,
        }}>
          <div style={{
            padding: '8px 12px 6px',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {t('locale_label')}
          </div>
          {options.map(opt => {
            const active = opt.value === locale
            return (
              <button
                key={opt.value}
                onClick={() => { setLocale(opt.value); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: active ? 700 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l2.5 2.5L10 3.5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {!active && <span style={{ width: 12, display: 'inline-block' }} />}
                {opt.label}
              </button>
            )
          })}
          <div style={{ height: 4 }} />
        </div>
      )}
    </div>
  )
}
