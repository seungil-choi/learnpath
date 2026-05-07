'use client'

import Link from 'next/link'
import { LevelBadge } from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import type { CurriculumWithCreator } from '@/lib/supabase/types'
import { getCategoryGradient, getCategoryByLabel } from '@/lib/categories'
import { ClockIcon, UsersIcon, ClipboardIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'

interface Props {
  curriculum: CurriculumWithCreator
  progress?: number
  rank?: number
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
  const gradient = getCategoryGradient(curriculum.category)
  const CatIcon = getCategoryByLabel(curriculum.category).Icon
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
              <CatIcon size={40} style={{ color: 'rgba(255,255,255,0.85)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
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
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <ClockIcon size={11} /> {duration}
            </div>
          )}
          {/* Rank overlay */}
          {rank && rank <= 3 && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontSize: 11, fontWeight: 800, color: '#fff',
              background: rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : '#b45309',
              borderRadius: 4, padding: '2px 7px',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
            }}>
              {rank}위
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <CatIcon size={11} /> {curriculum.category}
              </span>
            )}
            {curriculum.original_id && (
              <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                <ClipboardIcon size={11} /> 내 버전
              </span>
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
              {FEATURES.CARD_ENROLLMENT_COUNT && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <UsersIcon size={12} /> {curriculum.enrollment_count.toLocaleString()}명
                </span>
              )}
              {FEATURES.CARD_RATING && curriculum.avg_rating > 0 && (
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
