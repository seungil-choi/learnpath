'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProgressBar from '@/components/ui/ProgressBar'
import { track } from '@/lib/analytics/track'
import type { StepWithResources, Progress } from '@/lib/supabase/types'
import { MenuIcon, CheckIcon, CheckCircleIcon, MessageCircleIcon, BookOpenIcon, SparkleIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'
import PathCelebration from '@/components/curriculum/PathCelebration'

interface Props {
  curriculum: { id: string; title: string }
  steps: StepWithResources[]
  userId: string | null
  initialProgress: Progress | null
  initialStepIdx: number
}

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  video: '영상',
  article: '글',
  github: 'GitHub',
  other: '링크',
}

const RESOURCE_TYPE_COLOR: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  github: '#1f2937',
  other: '#6b7280',
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const match = u.pathname.match(/\/embed\/([^/?]+)/)
      if (match) return match[1]
    }
  } catch { /* invalid URL */ }
  return null
}

function VideoPlayer({ url, title }: { url: string; title: string | null }) {
  const ytId = getYouTubeId(url)

  if (ytId) {
    return (
      <div style={{
        width: '100%', aspectRatio: '16/9',
        borderRadius: 12, overflow: 'hidden',
        background: '#0f0f0f', position: 'relative',
      }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          title={title ?? '강의 영상'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </div>
    )
  }

  // YouTube가 아닌 영상 — 외부 링크 카드
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 24px',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        background: '#fff',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(91,92,240,0.12)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'rgba(239,68,68,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
          <path d="M8 5l11 7-11 7V5z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
          {title ?? '강의 영상 보기'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {url}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    </a>
  )
}

/**
 * 글/문서 자료 — 컴팩트 카드 (iframe 임베드 시도하지 않음)
 *
 * 이유: 대부분의 외부 사이트는 X-Frame-Options/CSP로 임베드를 차단하므로
 *       큰 iframe 영역은 빈 박스만 노출됨. 영상이 메인이고 글은 보조 자료.
 *
 * 참고 사례: Coursera/Udemy/Khan/Claude Academy 모두 외부 글 자료는 링크 카드.
 */
function ArticleViewer({ url, title }: { url: string; title: string | null }) {
  const hostname = (() => {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  })()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        border: '1.5px solid var(--border)', borderRadius: 12,
        background: '#fff', textDecoration: 'none', color: 'inherit',
        transition: 'border-color 150ms, box-shadow 200ms',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#3b82f6'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(59,130,246,0.10)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: 'rgba(59,130,246,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title ?? '읽을 거리'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hostname}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 12px', borderRadius: 8,
        background: 'var(--surface)', color: 'var(--text-secondary)',
        fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>
        원문 보기
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      </div>
    </a>
  )
}

function GitHubViewer({ url, title }: { url: string; title: string | null }) {
  const repoPath = (() => {
    try {
      const u = new URL(url)
      if (u.hostname === 'github.com') return u.pathname.slice(1)
    } catch { /* */ }
    return null
  })()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 24px',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        background: '#fff',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1f2937'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: '#f6f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1f2937">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
          {title ?? (repoPath ?? 'GitHub 저장소')}
        </p>
        {repoPath && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
            github.com/{repoPath}
          </p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    </a>
  )
}

export default function LearningPlayer({
  curriculum,
  steps,
  userId,
  initialProgress,
  initialStepIdx,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(initialStepIdx)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(initialProgress?.completed_steps ?? [])
  )
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'content' | 'toc' | 'resources' | 'qa'>('content')
  const [noteText, setNoteText] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const noteSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const currentStep = steps[currentIdx]
  const totalSteps = steps.length
  const completedCount = completedSteps.size
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  // ── 이벤트: 학습 시작 (첫 마운트 & 진행률 0일 때)
  useEffect(() => {
    if (!initialProgress || (initialProgress.progress_percent ?? 0) === 0) {
      track('curriculum_started', { step_count: totalSteps }, curriculum.id)
    }
    track('step_viewed', { step_index: initialStepIdx }, curriculum.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 이벤트: Step 이동 시 step_viewed
  useEffect(() => {
    track('step_viewed', { step_index: currentIdx }, curriculum.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx])

  // Load notes from localStorage
  useEffect(() => {
    const key = `lp-note-${curriculum.id}-step-${currentStep.id}`
    const saved = localStorage.getItem(key)
    setNoteText(saved ?? '')
    setNoteSaved(false)
  }, [currentIdx, curriculum.id, currentStep.id])

  // Auto-save note
  const handleNoteChange = (val: string) => {
    setNoteText(val)
    setNoteSaved(false)
    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current)
    noteSaveTimeout.current = setTimeout(() => {
      const key = `lp-note-${curriculum.id}-step-${currentStep.id}`
      localStorage.setItem(key, val)
      setNoteSaved(true)
    }, 800)
  }

  const saveProgress = async (newCompleted: Set<string>, stepId: string) => {
    if (!userId) { setShowAuthPrompt(true); return }
    const percent = Math.round((newCompleted.size / totalSteps) * 100)
    await supabase.from('progress').upsert({
      user_id: userId,
      curriculum_id: curriculum.id,
      completed_steps: Array.from(newCompleted),
      progress_percent: percent,
      last_step_id: stepId,
      last_accessed_at: new Date().toISOString(),
      completed_at: percent === 100 ? new Date().toISOString() : null,
    }, { onConflict: 'user_id,curriculum_id' })

    // 이벤트 트래킹
    track('step_completed', { step_index: currentIdx, progress_percent: percent }, curriculum.id)
    if (percent === 100) {
      track('curriculum_completed', { step_count: totalSteps }, curriculum.id)
    }
  }

  const handleToggleComplete = async () => {
    const stepId = currentStep.id
    const next = new Set(completedSteps)
    const wasComplete = next.has(stepId)
    if (wasComplete) next.delete(stepId)
    else next.add(stepId)
    setCompletedSteps(next)
    // 마지막 Step을 막 완료해서 100%가 된 순간 — 시그니처 축하
    if (!wasComplete && next.size === totalSteps) {
      setShowCelebration(true)
    }
    await saveProgress(next, stepId)
  }

  const goTo = (idx: number) => {
    setCurrentIdx(idx)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isCurrentCompleted = completedSteps.has(currentStep.id)
  // ── 리소스 우선순위 정렬: video > article > github > other ──
  // 영상이 메인 콘텐츠로 가장 위에 오도록 (Coursera/Udemy/Claude Academy 패턴)
  const RESOURCE_PRIORITY: Record<string, number> = { video: 0, article: 1, github: 2, other: 3 }
  const videoResources = currentStep.resources.filter(r => r.type === 'video')
  const otherResources = currentStep.resources.filter(r => r.type !== 'video')
  const allResources = [...currentStep.resources].sort((a, b) =>
    (RESOURCE_PRIORITY[a.type] ?? 99) - (RESOURCE_PRIORITY[b.type] ?? 99)
  )

  // ── Left Sidebar content ──
  const leftSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--divider)' }}>
        <Link href="/my-learning" style={{
          fontSize: 11, color: 'var(--text-tertiary)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10,
        }}>
          ← 내 학습으로
        </Link>

        {/* Curriculum thumbnail placeholder */}
        <div style={{
          width: '100%', aspectRatio: '16/9', borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
          marginBottom: 10, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}>
          <BookOpenIcon size={36} style={{ color: '#fff' }} />
        </div>

        <p style={{
          fontWeight: 700, fontSize: 13, lineHeight: '18px',
          marginBottom: 10, color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {curriculum.title}
        </p>

        <ProgressBar percent={progressPercent} showLabel />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span>{completedCount} / {totalSteps} 단계 완료</span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{progressPercent}%</span>
        </div>
      </div>

      {/* Step list — Path 지도 (노드 + 연결선)
          완료: 채워진 노드 + 실선 / 현재: 강조 링 노드 / 이후: 빈 노드 + 점선 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', padding: '6px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          나의 경로
        </p>
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = idx === currentIdx
          const isLast = idx === steps.length - 1
          // 이 노드에서 다음 노드로 가는 연결선: 현재 Step까지 완료됐으면 실선(accent)
          const edgeDone = isCompleted
          return (
            <div key={step.id} style={{ position: 'relative' }}>
              <button
                onClick={() => goTo(idx)}
                className={`step-nav-btn ${isCurrent ? 'active' : ''}`}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${isCompleted ? 'var(--accent)' : isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                  background: isCompleted ? 'var(--accent)' : isCurrent ? '#fff' : 'var(--surface)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--accent-light)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: isCompleted ? '#fff' : isCurrent ? 'var(--accent)' : 'var(--text-tertiary)',
                  transition: 'background 300ms var(--ease-out), border-color 300ms var(--ease-out), box-shadow 300ms var(--ease-out)',
                }}>
                  {isCompleted
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : idx + 1
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 12, fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'var(--accent)' : 'var(--text-primary)',
                    lineHeight: '16px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {step.title}
                  </p>
                  {(step as { estimated_duration?: number }).estimated_duration ? (
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {(step as { estimated_duration?: number }).estimated_duration}분
                    </p>
                  ) : null}
                </div>
              </button>
              {/* 노드 사이 연결선 — 완료 구간은 실선(accent), 미완 구간은 점선 */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  left: 25, // 노드 중심(8px 패딩 + 12px 버튼패딩 좌 → 노드 좌측 20 + 13 중심) 보정값
                  top: 38,
                  bottom: -6,
                  width: 0,
                  borderLeft: edgeDone
                    ? '2px solid var(--accent)'
                    : '2px dashed var(--border)',
                  zIndex: 0,
                  transition: 'border-color 400ms var(--ease-out)',
                }} />
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--divider)' }}>
        <Link href={`/curriculum/${curriculum.id}`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none',
          padding: '6px 0',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 16l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          커리큘럼 상세 보기
        </Link>
      </div>
    </div>
  )

  // ── Right sidebar content ──
  const rightSidebar = (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 학습 리소스 */}
      {allResources.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            학습 리소스 <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{allResources.length}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allResources.map(r => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                  transition: 'border-color 150ms, background 150ms',
                }}
                className="resource-link-compact"
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 4, flexShrink: 0,
                  background: `${RESOURCE_TYPE_COLOR[r.type] ?? '#6b7280'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.type === 'video' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={RESOURCE_TYPE_COLOR.video}>
                      <path d="M8 5l11 7-11 7V5z" />
                    </svg>
                  )}
                  {r.type === 'article' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke={RESOURCE_TYPE_COLOR.article} strokeWidth="2" />
                      <path d="M8 9h8M8 13h5" stroke={RESOURCE_TYPE_COLOR.article} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                  {(r.type !== 'video' && r.type !== 'article') && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1.5 1.5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1.5-1.5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    lineHeight: '16px', marginBottom: 2,
                  }}>
                    {r.title ?? r.url}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {RESOURCE_TYPE_LABEL[r.type] ?? '링크'}
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 나의 학습 노트 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700 }}>나의 학습 노트</p>
          {noteSaved && (
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckIcon size={14} style={{ color: 'var(--success)' }} /> 저장됨
            </span>
          )}
        </div>
        <textarea
          value={noteText}
          onChange={e => handleNoteChange(e.target.value)}
          placeholder="이번 단계에서 배운 내용을&#10;자유롭게 기록해보세요..."
          maxLength={1000}
          rows={5}
          className="notes-textarea"
        />
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>
          {noteText.length} / 1000
        </p>
      </div>

      {/* AI 요약 (Phase 2 — FEATURES.AI_SUMMARY) */}
      {FEATURES.AI_SUMMARY && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '14px',
          background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>AI 요약</p>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 6px',
              background: 'var(--accent)', color: '#fff', borderRadius: 4,
            }}>베타</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: '18px', marginBottom: 10 }}>
            Claude가 이 단계의 핵심 내용을 요약해드려요.
          </p>
          <button
            disabled
            title="준비 중인 기능이에요"
            style={{
              width: '100%', padding: '8px 0',
              borderRadius: 8, border: '1px solid var(--accent)',
              color: 'var(--accent)', background: 'var(--accent-light)',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', transition: 'background 150ms',
              opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <SparkleIcon size={12} /> 이 단계 요약하기
          </button>
        </div>
      )}

      {/* 커뮤니티 질문 CTA (Phase 2 — FEATURES.COMMUNITY_QUESTION_CTA) */}
      {FEATURES.COMMUNITY_QUESTION_CTA && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>도움이 필요하신가요?</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: '18px', marginBottom: 10 }}>
            커뮤니티에서 질문하고 함께 성장해보세요.
          </p>
          <a
            href="#"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
            }}
          >
            질문하러 가기
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )

  return (
    <div className="player-layout" style={{ position: 'relative' }}>

      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="player-left">
        {leftSidebar}
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 40,
            }}
          />
          <div style={{
            position: 'fixed', top: 56, left: 0, bottom: 0,
            width: 280, background: '#fff',
            zIndex: 50, overflowY: 'auto',
            borderRight: '1px solid var(--border)',
            boxShadow: '4px 0 16px rgba(0,0,0,0.12)',
          }}>
            {leftSidebar}
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="player-main">

        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: '#fff',
          position: 'sticky',
          top: 56,
          zIndex: 30,
        }} className="player-mobile-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            <MenuIcon size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ProgressBar percent={progressPercent} showLabel />
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: '36px 48px 60px', maxWidth: 760 }} className="player-content">

          {/* Step indicator */}
          <p style={{
            fontSize: 12, fontWeight: 700, color: 'var(--accent)',
            marginBottom: 8, letterSpacing: '0.3px',
          }}>
            Step {currentIdx + 1} / {totalSteps}
          </p>

          <h2 style={{ marginBottom: 10, letterSpacing: '-0.3px', fontSize: 22 }}>
            {currentStep.title}
          </h2>

          {currentStep.description && (
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: '26px',
              fontSize: 15,
              marginBottom: 28,
              whiteSpace: 'pre-wrap',
            }}>
              {currentStep.description}
            </p>
          )}

          {/* ── 리소스 콘텐츠 뷰어 ── */}
          {/* 영상 = 메인 (큰 플레이어), 글/링크 = 보조 자료 그룹 */}
          {videoResources.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
              {videoResources.map(r => (
                <div key={r.id}>
                  <p style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: 'var(--text-tertiary)',
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: 999,
                      background: '#ef4444',
                    }} />
                    {RESOURCE_TYPE_LABEL.video}
                    {r.title && (
                      <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--text-secondary)' }}>
                        · {r.title}
                      </span>
                    )}
                  </p>
                  <VideoPlayer url={r.url} title={r.title} />
                </div>
              ))}
            </div>
          )}

          {/* 보조 자료 (글/GitHub/기타) — 컴팩트 카드 그룹 */}
          {otherResources.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--text-tertiary)',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: 999,
                  background: 'var(--text-tertiary)',
                }} />
                {videoResources.length > 0 ? '함께 보면 좋은 자료' : '학습 자료'}
                <span style={{ marginLeft: 4, fontWeight: 400, color: 'var(--text-tertiary)' }}>
                  {otherResources.length}
                </span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {otherResources.map(r => (
                <div key={r.id}>
                  {/* 타입별 뷰어 */}
                  {r.type === 'article' && <ArticleViewer url={r.url} title={r.title} />}
                  {r.type === 'github' && <GitHubViewer url={r.url} title={r.title} />}
                  {r.type === 'other' && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 20px',
                        border: '1.5px solid var(--border)', borderRadius: 12,
                        background: '#fff', textDecoration: 'none', color: 'inherit',
                        transition: 'border-color 150ms',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1.5 1.5" />
                        <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1.5-1.5" />
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{r.title ?? '링크 열기'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}

          {/* [Legacy — mobile only resources, now unused] */}
          {false && otherResources.length > 0 && (
            <div style={{ marginBottom: 28 }} className="mobile-resources">
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                학습 자료
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherResources.map(r => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                  >
                    <span style={{
                      fontSize: 12, padding: '3px 8px',
                      background: 'var(--surface)', borderRadius: 4,
                      color: 'var(--text-secondary)', flexShrink: 0, fontWeight: 500,
                    }}>
                      {RESOURCE_TYPE_LABEL[r.type] ?? '링크'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 500, fontSize: 14,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.title ?? r.url}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Auth Prompt */}
          {showAuthPrompt && (
            <div style={{
              background: 'var(--accent-light)',
              border: '1px solid #c7c7f9',
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                  진도를 저장하려면 로그인이 필요해요
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  로그인하면 언제든 이어서 학습할 수 있어요
                </p>
              </div>
              <Link href={`/auth?next=/curriculum/${curriculum.id}/learn`} style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff',
                textDecoration: 'none', fontWeight: 600, fontSize: 13, flexShrink: 0,
              }}>
                로그인하기
              </Link>
            </div>
          )}

          {/* Completion feedback */}
          {isCurrentCompleted && !showAuthPrompt && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, color: '#15803d', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill="#22c55e" />
                <path d="M7.5 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              이 단계를 완료했어요
            </div>
          )}

          {/* Step navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 28,
            borderTop: '1px solid var(--divider)',
            gap: 12,
            marginTop: 8,
          }}>
            <button
              onClick={() => goTo(currentIdx - 1)}
              disabled={currentIdx === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIdx === 0 ? 0.4 : 1,
                fontSize: 14, fontFamily: 'inherit',
              }}
            >
              ← 이전 단계
            </button>

            {/* Step dots — 좌측 Path 지도와 동일한 색 언어 (완료=accent) */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Step ${i + 1}로 이동`}
                  style={{
                    width: i === currentIdx ? 20 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: i === currentIdx ? 'var(--accent)' : completedSteps.has(steps[i].id) ? '#a5a6f6' : 'var(--border)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 250ms var(--ease-out)',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {currentIdx < totalSteps - 1 ? (
              <button
                onClick={() => {
                  if (!isCurrentCompleted) handleToggleComplete()
                  goTo(currentIdx + 1)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                다음 단계 →
              </button>
            ) : (
              <button
                onClick={handleToggleComplete}
                className={isCurrentCompleted ? 'step-done-btn' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: isCurrentCompleted ? 'var(--success)' : 'var(--accent)',
                  color: '#fff',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 300ms var(--ease-out)',
                }}
              >
                {isCurrentCompleted ? <><CheckIcon size={14} /> 완료됨</> : '단계 완료 표시'}
              </button>
            )}
          </div>

          {/* 완료 배너 */}
          {progressPercent === 100 && (
            <div style={{
              marginTop: 32,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac',
              borderRadius: 12, padding: '28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <CheckCircleIcon size={28} style={{ color: '#15803d' }} />
              </div>
              <h3 style={{ marginBottom: 6, color: '#15803d', fontSize: 20 }}>커리큘럼 완료!</h3>
              <p style={{ fontSize: 14, color: '#166534', marginBottom: 20 }}>
                모든 단계를 마쳤습니다. 수고하셨어요!
              </p>
              <Link href={`/curriculum/${curriculum.id}`} style={{
                display: 'inline-block', padding: '10px 24px',
                borderRadius: 8, background: 'var(--success)',
                color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: 14,
              }}>
                커리큘럼으로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar (Desktop 1100px+) ── */}
      <aside className="player-right">
        {rightSidebar}
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="player-mobile-tabs" style={{
        display: 'none',
        position: 'fixed',
        bottom: 64, left: 0, right: 0,
        zIndex: 60,
        background: '#fff',
        borderTop: '1px solid var(--border)',
        flexDirection: 'column',
      }}>
        {/* Tab nav */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)' }}>
          {([
            { key: 'content', label: '학습 콘텐츠' },
            { key: 'toc', label: `목차` },
            { key: 'resources', label: `자료 ${allResources.length}` },
            { key: 'qa', label: 'Q&A' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              style={{
                flex: 1, padding: '10px 4px',
                border: 'none', background: 'transparent',
                fontFamily: 'inherit', fontSize: 12, fontWeight: mobileTab === tab.key ? 700 : 400,
                color: mobileTab === tab.key ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: `2px solid ${mobileTab === tab.key ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TOC panel */}
        {mobileTab === 'toc' && (
          <div style={{ maxHeight: '40vh', overflowY: 'auto', background: '#fff' }}>
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.has(step.id)
              const isCurrent = idx === currentIdx
              return (
                <button
                  key={step.id}
                  onClick={() => { setCurrentIdx(idx); setMobileTab('content'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '12px 16px',
                    border: 'none', background: isCurrent ? 'var(--accent-light)' : 'transparent',
                    borderBottom: '1px solid var(--divider)', textAlign: 'left',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-tertiary)',
                  }}>
                    {isCompleted ? <CheckIcon size={14} style={{ color: '#fff' }} /> : idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: isCurrent ? 700 : 400,
                      color: isCurrent ? 'var(--accent)' : 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {step.title}
                    </p>
                    {(step as any).estimated_duration && (
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {(step as any).estimated_duration}분
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l6 4-6 4V3z" fill="var(--accent)" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Resources panel */}
        {mobileTab === 'resources' && (
          <div style={{ maxHeight: '40vh', overflowY: 'auto', padding: '12px 16px', background: '#fff' }}>
            {allResources.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px 0', fontSize: 13 }}>
                이 Step에 자료가 없어요
              </p>
            ) : allResources.map(r => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', marginBottom: 8,
                  border: '1px solid var(--border)', borderRadius: 8,
                  textDecoration: 'none', color: 'inherit', background: '#fff',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-light)', color: 'var(--accent)', flexShrink: 0 }}>
                  {RESOURCE_TYPE_LABEL[r.type] ?? '링크'}
                </span>
                <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title ?? r.url}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* Q&A panel */}
        {mobileTab === 'qa' && (
          <div style={{ padding: '24px 16px', textAlign: 'center', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <MessageCircleIcon size={40} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Q&A 기능은 준비 중이에요</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>커뮤니티에서 질문해보세요</p>
          </div>
        )}
      </div>

      {/* Path 완주 축하 — 점들이 선으로 이어지는 시그니처 모션 */}
      {showCelebration && (
        <PathCelebration
          curriculumTitle={curriculum.title}
          totalSteps={totalSteps}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <style>{`
        /* Step 완료 순간의 마이크로 모션 — 살짝 튀어오르는 확인 피드백 */
        .step-done-btn {
          animation: stepDonePulse 400ms var(--ease-out);
        }
        @keyframes stepDonePulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @media (max-width: 768px) {
          .player-mobile-topbar { display: flex !important; }
          .player-mobile-tabs { display: flex !important; }
          .player-content { padding: 20px 16px 200px !important; }
          .mobile-resources { display: block; }
        }
        @media (min-width: 769px) {
          .mobile-resources { display: none; }
        }
        @media (min-width: 1100px) {
          .mobile-resources { display: none !important; }
        }
      `}</style>
    </div>
  )
}
