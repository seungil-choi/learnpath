'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { CurriculumWithCreator } from '@/lib/supabase/types'
import { getCategoryGradient } from '@/lib/categories'
import { ClockIcon, UsersIcon, SearchIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'

/* ─ 타입 ─ */
interface InitialParams {
  q: string
  category: string
  level: string
  duration: string
  sort: string
  view: string
}

interface Props {
  curricula: CurriculumWithCreator[]
  initialParams: InitialParams
}

/* ─ 상수 ─ */
const CATEGORIES = ['전체', 'AI·자동화', '프로그래밍', '디자인', '비즈니스', '생산성']

const LEVELS = [
  { label: '모든 수준', value: '' },
  { label: '초급', value: 'beginner' },
  { label: '중급', value: 'intermediate' },
  { label: '고급', value: 'advanced' },
]

const DURATIONS = [
  { label: '모든 시간', value: '' },
  { label: '1시간 이내', value: '60' },
  { label: '3시간 이내', value: '180' },
  { label: '5시간 이내', value: '300' },
  { label: '10시간 이내', value: '600' },
]

const SORTS = [
  { label: '관련도순', value: 'popular' },
  { label: '최신순', value: 'newest' },
  { label: '평점높은순', value: 'rating' },
]

const LEVEL_LABEL: Record<string, string> = { beginner: '초급', intermediate: '중급', advanced: '고급' }

function formatDuration(min: number) {
  if (!min) return null
  const h = Math.floor(min / 60), m = min % 60
  return h > 0 ? (m > 0 ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`
}

function CurriculumCardGrid({ c }: { c: CurriculumWithCreator }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thumb = (c as any).thumbnail_url as string | null
  const grad = getCategoryGradient(c.category)
  const dur = formatDuration(c.estimated_duration)
  return (
    <Link href={`/curriculum/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="curriculum-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: grad, overflow: 'hidden' }}>
          {thumb && <img src={thumb} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
          {c.level && (
            <span style={{
              position: 'absolute', bottom: 8, left: 8,
              fontSize: 11, fontWeight: 700, color: '#fff',
              background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 8px',
              backdropFilter: 'blur(4px)',
            }}>
              {LEVEL_LABEL[c.level] ?? c.level}
            </span>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: '14px' }}>
          {c.category && (
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 4, display: 'block' }}>
              {c.category}
            </span>
          )}
          <p style={{ fontWeight: 700, fontSize: 14, lineHeight: '20px', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.title}
          </p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(c as any).profiles?.username && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(c as any).profiles.username}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
            {FEATURES.CARD_RATING && c.avg_rating > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {c.avg_rating.toFixed(1)}</span>
            )}
            {dur && <span>{dur}</span>}
            {FEATURES.CARD_ENROLLMENT_COUNT && (
              <span>{c.enrollment_count.toLocaleString()}명</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CurriculumCardList({ c }: { c: CurriculumWithCreator }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thumb = (c as any).thumbnail_url as string | null
  const grad = getCategoryGradient(c.category)
  const dur = formatDuration(c.estimated_duration)
  return (
    <Link href={`/curriculum/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        display: 'flex', gap: 16,
        border: '1px solid var(--border)', borderRadius: 12,
        padding: '16px', background: '#fff',
        transition: 'box-shadow 150ms, border-color 150ms',
      }} className="curriculum-card" onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(91,92,240,0.10)'
        ;(e.currentTarget as HTMLElement).style.borderColor = '#c7c7f9'
      }} onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}>
        {/* Thumbnail */}
        <div style={{
          width: 120, height: 80, borderRadius: 8, flexShrink: 0,
          background: grad, overflow: 'hidden', position: 'relative',
        }}>
          {thumb && <img src={thumb} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            {c.category && (
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', padding: '1px 7px', background: 'var(--accent-light)', borderRadius: 4 }}>
                {c.category}
              </span>
            )}
            {c.level && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', padding: '1px 7px', background: 'var(--surface)', borderRadius: 4 }}>
                {LEVEL_LABEL[c.level]}
              </span>
            )}
          </div>
          <p style={{ fontWeight: 700, fontSize: 15, lineHeight: '22px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.title}
          </p>
          {c.description && (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--text-tertiary)' }}>
            {FEATURES.CARD_RATING && c.avg_rating > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {c.avg_rating.toFixed(1)}</span>
            )}
            {dur && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><ClockIcon size={13} /> {dur}</span>}
            {FEATURES.CARD_ENROLLMENT_COUNT && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><UsersIcon size={13} /> {c.enrollment_count.toLocaleString()}명</span>
            )}
          </div>
        </div>
        {/* Save button */}
        <button
          onClick={e => e.preventDefault()}
          style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border: '1px solid var(--border)', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="저장하기"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
    </Link>
  )
}

export default function ExploreClient({ curricula, initialParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(initialParams.q)
  const [category, setCategory] = useState(initialParams.category)
  const [level, setLevel] = useState(initialParams.level)
  const [duration, setDuration] = useState(initialParams.duration)
  const [sort, setSort] = useState(initialParams.sort)
  const [view, setView] = useState(initialParams.view)

  const buildUrl = (overrides: Partial<typeof initialParams>) => {
    const p = new URLSearchParams()
    const merged = { q, category, level, duration, sort, view, ...overrides }
    if (merged.q) p.set('q', merged.q)
    if (merged.category && merged.category !== '전체') p.set('category', merged.category)
    if (merged.level) p.set('level', merged.level)
    if (merged.duration) p.set('duration', merged.duration)
    if (merged.sort && merged.sort !== 'popular') p.set('sort', merged.sort)
    if (merged.view && merged.view !== 'grid') p.set('view', merged.view)
    return `${pathname}?${p.toString()}`
  }

  const navigate = (overrides: Partial<typeof initialParams>) => {
    startTransition(() => router.push(buildUrl(overrides)))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ q })
  }

  const handleReset = () => {
    setQ(''); setCategory('전체'); setLevel(''); setDuration('');
    startTransition(() => router.push(pathname))
  }

  const hasFilter = q || category !== '전체' || level || duration

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0' }}>

      {/* ── Search bar + header ── */}
      <div style={{
        padding: '32px 32px 0',
        borderBottom: '1px solid var(--divider)',
        background: '#fff',
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 640, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M15 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder='"Claude 활용" 검색 결과'
              style={{
                width: '100%', padding: '11px 14px 11px 40px',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                background: '#fff', color: 'var(--text-primary)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <button type="submit" style={{
            padding: '11px 20px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            검색
          </button>
          {hasFilter && (
            <button type="button" onClick={handleReset} style={{
              padding: '11px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              ✕ 초기화
            </button>
          )}
        </form>

        {/* Category scroll tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 0 }} className="category-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); navigate({ category: cat }) }}
              style={{
                padding: '8px 16px', borderRadius: 999, flexShrink: 0,
                border: `1.5px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                background: category === cat ? 'var(--accent)' : '#fff',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
                fontWeight: category === cat ? 700 : 400,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 16, transition: 'all 150ms',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 200px)' }}>

        {/* ── Left sidebar: filters ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid var(--divider)',
          padding: '24px 20px',
          position: 'sticky', top: 56,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }} className="explore-sidebar">

          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
            난이도
          </p>
          {LEVELS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 0', cursor: 'pointer', fontSize: 14,
              color: level === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: level === opt.value ? 700 : 400,
            }}>
              <input
                type="radio" name="level" value={opt.value}
                checked={level === opt.value}
                onChange={() => { setLevel(opt.value); navigate({ level: opt.value }) }}
                style={{ accentColor: 'var(--accent)' }}
              />
              {opt.label}
            </label>
          ))}

          <div style={{ height: 1, background: 'var(--divider)', margin: '16px 0' }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
            예상 학습 시간
          </p>
          {DURATIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 0', cursor: 'pointer', fontSize: 14,
              color: duration === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: duration === opt.value ? 700 : 400,
            }}>
              <input
                type="radio" name="duration" value={opt.value}
                checked={duration === opt.value}
                onChange={() => { setDuration(opt.value); navigate({ duration: opt.value }) }}
                style={{ accentColor: 'var(--accent)' }}
              />
              {opt.label}
            </label>
          ))}
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: '24px 28px', minWidth: 0 }}>

          {/* Results header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, flexWrap: 'wrap', gap: 10,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                {q ? `"${q}" 검색 결과 ` : (category !== '전체' ? `${category} ` : '')}{curricula.length}개
              </p>
              {isPending && (
                <p style={{ fontSize: 12, color: 'var(--accent)' }}>업데이트 중...</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Sort */}
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); navigate({ sort: e.target.value }) }}
                style={{
                  padding: '7px 28px 7px 10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: '#fff',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                  outline: 'none',
                }}
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              {/* View toggle */}
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {(['grid', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: '7px 10px', border: 'none', cursor: 'pointer',
                      background: view === v ? 'var(--accent-light)' : '#fff',
                      color: view === v ? 'var(--accent)' : 'var(--text-tertiary)',
                      transition: 'all 150ms',
                    }}
                    title={v === 'grid' ? '그리드 보기' : '리스트 보기'}
                  >
                    {v === 'grid' ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="0" y="0" width="7" height="7" rx="1.5" /><rect x="9" y="0" width="7" height="7" rx="1.5" />
                        <rect x="0" y="9" width="7" height="7" rx="1.5" /><rect x="9" y="9" width="7" height="7" rx="1.5" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="0" y="0" width="16" height="3" rx="1.5" /><rect x="0" y="6.5" width="16" height="3" rx="1.5" />
                        <rect x="0" y="13" width="16" height="3" rx="1.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid / List */}
          {curricula.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <SearchIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>검색 결과가 없어요</p>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>다른 키워드나 필터로 찾아보세요</p>
              <button onClick={handleReset} style={{
                padding: '10px 20px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
              }}>
                필터 초기화
              </button>
            </div>
          ) : view === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}>
              {curricula.map(c => <CurriculumCardGrid key={c.id} c={c} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {curricula.map(c => <CurriculumCardList key={c.id} c={c} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .explore-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
