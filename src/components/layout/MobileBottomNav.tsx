'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke={active ? 'var(--accent)' : '#9ca3af'}
          strokeWidth="1.8"
          fill={active ? 'var(--accent-light)' : 'none'}
        />
        <path d="M9 21V12h6v9" stroke={active ? 'var(--accent)' : '#9ca3af'} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: '탐색',

    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? 'var(--accent)' : '#9ca3af'} strokeWidth="1.8" />
        <path
          d="M16.5 7.5l-3 6.5-6.5 3 3-6.5 6.5-3z"
          stroke={active ? 'var(--accent)' : '#9ca3af'}
          strokeWidth="1.8"
          fill={active ? 'var(--accent)' : 'none'}
          fillOpacity={active ? 0.2 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/create',
    label: '만들기',
    isFab: true,
    icon: (_active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/my-learning',
    label: '내 학습',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="4" width="18" height="16" rx="2"
          stroke={active ? 'var(--accent)' : '#9ca3af'}
          strokeWidth="1.8"
          fill={active ? 'var(--accent-light)' : 'none'}
        />
        <path d="M7 9h10M7 13h6" stroke={active ? 'var(--accent)' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/my-page',
    label: '마이페이지',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          stroke={active ? 'var(--accent)' : '#9ca3af'}
          strokeWidth="1.8"
          fill={active ? 'var(--accent-light)' : 'none'}
        />
        <path
          d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
          stroke={active ? 'var(--accent)' : '#9ca3af'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    // /explore도 / 기반이므로 별도 처리
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: '#fff',
        borderTop: '1px solid var(--border)',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 64,
        padding: '0 4px',
        gap: 0,
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = isActive(item.href)

        if (item.isFab) {
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 999,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -20,
                boxShadow: '0 4px 16px rgba(91, 92, 240, 0.45)',
              }}>
                {item.icon(false)}
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flex: 1,
              padding: '6px 4px',
              textDecoration: 'none',
            }}
          >
            {item.icon(active)}
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              color: active ? 'var(--accent)' : '#9ca3af',
              lineHeight: 1,
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
