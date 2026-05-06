import Link from 'next/link'
import { timeAgo } from '@/lib/timeAgo'
import { getCategoryGradient } from '@/lib/categories'
import { ClockIcon, BookOpenIcon } from '@/components/ui/icons'

/**
 * Resume First — 로그인 사용자에게 가장 먼저 보여줘야 하는 화면
 *
 * "학습은 멈춥니다. Path는 이어집니다." (LearnPath 핵심 메시지)
 *
 * - 가장 최근 멈춘 Path 1개를 큰 카드로
 * - "N일 전에 멈췄어요 → 마지막 Step 제목에서 이어보기"
 * - 진행률 바
 */
interface ResumeItem {
  curriculum_id: string
  progress_percent: number
  last_accessed_at: string
  last_step_id: string | null
  curricula: {
    id: string
    title: string
    category: string | null
  } | null
  // 마지막 Step의 제목 (선택, 있으면 더 구체적)
  last_step_title?: string | null
  // 마지막 Step 인덱스 (1-based)
  last_step_index?: number | null
  total_steps?: number | null
}

interface Props {
  primary: ResumeItem
  secondary?: ResumeItem[]
  userName?: string | null
}

export default function ResumeHero({ primary, secondary, userName }: Props) {
  const cur = primary.curricula
  if (!cur) return null

  const gradient = getCategoryGradient(cur.category ?? undefined)
  const since = timeAgo(primary.last_accessed_at)
  const stepLabel =
    primary.last_step_index && primary.total_steps
      ? `Step ${primary.last_step_index}/${primary.total_steps}`
      : null

  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 50%, #f0f0ff 100%)',
        padding: '40px 0 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        {/* 인사말 */}
        <div style={{ marginBottom: 18 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            • Resume Where You Left Off
          </p>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#1e1b4b',
            }}
          >
            {userName ? `${userName}님, ` : ''}이어서 학습할까요?
          </h2>
        </div>

        {/* 메인 Resume 카드 */}
        <Link
          href={`/curriculum/${cur.id}/learn`}
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr auto',
            gap: 24,
            alignItems: 'center',
            padding: 20,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(91,92,240,0.08)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 150ms, box-shadow 200ms',
          }}
          className="resume-card"
        >
          {/* 썸네일 */}
          <div
            style={{
              width: 220,
              height: 124,
              borderRadius: 12,
              background: gradient,
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: 12,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                background: 'rgba(0,0,0,0.32)',
                padding: '3px 9px',
                borderRadius: 6,
                backdropFilter: 'blur(4px)',
              }}
            >
              {cur.category ?? '커리큘럼'}
            </span>
          </div>

          {/* 본문 */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--text-tertiary)',
                marginBottom: 8,
              }}
            >
              <ClockIcon size={13} />
              {since}에 멈췄어요
            </div>

            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 8,
                lineHeight: '24px',
                letterSpacing: '-0.3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {cur.title}
            </h3>

            {primary.last_step_title && (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <BookOpenIcon size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stepLabel ? `${stepLabel} · ` : ''}
                  {primary.last_step_title}에서 이어보기
                </span>
              </p>
            )}

            {/* 진행률 바 */}
            <div
              style={{
                height: 6,
                background: 'var(--border)',
                borderRadius: 999,
                overflow: 'hidden',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${primary.progress_percent}%`,
                  background: 'linear-gradient(90deg, var(--accent) 0%, #818cf8 100%)',
                  borderRadius: 999,
                  transition: 'width 600ms ease',
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              진행률 {primary.progress_percent}%
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 22px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            이어서 학습 →
          </div>
        </Link>

        {/* 보조: 다른 진행 중 Path 작은 카드 */}
        {secondary && secondary.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}
          >
            {secondary.map(item => {
              const c = item.curricula
              if (!c) return null
              const g = getCategoryGradient(c.category ?? undefined)
              return (
                <Link
                  key={item.curriculum_id}
                  href={`/curriculum/${c.id}/learn`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 150ms',
                  }}
                  className="resume-mini"
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      background: g,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                      {timeAgo(item.last_accessed_at)} · {item.progress_percent}%
                    </p>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.progress_percent}%`,
                          background: 'var(--accent)',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .resume-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(91,92,240,0.16);
        }
        .resume-mini:hover {
          border-color: var(--accent) !important;
        }
        @media (max-width: 768px) {
          .resume-card {
            grid-template-columns: 1fr !important;
          }
          .resume-card > div:first-child {
            width: 100% !important;
            height: 140px !important;
          }
        }
      `}</style>
    </section>
  )
}
