'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StepPreview {
  id: string
  title: string
}

interface UserProgress {
  progressPercent: number
  completedStepsCount: number
}

interface Props {
  curriculumId: string
  userId: string | null
  isCreator: boolean
  duration: string | null
  stepsCount: number
  enrollmentCount: number
  avgRating: number
  ratingCount: number
  completionResult: string | null
  targetAudience: string[]
  userProgress: UserProgress | null
  steps: StepPreview[]
}

export default function DetailSidebar({
  curriculumId,
  userId,
  isCreator,
  duration,
  stepsCount,
  enrollmentCount,
  avgRating,
  ratingCount,
  completionResult,
  targetAudience,
  userProgress,
  steps,
}: Props) {
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const supabase = createClient()

  /* 초기 저장 상태 확인 */
  useEffect(() => {
    if (!userId) return
    supabase
      .from('curriculum_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('curriculum_id', curriculumId)
      .maybeSingle()
      .then(({ data }) => { if (data) setSaved(true) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, curriculumId])

  const handleSave = async () => {
    if (!userId) {
      window.location.href = `/auth?next=/curriculum/${curriculumId}`
      return
    }
    setSaveLoading(true)
    if (saved) {
      await supabase
        .from('curriculum_saves')
        .delete()
        .eq('user_id', userId)
        .eq('curriculum_id', curriculumId)
      setSaved(false)
    } else {
      await supabase
        .from('curriculum_saves')
        .insert({ user_id: userId, curriculum_id: curriculumId })
      setSaved(true)
    }
    setSaveLoading(false)
  }

  const progressPercent = userProgress?.progressPercent ?? 0
  const completedCount = userProgress?.completedStepsCount ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── CTA Card ── */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Progress bar (logged in & started) */}
        {userProgress && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>전체 진행률</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? 'var(--success)' : 'var(--accent)',
                borderRadius: 999,
                transition: 'width 400ms ease',
              }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              {completedCount} / {stepsCount} Step 완료
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ padding: userProgress ? '0 20px 20px' : '20px' }}>
          <Link
            href={`/curriculum/${curriculumId}/learn`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 0',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 10,
              letterSpacing: '-0.2px',
              transition: 'background 150ms',
            }}
          >
            {userProgress
              ? (progressPercent === 100 ? '🎉 다시 보기' : '▶ 이어서 학습하기')
              : '학습 시작하기'}
            {!userProgress && (
              <span style={{
                fontSize: 11,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 6,
                padding: '2px 7px',
                fontWeight: 600,
              }}>
                로그인 없이
              </span>
            )}
          </Link>

          {/* 저장하기 */}
          <button
            onClick={handleSave}
            disabled={saveLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '11px 0',
              borderRadius: 10,
              border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`,
              background: saved ? 'var(--accent-light)' : 'transparent',
              color: saved ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: saved ? 600 : 500,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 150ms',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'var(--accent)' : 'none'}>
              <path
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                stroke={saved ? 'var(--accent)' : 'currentColor'}
                strokeWidth="1.8"
              />
            </svg>
            {saved ? '저장됨' : '저장하기'}
          </button>

          {/* 로그인 안내 (비로그인) */}
          {!userId && (
            <p style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              marginTop: 10,
              lineHeight: '16px',
            }}>
              <Link href={`/auth?next=/curriculum/${curriculumId}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                로그인
              </Link>
              하면 진도 저장 및 이어보기가 가능해요
            </p>
          )}

          {/* 수정하기 (제작자) */}
          {isCreator && (
            <>
              <div style={{ height: 1, background: 'var(--divider)', margin: '12px 0' }} />
              <Link href={`/curriculum/${curriculumId}/edit`} style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 8,
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
              }}>
                ✏️ 커리큘럼 수정
              </Link>
            </>
          )}
        </div>

        {/* Metadata */}
        <div style={{
          borderTop: '1px solid var(--divider)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {[
            { label: '예상 학습 시간', value: duration },
            { label: 'Step 수', value: `${stepsCount}개` },
            { label: '학습자 수', value: `${enrollmentCount.toLocaleString()}명` },
            avgRating > 0 ? { label: '평균 평점', value: `★ ${avgRating.toFixed(1)} (${ratingCount}개)` } : null,
          ].filter(Boolean).map((item) => (
            <div key={item!.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{item!.label}</span>
              <span style={{ fontWeight: 600, color: item!.label === '평균 평점' ? '#f59e0b' : 'var(--text-primary)' }}>
                {item!.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 이런 분들에게 추천 ── */}
      {targetAudience.length > 0 && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '18px',
          background: '#fff',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            이런 분들에게 추천해요
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {targetAudience.slice(0, 4).map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1,
                  background: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '18px' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 이 커리큘럼을 마치면 ── */}
      {completionResult && (
        <div style={{
          border: '1px solid #86efac',
          borderRadius: 14,
          padding: '18px',
          background: '#f0fdf4',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#15803d' }}>
            이 커리큘럼을 마치면
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {completionResult.split('\n').filter(Boolean).map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1,
                  background: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: '#166534', lineHeight: '18px' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 학습 흐름 미리보기 ── */}
      {steps.length > 0 && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '18px',
          background: '#fff',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>학습 흐름 미리보기</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.slice(0, 5).map((step, i) => (
              <div key={step.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: i < Math.min(steps.length, 5) - 1 ? '1px solid var(--divider)' : 'none',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {step.title}
                </span>
              </div>
            ))}
            {steps.length > 5 && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: 10 }}>
                + {steps.length - 5}개 더
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
