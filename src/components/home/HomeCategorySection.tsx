'use client'

import { useState } from 'react'
import Link from 'next/link'
import CurriculumCard from '@/components/curriculum/CurriculumCard'
import type { CurriculumWithCreator } from '@/lib/supabase/types'

interface Category {
  label: string
  value: string
  icon: string
}

interface Props {
  curricula: CurriculumWithCreator[]
  categories: Category[]
}

const SORT_OPTIONS = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'newest' },
  { label: '완주율순', value: 'completion' },
]

export default function HomeCategorySection({ curricula, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [activeSort, setActiveSort] = useState('popular')

  const filtered = activeCategory === '전체'
    ? curricula
    : curricula.filter(c => c.category === activeCategory)

  return (
    <div style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 32px',
      display: 'grid',
      gridTemplateColumns: '200px 1fr',
      gap: 32,
    }} className="explore-grid">

      {/* ── Left: Category sidebar ── */}
      <div>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#fff',
          position: 'sticky',
          top: 80,
        }}>
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: i < categories.length - 1 ? '1px solid var(--divider)' : 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 150ms',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.label}</span>
                {isActive && (
                  <div style={{
                    width: 6, height: 6, borderRadius: 999,
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: Grid ── */}
      <div>
        {/* Sort tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          alignItems: 'center',
        }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setActiveSort(opt.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1.5px solid ${activeSort === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: activeSort === opt.value ? 'var(--accent)' : 'transparent',
                color: activeSort === opt.value ? '#fff' : 'var(--text-secondary)',
                fontWeight: activeSort === opt.value ? 700 : 400,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms',
              }}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-tertiary)' }}>
            {filtered.length}개
          </span>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {filtered.slice(0, 8).map((c, i) => (
              <CurriculumCard key={c.id} curriculum={c} rank={i + 1} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            border: '1px dashed var(--border)', borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6 }}>
              해당 카테고리에 커리큘럼이 없어요
            </p>
            <Link href="/create" style={{
              display: 'inline-block', marginTop: 16,
              padding: '9px 18px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              textDecoration: 'none', fontWeight: 600, fontSize: 13,
            }}>
              첫 번째로 만들기 →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .explore-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
