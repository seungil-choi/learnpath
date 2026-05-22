'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCategoryGradient } from '@/lib/categories'
import { BookOpenIcon, BookmarkIcon, ClockIcon, PencilIcon, FlagIcon, CheckIcon } from '@/components/ui/icons'
import { timeAgo } from '@/lib/timeAgo'
import { FEATURES } from '@/lib/featureFlags'

interface Stats {
  inProgressCount: number
  completedCount: number
  savedCount: number
  totalTime: string
  overallPercent: number
  streak?: number
  completedStepsTotal?: number
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inProgress: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completed: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drafts: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saves: any[]
  stats: Stats
  isDemoMode?: boolean
}

type Tab = 'all' | 'inprogress' | 'completed' | 'saved' | 'drafts'

const grad = (cat?: string) => getCategoryGradient(cat)

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
}

function CircleProgress({ percent }: { percent: number }) {
  const r = 38, circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--accent)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 600ms ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{percent}%</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>전체 진행률</span>
      </div>
    </div>
  )
}

export default function MyLearningClient({ inProgress, completed, drafts, saves, stats, isDemoMode }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'all', label: '전체' },
    { key: 'inprogress', label: '진행 중', count: stats.inProgressCount },
    { key: 'completed', label: '완료', count: stats.completedCount },
    { key: 'saved', label: '찜한 강의', count: stats.savedCount },
    { key: 'drafts', label: '내 초안', count: drafts.length },
  ]

  const show = (tab: Tab) => activeTab === 'all' || activeTab === tab

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>내 학습</h1>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4 }}>
          학습 진행 상황을 확인하고 이어보세요
        </p>
      </div>

      {/* ── 진행률 요약 ── */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 16, padding: '24px',
        background: '#fff', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <CircleProgress percent={stats.overallPercent} />
        <div style={{ display: 'flex', gap: 28, flex: 1, flexWrap: 'wrap' }}>
          {([
            { Icon: BookOpenIcon, label: '진행 중 Path', value: `${stats.inProgressCount}` },
            { Icon: CheckIcon, label: '완료한 Step', value: `${stats.completedStepsTotal ?? 0}` },
            { Icon: FlagIcon, label: '연속 학습', value: `${stats.streak ?? 0}일`, accent: (stats.streak ?? 0) > 0 },
            { Icon: null, label: '완성한 Path', value: `${stats.completedCount}`, green: true },
            { Icon: ClockIcon, label: '학습 시간', value: stats.totalTime },
          ] as Array<{ Icon: React.FC<{ size?: number; style?: React.CSSProperties }> | null; label: string; value: string; green?: boolean; accent?: boolean }>).map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 64 }}>
              <span style={{ fontSize: 20, display: 'flex', alignItems: 'center', color: item.green ? 'var(--success)' : item.accent ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {item.green
                  ? <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>✓</span>
                  : item.Icon && <item.Icon size={20} />
                }
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: item.green ? 'var(--success)' : item.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
                {item.value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
        {inProgress.length > 0 && (
          <Link href={`/curriculum/${inProgress[0].curriculum_id}/learn`} style={{
            padding: '10px 20px', borderRadius: 8,
            background: 'var(--accent)', color: '#fff',
            textDecoration: 'none', fontWeight: 700, fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap',
          }}>▶ 이어보기</Link>
        )}
      </div>

      {/* ── 탭 ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 28, overflowX: 'auto' }} className="category-scroll">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                padding: '2px 6px', borderRadius: 999,
                background: activeTab === tab.key ? 'var(--accent)' : 'var(--border)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-tertiary)',
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── 진행 중 ── */}
      {show('inprogress') && (
        <section style={{ marginBottom: 40 }}>
          {activeTab === 'all' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>진행 중인 커리큘럼</h2>
              {inProgress.length > 3 && (
                <button onClick={() => setActiveTab('inprogress')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}>
                  전체 보기 →
                </button>
              )}
            </div>
          )}
          {inProgress.length === 0 ? (
            <EmptyState icon={<BookOpenIcon size={48} style={{ color: 'var(--text-tertiary)' }} />} message="진행 중인 커리큘럼이 없어요" cta="커리큘럼 탐색하기" href="/explore" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(activeTab === 'all' ? inProgress.slice(0, 3) : inProgress).map((p: any) => {
                const cur = p.curricula
                if (!cur) return null
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: '1px solid var(--border)', borderRadius: 12,
                    padding: '16px', background: '#fff',
                  }}>
                    <div style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0, background: grad(cur.category), position: 'relative' }}>
                      <span style={{
                        position: 'absolute', top: 6, left: 6,
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        background: 'rgba(91,92,240,0.7)', borderRadius: 4, padding: '2px 6px',
                      }}>진행 중</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent)', width: `${p.progress_percent}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{p.progress_percent}%</span>
                      </div>
                      {p.last_accessed_at && (
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {timeAgo(p.last_accessed_at)}에 멈췄어요
                        </p>
                      )}
                    </div>
                    <Link href={`/curriculum/${p.curriculum_id}/learn`} style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '1.5px solid var(--accent)', color: 'var(--accent)',
                      textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                    }}>이어서 학습</Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── 완료 ── */}
      {show('completed') && (
        <section style={{ marginBottom: 40 }}>
          {activeTab === 'all' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>완료한 커리큘럼</h2>
              {completed.length > 3 && (
                <button onClick={() => setActiveTab('completed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}>
                  전체 보기 →
                </button>
              )}
            </div>
          )}
          {completed.length === 0 ? (
            activeTab === 'completed' && <EmptyState icon={<BookOpenIcon size={48} style={{ color: 'var(--text-tertiary)' }} />} message="아직 완료한 커리큘럼이 없어요" cta="학습 시작하기" href="/explore" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(activeTab === 'all' ? completed.slice(0, 3) : completed).map((p: any) => {
                const cur = p.curricula
                if (!cur) return null
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: '1px solid #86efac', borderRadius: 12, padding: '16px', background: '#f0fdf4',
                  }}>
                    <div style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0, background: grad(cur.category), position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: 700, color: '#15803d', background: 'rgba(240,253,244,0.9)', borderRadius: 4, padding: '2px 6px' }}>✓ 완료</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</p>
                      <p style={{ fontSize: 12, color: '#15803d' }}>
                        완료일 {p.completed_at ? formatDate(p.completed_at) : ''}
                        {cur.estimated_duration ? ` · ${Math.floor(cur.estimated_duration / 60) > 0 ? `${Math.floor(cur.estimated_duration / 60)}시간` : ''}${cur.estimated_duration % 60 > 0 ? ` ${cur.estimated_duration % 60}분` : ''}` : ''}
                      </p>
                    </div>
                    <Link href={`/curriculum/${p.curriculum_id}/learn`} style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '1.5px solid #15803d', color: '#15803d',
                      textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                    }}>복습하기</Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── 찜한 강의 ── */}
      {show('saved') && (
        <section style={{ marginBottom: 40 }}>
          {activeTab === 'all' && saves.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>찜한 강의</h2>
              {saves.length > 3 && (
                <button onClick={() => setActiveTab('saved')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}>
                  전체 보기 →
                </button>
              )}
            </div>
          )}
          {saves.length === 0 ? (
            activeTab === 'saved' && <EmptyState icon={<BookmarkIcon size={48} style={{ color: 'var(--text-tertiary)' }} />} message="저장한 커리큘럼이 없어요" cta="커리큘럼 탐색하기" href="/explore" desc="관심 있는 커리큘럼을 저장하면 여기에 표시돼요" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(activeTab === 'all' ? saves.slice(0, 3) : saves).map((s: any) => {
                const cur = s.curricula
                if (!cur) return null
                return (
                  <div key={s.curriculum_id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: '1px solid var(--border)', borderRadius: 12, padding: '16px', background: '#fff',
                  }}>
                    <div style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0, background: grad(cur.category) }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</p>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {cur.category && <span>{cur.category}</span>}
                        {cur.level && <span>{{ beginner: '초급', intermediate: '중급', advanced: '고급' }[cur.level as string]}</span>}
                        {FEATURES.CARD_ENROLLMENT_COUNT && cur.enrollment_count > 0 && <span>{cur.enrollment_count.toLocaleString()}명</span>}
                      </div>
                    </div>
                    <Link href={`/curriculum/${s.curriculum_id}`} style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: 'var(--accent)', color: '#fff',
                      textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                    }}>시작하기</Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── 내 초안 ── */}
      {show('drafts') && (
        <section style={{ marginBottom: 40 }}>
          {activeTab === 'all' && drafts.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>내 초안</h2>
            </div>
          )}
          {drafts.length === 0 ? (
            activeTab === 'drafts' && <EmptyState icon={<PencilIcon size={48} style={{ color: 'var(--text-tertiary)' }} />} message="초안이 없어요" cta="새 커리큘럼 만들기" href="/create" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {drafts.map((cur: any) => (
                <div key={cur.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  border: '1px solid var(--border)', borderRadius: 12, padding: '16px', background: '#fff',
                }}>
                  <div style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0, background: grad(cur.category) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{cur.title || '(제목 없음)'}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{cur.category ?? '미분류'} · {formatDate(cur.updated_at ?? cur.created_at)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link href={`/curriculum/${cur.id}/edit`} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>편집</Link>
                    <Link href={`/curriculum/${cur.id}`} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--accent)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>발행</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 전부 비어있을 때 */}
      {activeTab === 'all' && inProgress.length === 0 && completed.length === 0 && saves.length === 0 && drafts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed var(--border)', borderRadius: 20 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <BookOpenIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>학습을 시작해보세요!</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>LearnPath에서 첫 번째 커리큘럼을 발견하고 시작해보세요.</p>
          <Link href="/explore" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            커리큘럼 탐색하기 →
          </Link>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, message, desc, cta, href }: { icon: React.ReactNode; message: string; desc?: string; cta: string; href: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--border)', borderRadius: 12 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: desc ? 6 : 20 }}>{message}</p>
      {desc && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>{desc}</p>}
      <Link href={href} style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
        {cta} →
      </Link>
    </div>
  )
}
