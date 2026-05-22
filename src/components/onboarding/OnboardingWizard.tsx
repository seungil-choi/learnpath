'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics/track'
import { AiIcon, CodeIcon, DesignIcon, BusinessIcon, ProductivityIcon, MarketingIcon, UserIcon, MapIcon, RocketIcon, BookOpenIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'

/* ─── 상수 ─── */
const CATEGORIES = [
  { key: 'ai',           label: 'AI · 자동화', Icon: AiIcon },
  { key: 'programming',  label: '프로그래밍',   Icon: CodeIcon },
  { key: 'design',       label: '디자인',       Icon: DesignIcon },
  { key: 'business',     label: '비즈니스',     Icon: BusinessIcon },
  { key: 'productivity', label: '생산성',       Icon: ProductivityIcon },
  { key: 'marketing',    label: '디지털마케팅', Icon: MarketingIcon },
]

const LEVEL_LABEL: Record<string, string> = { beginner: '초급', intermediate: '중급', advanced: '고급' }

/* ─── 타입 ─── */
interface Curriculum {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  level: string
  estimated_duration: number
  enrollment_count: number
  avg_rating: number
  category: string | null
  slug: string | null
}

interface Props {
  userId: string
  userEmail: string
  initialDisplayName: string
  initialCategories: string[]
  allCurricula: Curriculum[]
  nextUrl: string
}

/* ─── 스타일 상수 ─── */
const accent = 'var(--accent)'
const surface = 'var(--surface)'

export default function OnboardingWizard({
  userId, userEmail, initialDisplayName, initialCategories, allCurricula, nextUrl
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0) // 0: name, 1: category, 2: recommend
  const [name, setName] = useState(initialDisplayName || userEmail.split('@')[0])
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [saving, setSaving] = useState(false)

  /* ─── 카테고리 선택 토글 (최대 3개) ─── */
  const toggleCategory = (key: string) => {
    setCategories(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : prev.length < 3 ? [...prev, key] : prev
    )
  }

  /* ─── 추천 커리큘럼 계산 ─── */
  const recommended = (() => {
    if (categories.length > 0) {
      const filtered = allCurricula.filter(c =>
        categories.some(cat => c.category?.toLowerCase().includes(CATEGORIES.find(x => x.key === cat)?.label ?? '') || c.category?.includes(CATEGORIES.find(x => x.key === cat)?.label ?? ''))
      )
      if (filtered.length >= 3) return filtered.slice(0, 3)
    }
    return allCurricula.slice(0, 3)
  })()

  /* ─── 온보딩 완료 저장 ─── */
  const complete = async (skipToHome = false) => {
    setSaving(true)
    try {
      await supabase.from('profiles').update({
        display_name: name.trim() || null,
        interest_category_keys: categories,
        onboarded_at: new Date().toISOString(),
      }).eq('id', userId)

      track('interest_categories_selected', { categories: categories.join(','), count: categories.length })
      router.push(skipToHome ? '/' : nextUrl)
    } catch {
      router.push('/')
    } finally {
      setSaving(false)
    }
  }

  const formatDuration = (min: number) =>
    min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간${min % 60 > 0 ? ` ${min % 60}분` : ''}`

  /* ════════ STEP 0: 이름 설정 ════════ */
  if (step === 0) return (
    <div style={pageStyle}>
      <StepIndicator current={0} />
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <UserIcon size={52} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
            어떻게 불러드리면 좋을까요?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px' }}>
            프로필과 학습 기록에 사용됩니다. 나중에 언제든 변경할 수 있어요.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름 또는 닉네임"
            maxLength={30}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') setStep(1) }}
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: 12, border: '1.5px solid var(--border)',
              fontSize: 16, fontFamily: 'inherit', outline: 'none',
              background: '#fff', color: 'var(--text-primary)',
              transition: 'border-color 150ms', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = accent }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'right' }}>{name.length}/30</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => setStep(1)}
            style={primaryBtn}
          >
            다음 →
          </button>
          <button
            onClick={() => setStep(1)}
            style={ghostBtn}
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  )

  /* ════════ STEP 1: 카테고리 선택 ════════ */
  if (step === 1) return (
    <div style={pageStyle}>
      <StepIndicator current={1} />
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <MapIcon size={52} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
            관심 있는 주제를 골라주세요
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px' }}>
            지금 바로 시작할 만한 Path를 추천해드릴게요 (최대 3개)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {CATEGORIES.map(cat => {
            const selected = categories.includes(cat.key)
            const disabled = !selected && categories.length >= 3
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                disabled={disabled}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, padding: '16px 8px',
                  borderRadius: 12,
                  border: `2px solid ${selected ? accent : 'var(--border)'}`,
                  background: selected ? 'var(--accent-light)' : '#fff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  transition: 'all 150ms',
                  fontFamily: 'inherit',
                }}
              >
                <cat.Icon size={28} style={{ color: selected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                <span style={{
                  fontSize: 12, fontWeight: selected ? 700 : 500,
                  color: selected ? accent : 'var(--text-secondary)',
                  lineHeight: '16px', textAlign: 'center',
                }}>
                  {cat.label}
                </span>
                {selected && (
                  <div style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2 2L8.5 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {categories.length > 0 && (
          <p style={{ fontSize: 12, color: accent, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
            {categories.length}개 선택됨
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setStep(2)} style={primaryBtn}>
            {categories.length > 0 ? '추천 Path 보기 →' : '추천 Path 보기 →'}
          </button>
          <button onClick={() => setStep(2)} style={ghostBtn}>
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  )

  /* ════════ STEP 2: 추천 커리큘럼 ════════ */
  return (
    <div style={pageStyle}>
      <StepIndicator current={2} />
      <div style={{ ...cardStyle, maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <RocketIcon size={52} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
            {name.trim() ? `${name.trim()}, 지금 바로 시작할 수 있는 Path` : '지금 바로 시작할 수 있는 Path'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px' }}>
            짧고 분명한 입문용 Path부터 추천해드릴게요
          </p>
        </div>

        {/* 추천 카드 3개 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {recommended.map((curr, idx) => {
            const href = curr.slug ? `/c/${curr.slug}` : `/curriculum/${curr.id}`
            return (
              <Link key={curr.id} href={href} onClick={() => complete()} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px',
                  border: idx === 0 ? `2px solid ${accent}` : '1.5px solid var(--border)',
                  borderRadius: 12,
                  background: idx === 0 ? 'var(--accent-light)' : '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 150ms, box-shadow 150ms',
                  position: 'relative',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(91,92,240,0.15)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = accent
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = idx === 0 ? accent : 'var(--border)'
                  }}
                >
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute', top: -1, right: 16,
                      background: accent, color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '2px 8px',
                      borderRadius: '0 0 6px 6px', letterSpacing: '0.3px',
                    }}>
                      추천
                    </div>
                  )}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <BookOpenIcon size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                      {curr.title}
                    </p>
                    {curr.subtitle && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {curr.subtitle}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <span>{LEVEL_LABEL[curr.level] ?? curr.level}</span>
                      <span>·</span>
                      <span>{formatDuration(curr.estimated_duration)}</span>
                      {FEATURES.CARD_ENROLLMENT_COUNT && curr.enrollment_count > 0 && (
                        <>
                          <span>·</span>
                          <span>{curr.enrollment_count.toLocaleString()}명 수강</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: accent }}>
                    <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommended[0] && (
            <Link
              href={recommended[0].slug ? `/c/${recommended[0].slug}` : `/curriculum/${recommended[0].id}`}
              onClick={() => complete()}
              style={{
                ...primaryBtn,
                display: 'block', textAlign: 'center', textDecoration: 'none',
              }}
            >
              <RocketIcon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />첫 번째 추천 시작하기
            </Link>
          )}
          <button
            onClick={() => complete(true)}
            disabled={saving}
            style={ghostBtn}
          >
            {saving ? '저장 중...' : '전체 탐색 보기'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Step indicator ─── */
function StepIndicator({ current }: { current: number }) {
  const steps = ['이름', '관심사', '추천']
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: i < current ? 'var(--success)' : i === current ? 'var(--accent)' : 'var(--border)',
                color: i <= current ? '#fff' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, transition: 'all 200ms',
              }}>
                {i < current
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: i === current ? 700 : 400,
                color: i === current ? 'var(--accent)' : 'var(--text-tertiary)',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 56, height: 2,
                background: i < current ? 'var(--accent)' : 'var(--border)',
                margin: '0 4px', marginBottom: 18,
                transition: 'background 150ms',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 공통 스타일 ─── */
const pageStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 56px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px 80px',
  background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 50%, #f0f0ff 100%)',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: '#fff',
  borderRadius: 20,
  padding: '36px 32px',
  boxShadow: '0 8px 40px rgba(91,92,240,0.12)',
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 150ms',
}

const ghostBtn: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-tertiary)',
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
}
