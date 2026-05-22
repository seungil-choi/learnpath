'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FileTextIcon, GitHubIcon, LinkIcon, ClockIcon, VideoIcon } from '@/components/ui/icons'

interface Resource {
  id: string
  type: string
  url: string
  title: string | null
}

interface Step {
  id: string
  title: string
  description: string | null
  estimated_duration?: number | null
  resources: Resource[]
}

interface Props {
  steps: Step[]
  completedStepIds: string[]
  curriculumId: string
}

const RESOURCE_TYPE_ICON: Record<string, React.ReactNode> = {
  video: <VideoIcon size={14} />,
  article: <FileTextIcon size={14} />,
  github: <GitHubIcon size={14} />,
  other: <LinkIcon size={14} />,
}

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  video: '영상',
  article: '아티클',
  github: 'GitHub',
  other: '링크',
}

const RESOURCE_TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  video:   { bg: '#fef2f2', color: '#dc2626' },
  article: { bg: '#eff6ff', color: '#1d4ed8' },
  github:  { bg: '#f9fafb', color: '#1f2937' },
  other:   { bg: 'var(--surface)', color: 'var(--text-secondary)' },
}

export default function StepAccordion({ steps, completedStepIds, curriculumId }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {steps.map((step, idx) => {
        const isCompleted = completedStepIds.includes(step.id)
        const isOpen = openIdx === idx
        const dur = step.estimated_duration

        return (
          <div
            key={step.id}
            style={{
              border: `1px solid ${isCompleted ? '#86efac' : isOpen ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12,
              overflow: 'hidden',
              background: isCompleted ? '#f0fdf4' : '#fff',
              transition: 'border-color 150ms',
            }}
          >
            {/* ── Header ── */}
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              {/* Step number / check */}
              <div style={{
                width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: isCompleted ? 'var(--success)' : isOpen ? 'var(--accent)' : 'var(--surface)',
                color: (isCompleted || isOpen) ? '#fff' : 'var(--text-secondary)',
              }}>
                {isCompleted
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  : idx + 1}
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: 14, lineHeight: '20px',
                  color: isOpen ? 'var(--accent)' : isCompleted ? '#15803d' : 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {step.title}
                </p>
                {!isOpen && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    {dur && (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ClockIcon size={12} /> {dur}분
                      </span>
                    )}
                    {step.resources.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FileTextIcon size={12} /> 자료 {step.resources.length}개
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Completion badge */}
              {isCompleted && (
                <span style={{
                  fontSize: 11, color: '#15803d', fontWeight: 700,
                  padding: '2px 7px', background: '#dcfce7', borderRadius: 4, flexShrink: 0,
                }}>완료</span>
              )}

              {/* Duration badge (when closed) */}
              {!isCompleted && dur && !isOpen && (
                <span style={{
                  fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {dur}분
                </span>
              )}

              {/* Chevron */}
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ flexShrink: 0, transition: 'transform 200ms', transform: isOpen ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M3 5l4 4 4-4" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── Expanded body ── */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--divider)' }}>

                {/* Description */}
                {step.description && (
                  <p style={{
                    padding: '12px 16px 8px',
                    fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px',
                  }}>
                    {step.description}
                  </p>
                )}

                {/* Resources */}
                {step.resources.length > 0 && (
                  <div style={{ padding: '4px 16px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {step.resources.map(r => {
                      const badge = RESOURCE_TYPE_COLOR[r.type] ?? RESOURCE_TYPE_COLOR.other
                      return (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            textDecoration: 'none', color: 'inherit',
                            padding: '9px 12px', borderRadius: 8,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            transition: 'border-color 150ms, background 150ms',
                          }}
                          className="resource-link-compact"
                        >
                          <span style={{
                            fontSize: 11, padding: '2px 8px',
                            background: badge.bg, color: badge.color,
                            borderRadius: 4, whiteSpace: 'nowrap',
                            flexShrink: 0, fontWeight: 600,
                          }}>
                            {RESOURCE_TYPE_ICON[r.type]} {RESOURCE_TYPE_LABEL[r.type] ?? '링크'}
                          </span>
                          <span style={{
                            fontSize: 13, color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                          }}>
                            {r.title ?? r.url}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      )
                    })}
                  </div>
                )}

                {/* CTA */}
                <div style={{ padding: '4px 16px 14px' }}>
                  <Link
                    href={`/curriculum/${curriculumId}/learn?step=${idx}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 0', borderRadius: 8,
                      background: isCompleted ? 'var(--success)' : 'var(--accent)',
                      color: '#fff', textDecoration: 'none',
                      fontSize: 14, fontWeight: 700,
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" fill="rgba(255,255,255,0.25)" />
                          <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        완료 — 다시 학습하기
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 3l6 4-6 4V3z" fill="#fff" />
                        </svg>
                        이 Step 학습하기
                      </>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
