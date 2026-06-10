'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Path 완주 축하 오버레이 — C안 "Path Metaphor" 시그니처 순간
 *
 * 점들이 선으로 이어지는 모션(stroke-dashoffset 애니메이션)으로
 * "점 → 선 → 나의 학습 자산" 서사를 시각화한다.
 */
interface Props {
  curriculumTitle: string
  totalSteps: number
  onClose: () => void
}

export default function PathCelebration({ curriculumTitle, totalSteps, onClose }: Props) {
  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(17, 17, 17, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'celebFadeIn 300ms var(--ease-out)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '48px 40px 36px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(17,17,17,0.25)',
          animation: 'celebPopIn 450ms var(--ease-out)',
        }}
      >
        {/* 시그니처 모션: 점들이 선으로 이어진다 */}
        <svg width="240" height="100" viewBox="0 0 240 100" fill="none" style={{ marginBottom: 8 }} aria-hidden="true">
          <path
            d="M20 80 C 60 80 55 45 110 45 C 165 45 160 20 205 20"
            stroke="url(#celebGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 300,
              animation: 'celebDraw 1200ms var(--ease-in-out) 200ms forwards',
            }}
          />
          <defs>
            <linearGradient id="celebGrad" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5B5CF0" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          {/* 노드들 — 순차 등장 */}
          {[
            { cx: 20, cy: 80, delay: '300ms' },
            { cx: 110, cy: 45, delay: '700ms' },
            { cx: 205, cy: 20, delay: '1200ms', flag: true },
          ].map((n, i) => (
            <g key={i}>
              <circle
                cx={n.cx} cy={n.cy} r="8"
                fill="var(--accent)"
                style={{ opacity: 0, animation: `celebNodePop 350ms var(--ease-out) ${n.delay} forwards` }}
              />
              <path
                d={`M${n.cx - 3.5} ${n.cy} l2.5 2.5 l4.5 -5`}
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"
                style={{ opacity: 0, animation: `celebNodePop 350ms var(--ease-out) ${n.delay} forwards` }}
              />
            </g>
          ))}
        </svg>

        <p style={{
          fontSize: 12, fontWeight: 700, color: 'var(--accent)',
          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10,
        }}>
          Path Complete
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 10, lineHeight: 1.35 }}>
          이 길을 끝까지 걸었어요
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px', marginBottom: 6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{curriculumTitle}</strong>
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 28 }}>
          {totalSteps}개의 점이 하나의 선이 되었습니다.<br />
          완주한 Path는 나의 학습 자산으로 남아요.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px', borderRadius: 8,
              border: '1.5px solid var(--border)', background: '#fff',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            계속 보기
          </button>
          <Link
            href="/my-learning"
            style={{
              padding: '12px 22px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            내 학습 자산 보기 →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes celebFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes celebPopIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes celebDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes celebNodePop {
          from { opacity: 0; transform: scale(0.4); transform-origin: center; transform-box: fill-box; }
          to { opacity: 1; transform: scale(1); transform-origin: center; transform-box: fill-box; }
        }
      `}</style>
    </div>
  )
}
