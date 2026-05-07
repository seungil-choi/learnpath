'use client'

import { useState } from 'react'
import Link from 'next/link'
import StepAccordion from '@/components/curriculum/StepAccordion'
import { StarIcon, MessageCircleIcon, TargetIcon, CheckCircleIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'

interface Step {
  id: string
  title: string
  description?: string | null | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resources: any[]
  estimated_duration?: number | null | undefined
}

interface Props {
  curriculumId: string
  steps: Step[]
  completedStepIds: string[]
  learningGoals: string[]
  targetAudience: string[]
  prerequisites: string[]
  completionResult: string | null
  avgRating: number
  ratingCount: number
  enrollmentCount: number
}

export default function DetailTabs({
  curriculumId,
  steps,
  completedStepIds,
  learningGoals,
  targetAudience,
  prerequisites,
  completionResult,
  avgRating,
  ratingCount,
  enrollmentCount,
}: Props) {
  type TabKey = 'overview' | 'curriculum' | 'review' | 'qa' | 'recommend'
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  // Phase 1 정책: 소개 + 커리큘럼만 노출. 리뷰/Q&A/추천은 사용자 5천명 시점 이후
  const tabs = [
    { key: 'overview' as const, label: '소개' },
    { key: 'curriculum' as const, label: '커리큘럼' },
    ...(FEATURES.REVIEWS_TAB
      ? [{ key: 'review' as const, label: `리뷰 ${ratingCount > 0 ? ratingCount : ''}`.trim() }]
      : []),
    ...(FEATURES.QA_TAB ? [{ key: 'qa' as const, label: 'Q&A' }] : []),
    ...(FEATURES.RECOMMEND_TAB ? [{ key: 'recommend' as const, label: '추천' }] : []),
  ]

  return (
    <div>
      {/* ── Tab nav ── */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border)',
        gap: 0,
        position: 'sticky',
        top: 56,
        background: '#fff',
        zIndex: 10,
        marginBottom: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ paddingTop: 28 }}>

        {/* 소개 탭 */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* 이런 걸 배울 수 있어요 */}
            {(learningGoals.length > 0) && (
              <div style={{
                border: '1px solid var(--border)', borderRadius: 14, padding: '24px',
                display: 'flex', gap: 20, alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 16 }}>이런 걸 배울 수 있어요</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {learningGoals.map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 2,
                          background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '20px' }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Robot illustration placeholder */}
                <div style={{
                  width: 80, height: 80, flexShrink: 0,
                  background: 'var(--accent-light)', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <CheckCircleIcon size={20} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            )}

            {/* 이 커리큘럼은 이런 분들에게 */}
            {targetAudience.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>이 커리큘럼은 이런 분들에게 추천해요</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {targetAudience.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="var(--accent)" strokeWidth="1.8" />
                        <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 선행 지식 */}
            {prerequisites.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>선행 지식</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prerequisites.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>•</span>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 커리큘럼 구조 (요약) */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--divider)' }}>
                <h3 style={{ fontSize: 16 }}>커리큘럼 구조</h3>
              </div>
              <div style={{ padding: '16px 24px' }}>
                <StepAccordion
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  steps={steps as any}
                  completedStepIds={completedStepIds}
                  curriculumId={curriculumId}
                />
              </div>
            </div>
          </div>
        )}

        {/* 커리큘럼 탭 */}
        {activeTab === 'curriculum' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                총 {steps.length}개 Step · 단계별로 완료하면 목표에 도달합니다
              </p>
            </div>
            <StepAccordion
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              steps={steps as any}
              completedStepIds={completedStepIds}
              curriculumId={curriculumId}
            />
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === 'review' && (
          <div>
            {avgRating > 0 ? (
              <div style={{
                display: 'flex', gap: 48, alignItems: 'flex-start',
                marginBottom: 32, padding: '24px',
                border: '1px solid var(--border)', borderRadius: 14,
              }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: 52, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {avgRating.toFixed(1)}
                  </p>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '8px 0 4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : '#e5e7eb', fontSize: 18 }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{ratingCount}개 리뷰</p>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(star => {
                    const pct = star === 5 ? 75 : star === 4 ? 18 : star === 3 ? 5 : star === 2 ? 1 : 1
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 24, textAlign: 'right' }}>{star}점</span>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 30 }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-tertiary)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <StarIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p style={{ fontSize: 15 }}>아직 리뷰가 없어요</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>학습을 완료하고 첫 번째 리뷰를 남겨보세요</p>
              </div>
            )}
          </div>
        )}

        {/* Q&A 탭 */}
        {activeTab === 'qa' && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <MessageCircleIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 15 }}>Q&A 기능은 준비 중이에요</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>학습 중 궁금한 점은 커뮤니티에서 질문해보세요</p>
          </div>
        )}

        {/* 추천 탭 */}
        {activeTab === 'recommend' && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <TargetIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 15 }}>함께 보면 좋은 커리큘럼</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>추천 커리큘럼 기능은 준비 중이에요</p>
            <Link href="/" style={{
              display: 'inline-block', marginTop: 20,
              padding: '9px 18px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              textDecoration: 'none', fontWeight: 600, fontSize: 13,
            }}>
              다른 커리큘럼 탐색 →
            </Link>
          </div>
        )}
      </div>

      {/* 모바일 하단 고정 CTA는 MobileDetailCTA 컴포넌트로 분리 (curriculum/[id]/page.tsx에서 마운트) */}

      <style>{`
        .tab-btn {
          transition: all 150ms;
        }
        .tab-btn:hover {
          color: var(--accent);
          background: var(--accent-subtle);
        }
      `}</style>
    </div>
  )
}
