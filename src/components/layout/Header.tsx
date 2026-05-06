'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/lib/i18n/context'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'
import type { User } from '@supabase/supabase-js'

function navStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    textDecoration: 'none',
    background: active ? 'var(--accent-light)' : 'transparent',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'color 150ms, background 150ms',
    display: 'inline-block',
  }
}

/* ── 연필(편집) 아이콘 ── */
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

/* ── 알림(벨) SVG 아이콘 ── */
function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLocale()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setUserMenuOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/explore') return pathname === '/explore' || pathname === '/'
    return pathname.startsWith(href)
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || '?'
  const initial = displayName[0].toUpperCase()
  const isLoggedIn = mounted && !!user

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          flexShrink: 0,
          marginRight: 6,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.55 }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.35 }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.75 }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
            LearnPath
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }} className="desktop-nav">
          <Link href="/explore" style={navStyle(isActive('/explore'))} className="nav-link">
            {t('nav_explore')} ▾
          </Link>
          <span style={{ ...navStyle(false), color: 'var(--text-tertiary)', opacity: 0.5, cursor: 'default' }}>
            {t('nav_roadmap')}
          </span>
          <span style={{ ...navStyle(false), color: 'var(--text-tertiary)', opacity: 0.5, cursor: 'default' }}>
            {t('nav_community')}
          </span>
        </nav>

        {/* ── Search (flex 영역) ── */}
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, margin: '0 10px', maxWidth: 440, minWidth: 0 }}
          className="header-search"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}
              width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M15 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('header_search_placeholder')}
              style={{
                width: '100%',
                padding: '7px 36px 7px 32px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                color: 'var(--text-primary)',
                transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
            <kbd style={{
              position: 'absolute', right: 8,
              fontSize: 10, color: 'var(--text-tertiary)',
              background: 'var(--border)', borderRadius: 3,
              padding: '1px 5px', fontFamily: 'inherit', letterSpacing: '0.2px',
            }}>⌘K</kbd>
          </div>
        </form>

        {/* ── Right Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 'auto' }}>

          {/* 언어 변경 — 항상 표시 */}
          <div className="locale-btn">
            <LocaleSwitcher />
          </div>

          {/* ════ 로그인 상태 ════ */}
          {isLoggedIn && (
            <>
              {/* 만들기 — desktop only, 아이콘+텍스트 아웃라인 */}
              <Link
                href="/create"
                className="create-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--accent)',
                  color: 'var(--accent)',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-light)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                <PencilIcon />
                {t('nav_create')}
              </Link>

              {/* 프로필 아바타 드롭다운 */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-label="프로필 메뉴"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 8px 4px 4px',
                    borderRadius: 999,
                    border: `1.5px solid ${userMenuOpen ? 'var(--accent)' : 'var(--border)'}`,
                    background: userMenuOpen ? 'var(--accent-light)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {/* Avatar circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    backgroundImage: user?.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}>
                    {!user?.user_metadata?.avatar_url && initial}
                  </div>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-tertiary)', transition: 'transform 150ms', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}>
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 232,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    zIndex: 200,
                  }}>
                    {/* 유저 정보 */}
                    <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--divider)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                          background: 'var(--accent)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700,
                          backgroundImage: user?.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : 'none',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                        }}>
                          {!user?.user_metadata?.avatar_url && initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>
                            {displayName}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 항목 */}
                    <div style={{ padding: '6px 0' }}>
                      {[
                        {
                          href: '/my-page',
                          label: t('nav_my_page'),
                          desc: t('menu_my_page_desc'),
                          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" strokeLinecap="round"/></svg>,
                        },
                        {
                          href: '/my-learning',
                          label: t('nav_my_learning'),
                          desc: t('menu_my_learning_desc'),
                          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6" strokeLinecap="round"/></svg>,
                        },
                        {
                          href: '/create',
                          label: t('nav_create'),
                          desc: t('menu_create_desc'),
                          icon: <PencilIcon />,
                        },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 16px',
                            textDecoration: 'none',
                            background: isActive(item.href) ? 'var(--accent-light)' : 'transparent',
                            transition: 'background 100ms',
                          }}
                          className="menu-item"
                        >
                          <span style={{ color: isActive(item.href) ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                            {item.icon}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: isActive(item.href) ? 700 : 500,
                              color: isActive(item.href) ? 'var(--accent)' : 'var(--text-primary)',
                              marginBottom: 1,
                            }}>
                              {item.label}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div style={{ height: 1, background: 'var(--divider)', margin: '0 0 4px' }} />

                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '9px 16px 12px',
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        textAlign: 'left', transition: 'background 100ms',
                        color: 'var(--text-secondary)',
                      }}
                      className="menu-item"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      <p style={{ fontSize: 13 }}>{t('menu_signout')}</p>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════ 비로그인 상태 ════ */}
          {!isLoggedIn && mounted && (
            <>
              <Link
                href="/auth"
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'border-color 150ms, color 150ms',
                }}
                className="login-btn"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'
                }}
              >
                {t('header_login')}
              </Link>
              <Link
                href="/auth"
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 150ms',
                }}
                className="start-btn"
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
              >
                시작하기 →
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* ─ 메뉴 아이템 hover ─ */
        .menu-item:hover { background: var(--surface) !important; }

        /* ─ Desktop: 768px 이하 ─ */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .header-search { display: none !important; }
          .create-btn { display: none !important; }
          .login-btn { display: none !important; }
        }

        /* ─ 좁은 데스크톱 (900px 이하): 만들기 텍스트 숨기고 아이콘만 ─ */
        @media (max-width: 900px) and (min-width: 769px) {
          .create-btn span { display: none; }
          .create-btn { padding: 7px 10px !important; }
        }

        /* ─ 매우 좁은 화면: locale 숨김 ─ */
        @media (max-width: 380px) {
          .locale-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
