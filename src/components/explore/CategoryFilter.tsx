'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['전체', 'AI·자동화', '프로그래밍', '디자인', '비즈니스', '생산성']
const LEVELS = [
  { value: '', label: '모든 수준' },
  { value: 'beginner', label: '입문' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
]
const DURATIONS = [
  { value: '', label: '모든 시간' },
  { value: '30', label: '⏱ 30분 이내' },
  { value: '60', label: '⏱ 1시간 이내' },
  { value: '120', label: '⏱ 2시간 이내' },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? '전체'
  const selectedLevel = searchParams.get('level') ?? ''
  const selectedDuration = searchParams.get('duration') ?? ''

  const navigate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== '전체') params.set(key, value)
    else params.delete(key)
    router.push(`/?${params.toString()}`)
  }

  const hasActiveFilter = selectedCategory !== '전체' || selectedLevel || selectedDuration

  const selectStyle = (active: boolean) => ({
    padding: '5px 10px',
    borderRadius: 8,
    fontSize: 13,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-light)' : '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Row 1: Category chips — horizontal scroll */}
      <div
        className="category-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => navigate('category', cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                border: '1px solid',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-light)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Row 2: Filters — right-aligned */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
        <select
          value={selectedLevel}
          onChange={e => navigate('level', e.target.value)}
          style={selectStyle(!!selectedLevel)}
        >
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        <select
          value={selectedDuration}
          onChange={e => navigate('duration', e.target.value)}
          style={selectStyle(!!selectedDuration)}
        >
          {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        {hasActiveFilter && (
          <button
            onClick={() => router.push('/')}
            title="필터 초기화"
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              fontSize: 12,
              border: '1px solid var(--border)',
              background: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

    </div>
  )
}
