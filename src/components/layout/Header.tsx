'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
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

  const initial = (user?.email?.[0] ?? '?').toUpperCase()
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
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          flexShrink: 0,
          marginRight: 8,
        }}>
          {/* 2×2 dot grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.55 }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.35 }} />
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: 0.75 }} />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: 17,
            color: 'var(--accent)',
            letterSpacing: '-0.5px',
          }}>
            LearnPath
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }} className="desktop-nav">
          <Link href="/explore" style={navStyle(isActive('/explore'))} className="nav-link">
            탐색 ▾
          </Link>
          {/* MVP placeholders — shown but non-functional */}
          <span style={{ ...navStyle(false), color: 'var(--text-tertiary)', opacity: 0.6, cursor: 'default' }}>
            학습 로드맵
          </span>
          <span style={{ ...navStyle(false), color: 'var(--text-tertiary)', opacity: 0.6, cursor: 'default' }}>
            커뮤니티
          </span>
          {isLoggedIn && (
            <Link href="/create" style={navStyle(isActive('/create'))} className="nav-link">
              만들기
            </Link>
          )}
        </nav>

        {/* ── Center Search ── */}
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, margin: '0 12px', maxWidth: 480 }}
          className="header-search"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg
              style={{ position: 'absolute', left: 12, flexShrink: 0, color: 'var(--text-tertiary)' }}
              width="15" height="15" viewBox="0 0 20 20" fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M15 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="배우고 싶은 주제를 검색해보세요"
              style={{
                width: '100%',
                padding: '8px 44px 8px 36px',
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
              position: 'absolute',
              right: 10,
              fontSize: 10,
              color: 'var(--text-tertiary)',
              background: 'var(--border)',
              borderRadius: 4,
              padding: '1px 6px',
              fontFamily: 'inherit',
              letterSpacing: '0.2px',
            }}>⌘K</kbd>
          </div>
        </form>

        {/* ── Right Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* 만들기 CTA */}
          <Link
            href={isLoggedIn ? '/create' : '/auth'}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: 'nowrap',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)' }}
          >
            만들기
          </Link>

          {isLoggedIn && (
            <>
              {/* Bell */}
              <button
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: 'var(--text-secondary)',
                  transition: 'border-color 150ms, background 150ms',
                }}
                title="알림"
              >
                🔔
              </button>

              {/* Avatar + Dropdown */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px 4px 4px',
                    borderRadius: 999,
                    border: `1px solid ${userMenuOpen ? 'var(--accent)' : 'var(--border)'}`,
                    background: userMenuOpen ? 'var(--accent-light)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>▾</span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    zIndex: 200,
                  }}>
                    {/* User info */}
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--divider)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                        {user?.email?.split('@')[0]}
                      </p>
                      <p style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user?.email}
                      </p>
                    </div>

                    {[
                      { href: '/my-page', label: '마이페이지', desc: '프로필 및 통계' },
                      { href: '/my-learning', label: '내 학습', desc: '진행 중·완료한 학습' },
                      { href: '/create', label: '만들기', desc: '새 커리큘럼 제작' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'block',
                          padding: '10px 16px',
                          textDecoration: 'none',
                          background: isActive(item.href) ? 'var(--accent-light)' : 'transparent',
                          transition: 'background 120ms',
                        }}
                        className="menu-item"
                      >
                        <p style={{
                          fontSize: 14, fontWeight: isActive(item.href) ? 600 : 500,
                          color: isActive(item.href) ? 'var(--accent)' : 'var(--text-primary)',
                          marginBottom: 1,
                        }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {item.desc}
                        </p>
                      </Link>
                    ))}

                    <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0' }} />

                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'block', width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: 'none', border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 120ms',
                      }}
                      className="menu-item"
                    >
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>로그아웃</p>
                    </button>

                    <div style={{ height: 4 }} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* 비로그인 상태 */}
          {!isLoggedIn && mounted && (
            <Link
              href="/auth"
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'border-color 150ms',
              }}
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .header-search { display: none !important; }
        }
      `}</style>
    </header>
  )
}
