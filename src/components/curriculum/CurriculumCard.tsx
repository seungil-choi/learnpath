'use client'

import Link from 'next/link'
import { LevelBadge } from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import type { CurriculumWithCreator } from '@/lib/supabase/types'

interface Props {
  curriculum: CurriculumWithCreator
  progress?: number
  rank?: number
}

const CATEGORY_ICON: Record<string, string> = {
  'AI·자동화': '🤖',
  '프로그래밍': '💻',
  '디자인': '🎨',
  '비즈니스': '💼',
  '언어': '🌏',
  '취미·라이프': '🌿',
  '기타': '📦',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  'AI·자동화':  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  '프로그래밍': 'linear-gradient(135deg, #0284c7 0%, #5B5CF0 100%)',
  '디자인':     'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
  '비즈니스':   'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
  '언어':       'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
  '취미·라이프': 'linear-gradient(135deg, #16a34a 0%, #0891b2 100%)',
  '기타':       'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
}

function formatDuration(minutes: number) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export default function CurriculumCard({ curriculum, progress, rank }: Props) {
  const duration = formatDuration(curriculum.estimated_duration)
  const catIcon = curriculum.category ? CATEGORY_ICON[curriculum.category] : null
  const gradient = curriculum.category ? CATEGORY_GRADIENT[curriculum.category] : CATEGORY_GRADIENT['기타']
  const thumbnail = (curriculum as any).thumbnail_url as string | null

  return (
    <Link href={`/curriculum/${curriculum.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <div className="curriculum-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

        {/* Thumbnail */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={curriculum.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                {catIcon ?? '📚'}
              </span>
            </div>
          )}
          {/* Duration pill overlay */}
          {duration && (
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: 11, fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}>
              ⏱ {duration}
            </div>
          )}
          {/* Rank medal overlay */}
          {rank && rank <= 3 && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontSize: 20,
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
            }}>
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 14 }}>

          {/* Top row: level + category + fork */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <LevelBadge level={curriculum.level} />
            {curriculum.category && (
              <span style={{
                fontSize: 11,
                padding: '2px 7px',
                background: 'var(--surface)',
                borderRadius: 4,
                color: 'var(--text-tertiary)',
                fontWeight: 500,
              }}>
                {catIcon} {curriculum.category}
              </span>
            )}
            {curriculum.original_id && (
              <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 'auto' }}>📋 내 버전</span>
            )}
          </div>

          {/* Title + description */}
          <div style={{ flex: 1, marginBottom: 10 }}>
            <h3 style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 4,
              lineHeight: '22px',
              letterSpacing: '-0.2px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {curriculum.title}
            </h3>
            {curriculum.description && (
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: '20px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {curriculum.description}
              </p>
            )}
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div style={{ marginBottom: 10 }}>
              <ProgressBar percent={progress} showLabel />
            </div>
          )}

          {/* Footer: stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 8,
            borderTop: '1px solid var(--divider)',
            gap: 8,
            marginTop: 'auto',
          }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                👥 {curriculum.enrollment_count.toLocaleString()}명
              </span>
              {curriculum.avg_rating > 0 && (
                <span style={{ fontSize: 12, color: '#f59e0b', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  ★ {Number(curriculum.avg_rating).toFixed(1)}
                </span>
              )}
            </div>
            {curriculum.profiles?.username && (
              <span style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                flexShrink: 0,
                maxWidth: 80,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                by {curriculum.profiles.username}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
