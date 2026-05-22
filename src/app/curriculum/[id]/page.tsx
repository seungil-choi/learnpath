import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import DetailSidebar from '@/components/curriculum/DetailSidebar'
import DetailTabs from '@/components/curriculum/DetailTabs'
import CurriculumViewTracker from '@/components/curriculum/CurriculumViewTracker'
import MobileDetailCTA from '@/components/curriculum/MobileDetailCTA'
import { FEATURES } from '@/lib/featureFlags'

function formatDuration(minutes: number) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

const CATEGORY_BG: Record<string, string> = {
  'AI·자동화':   'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
  '프로그래밍':  'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
  '디자인':      'linear-gradient(135deg, #500724 0%, #9d174d 50%, #be185d 100%)',
  '비즈니스':    'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
  '언어':        'linear-gradient(135deg, #451a03 0%, #92400e 50%, #b45309 100%)',
  '취미·라이프': 'linear-gradient(135deg, #052e16 0%, #166534 50%, #15803d 100%)',
  '기타':        'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
}

/* ── SEO 메타태그 ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('curricula')
    .select('title, description, category, level, thumbnail_url')
    .eq('id', id)
    .single()

  if (!data) return { title: 'LearnPath' }

  const levelLabel = { beginner: '초급', intermediate: '중급', advanced: '고급' }[data.level] ?? ''
  const title = `${data.title} | LearnPath`
  const description = data.description ?? `${levelLabel} 수준의 ${data.category ?? ''} 커리큘럼입니다.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  }
}

export default async function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: curriculumData } = await supabase
    .from('curricula')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single()

  if (!curriculumData) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curriculum = curriculumData as any

  const { data: stepsData } = await supabase
    .from('steps')
    .select('*, resources(*)')
    .eq('curriculum_id', id)
    .order('order')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps = (stepsData ?? []) as any[]

  const { data: { user } } = await supabase.auth.getUser()

  const { data: userProgress } = user
    ? await supabase
        .from('progress')
        .select('*')
        .eq('curriculum_id', id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const isCreator = user?.id === curriculum.creator_id
  // 저장 여부
  const { data: saveRow } = user
    ? await supabase
        .from('curriculum_saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('curriculum_id', id)
        .maybeSingle()
    : { data: null }
  const initialSaved = !!saveRow

  const duration = formatDuration(curriculum.estimated_duration)
  const targetAudience: string[] = curriculum.target_audience ?? []
  const prerequisites: string[] = curriculum.prerequisites ?? []
  const learningGoals: string[] = curriculum.learning_goals ?? []
  const completionResult: string | null = curriculum.completion_result ?? null
  const thumbnailUrl: string | null = curriculum.thumbnail_url ?? null
  const heroBg = curriculum.category ? (CATEGORY_BG[curriculum.category] ?? CATEGORY_BG['기타']) : CATEGORY_BG['기타']

  return (
    <div>
      <CurriculumViewTracker curriculumId={id} />

      {/* ── Dark Hero Section ── */}
      <div style={{ background: heroBg, color: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 0' }}>

          {/* Breadcrumb */}
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 24,
          }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>홈</Link>
            <span>/</span>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>탐색</Link>
            {curriculum.category && (
              <>
                <span>/</span>
                <span>{curriculum.category}</span>
              </>
            )}
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {curriculum.title}
            </span>
          </div>

          {/* Hero grid: text + thumbnail */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 48,
            alignItems: 'flex-start',
          }}>
            <div>
              {/* Category badge */}
              {curriculum.category && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.18)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: 16,
                  backdropFilter: 'blur(4px)',
                }}>
                  커리큘럼 · {curriculum.category}
                </div>
              )}

              {/* Title */}
              <h1 style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.6px',
                lineHeight: '42px',
                marginBottom: 12,
                color: '#fff',
              }}>
                {curriculum.title}
              </h1>

              {/* Description */}
              {curriculum.description && (
                <p style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: '26px',
                  marginBottom: 20,
                  maxWidth: 600,
                }}>
                  {curriculum.description}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                {curriculum.level && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ opacity: 0.6 }}>난이도</span>
                    <span style={{ fontWeight: 700 }}>{LEVEL_LABEL[curriculum.level] ?? curriculum.level}</span>
                  </div>
                )}
                {FEATURES.CARD_RATING && curriculum.avg_rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ color: '#fbbf24' }}>★</span>
                    <span style={{ fontWeight: 700 }}>{curriculum.avg_rating.toFixed(1)}</span>
                    <span style={{ opacity: 0.5 }}>({(curriculum.rating_count ?? 0).toLocaleString()})</span>
                  </div>
                )}
                {duration && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ opacity: 0.6 }}>총</span>
                    <span style={{ fontWeight: 700 }}>{duration}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ opacity: 0.6 }}>Step</span>
                  <span style={{ fontWeight: 700 }}>{steps.length}개</span>
                </div>
                {FEATURES.CARD_ENROLLMENT_COUNT && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ fontWeight: 700 }}>{curriculum.enrollment_count.toLocaleString()}명</span>
                    <span style={{ opacity: 0.6 }}>수강</span>
                  </div>
                )}
              </div>

              {/* Creator */}
              {curriculum.profiles?.username && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {curriculum.profiles.username[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                    {curriculum.profiles.username}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div style={{
              width: 200,
              aspectRatio: '4/3',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.12)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
            }} className="hero-thumbnail">
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt={curriculum.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 48 }}>
                  {(({ 'AI·자동화': '🤖', '프로그래밍': '💻', '디자인': '🎨', '비즈니스': '💼', '언어': '🌏', '취미·라이프': '🌿' } as Record<string, string>)[curriculum.category]) ?? '📚'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content + Sidebar ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 80px' }}>
        <div className="detail-grid" style={{ paddingTop: 40 }}>

          {/* ── Main Column: Tab 기반 ── */}
          <div>
            <DetailTabs
              curriculumId={id}
              steps={steps}
              completedStepIds={userProgress?.completed_steps ?? []}
              learningGoals={learningGoals.length > 0 ? learningGoals : curriculum.goal ? [curriculum.goal] : []}
              targetAudience={targetAudience}
              prerequisites={prerequisites}
              completionResult={completionResult}
              avgRating={curriculum.avg_rating}
              ratingCount={curriculum.rating_count ?? 0}
              enrollmentCount={curriculum.enrollment_count}
            />
          </div>

          {/* ── Sticky Sidebar (PC 전용 — 모바일은 하단 고정 CTA로 대체) ── */}
          <div className="detail-sidebar pc-only-sidebar" style={{ position: 'sticky', top: 80 }}>
            <DetailSidebar
              curriculumId={id}
              userId={user?.id ?? null}
              isCreator={isCreator}
              duration={duration}
              stepsCount={steps.length}
              enrollmentCount={curriculum.enrollment_count}
              avgRating={curriculum.avg_rating}
              ratingCount={curriculum.rating_count ?? 0}
              completionResult={completionResult}
              targetAudience={targetAudience}
              userProgress={userProgress ? {
                progressPercent: userProgress.progress_percent,
                completedStepsCount: userProgress.completed_steps?.length ?? 0,
              } : null}
              steps={steps.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }))}
            />
          </div>

        </div>
      </div>

      {/* 모바일 전용 하단 고정 CTA */}
      <MobileDetailCTA
        curriculumId={id}
        userId={user?.id ?? null}
        initialSaved={initialSaved}
        hasProgress={!!userProgress}
        progressPercent={userProgress?.progress_percent ?? 0}
      />

      <style>{`
        @media (max-width: 900px) {
          .hero-thumbnail { display: none !important; }
          .pc-only-sidebar { display: none !important; }
          /* 하단 고정 CTA 가림 방지 */
          body { padding-bottom: 88px; }
        }
      `}</style>
    </div>
  )
}
