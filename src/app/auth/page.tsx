'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MailIcon, BookOpenIcon, UserIcon, SearchIcon, PencilIcon, CheckIcon } from '@/components/ui/icons'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()
  const next = searchParams.get('next') ?? '/'

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)
    if (error) alert('오류가 발생했습니다: ' + error.message)
    else setSent(true)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <MailIcon size={52} style={{ color: 'var(--accent)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>이메일을 확인하세요</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '24px', fontSize: 14 }}>
          <strong>{email}</strong>으로 로그인 링크를 보냈어요.<br />
          링크를 클릭하면 자동으로 로그인됩니다.
        </p>
        <button onClick={() => setSent(false)} style={{
          marginTop: 20, background: 'none', border: 'none',
          color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        }}>
          다른 이메일로 시도하기
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {[1, 0.55, 0.35, 0.75].map((op, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', opacity: op }} />
            ))}
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)', letterSpacing: '-0.5px' }}>LearnPath</span>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>시작하기</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: '20px' }}>
          로그인하면 진도를 저장하고 커리큘럼을 만들 수 있어요
        </p>
      </div>

      {/* Google */}
      <button onClick={handleGoogle} style={{
        width: '100%', padding: '12px',
        borderRadius: 8, border: '1px solid var(--border)', background: '#fff',
        cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 16, transition: 'border-color 150ms, box-shadow 150ms',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#9ca3af'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Google로 계속하기
      </button>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        color: 'var(--text-tertiary)', fontSize: 12,
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        또는 이메일로
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소" required
          style={{
            padding: '12px 14px', borderRadius: 8,
            border: '1px solid var(--border)', fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 150ms',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button type="submit" disabled={loading || !email} style={{
          padding: '12px', borderRadius: 8, border: 'none',
          background: email ? 'var(--accent)' : 'var(--surface)',
          color: email ? '#fff' : 'var(--text-tertiary)',
          fontWeight: 700, fontSize: 14,
          cursor: loading || !email ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', transition: 'background 200ms',
        }}>
          {loading ? '전송 중...' : '로그인 링크 받기'}
        </button>
      </form>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--divider)', textAlign: 'center' }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          홈으로 돌아가기 →
        </Link>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 50%, #f0f0ff 100%)',
    }}>
      {/* Left panel: Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px 72px',
      }} className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[1, 0.55, 0.35, 0.75].map((op, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 4, background: 'var(--accent)', opacity: op }} />
            ))}
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--accent)', letterSpacing: '-0.5px' }}>LearnPath</span>
        </div>

        <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: '48px', letterSpacing: '-0.8px', marginBottom: 16, color: '#1e1b4b' }}>
          배움이<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            이어지는
          </span>
          <br />나만의 경로
        </h2>
        <p style={{ fontSize: 15, color: '#4c4a8a', lineHeight: '26px', marginBottom: 40 }}>
          양질의 커리큘럼을 발견하고,<br />
          나만의 학습 로드맵으로 성장하세요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: <BookOpenIcon size={16} />, text: '검증된 커리큘럼을 단계별로 학습' },
            { icon: <CheckIcon size={16} />, text: '진도 저장 & 언제든 이어보기' },
            { icon: <PencilIcon size={16} />, text: '나만의 커리큘럼 제작 & 공유' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(91,92,240,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 14, color: '#3730a3', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Form */}
      <div style={{
        width: 420, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        background: '#fff',
        borderLeft: '1px solid rgba(91,92,240,0.12)',
      }} className="auth-right">
        <div style={{ width: '100%', maxWidth: 340 }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>로딩 중...</div>}>
            <AuthForm />
          </Suspense>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; border-left: none !important; }
        }
      `}</style>
    </div>
  )
}
