import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileEditForm from '@/components/profile/ProfileEditForm'
import DemoBanner from '@/components/ui/DemoBanner'
import { getCategoryGradient } from '@/lib/categories'
import { PencilIcon } from '@/components/ui/icons'
import { FEATURES } from '@/lib/featureFlags'

const grad = (cat?: string) => getCategoryGradient(cat)

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
}

/* ─────── 데모 전용 정적 데이터 ─────── */
const DEMO_PROFILE = {
  displayName: '데모 사용자',
  email: 'demo@learnpath.app',
  bio: 'AI 도구와 생산성 향상에 관심이 많아요 ✨',
  initial: 'D',
  stats: [
    { label: '진행 중', value: 3, color: 'var(--accent)' },
    { label: '완료', value: 12, color: 'var(--success)' },
    { label: '학습 시간', value: '24h 30m', color: '#f59e0b' },
    { label: '제작 커리큘럼', value: 2, color: '#8b5cf6' },
  ],
}

const DEMO_IN_PROGRESS = [
  { id: 'cd1429bd-cb66-41ff-8847-fae93525aecb', title: 'Claude 업무 활용 입문', category: 'AI·자동화', pct: 60, lastDate: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'da42ce6a-1bc8-4e8e-8d9d-48c4ecaf9ddd', title: 'Python 데이터 분석 기초', category: '프로그래밍', pct: 35, lastDate: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a011cec4-f6eb-40a7-bb20-28e4f0d13111', title: 'React 완벽 가이드', category: '프로그래밍', pct: 20, lastDate: new Date(Date.now() - 86400000 * 3).toISOString() },
]

const DEMO_COMPLETED = [
  { id: 'a1d18fa6-229d-48b3-91c3-2c4960b3c599', title: 'Notion으로 개인 업무 대시보드 만들기', category: '비즈니스', completedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '96f2cb0b-84a6-41c8-a617-0ee299c2b4c5', title: 'Excel 실무 활용법', category: '비즈니스', completedAt: new Date(Date.now() - 86400000 * 14).toISOString() },
]

const DEMO_SAVES = [
  { id: '6a84bf38-17bd-4fca-9eae-a5ba8831c8b7', title: 'UI/UX 디자인 시스템 구축', category: '디자인' },
  { id: '01cc552c-4c83-4f3a-8687-155e85ad5973', title: 'AWS 클라우드 입문', category: '프로그래밍' },
]

const DEMO_MY_CURRICULA = [
  { id: 'dummy-1', title: 'ChatGPT로 콘텐츠 자동화하기', category: 'AI·자동화', is_published: true, enrollment_count: 142, updated_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'dummy-2', title: '피그마 기초 완성하기', category: '디자인', is_published: false, enrollment_count: 0, updated_at: new Date().toISOString() },
]
/* ─────────────────────────────────── */

function MyPageLayout({
  displayName, email, bio, initial, stats, isDemo = false, userId, profileBio, profileUsername,
  inProgress, completed, saves, myCurricula,
}: {
  displayName: string; email: string; bio: string | null; initial: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any[]; isDemo?: boolean; userId?: string
  profileBio?: string | null; profileUsername?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inProgress: any[]; completed: any[]; saves: any[]; myCurricula: any[]
}) {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 100px' }}>

      {/* ── 프로필 카드 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 20, padding: '36px 32px', marginBottom: 24,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: 999, background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 999, flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
            border: '3px solid rgba(255,255,255,0.2)',
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#fff', letterSpacing: '-0.3px' }}>{displayName}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{email}</p>
            {bio && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: '20px' }}>{bio}</p>}
          </div>
          {!isDemo && userId && (
            <ProfileEditForm userId={userId} initialUsername={profileUsername ?? null} initialBio={profileBio ?? null} />
          )}
          {isDemo && (
            <Link href="/auth" style={{
              padding: '7px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
            }}>
              내 계정 만들기
            </Link>
          )}
        </div>

        {/* 통계 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 28, background: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }} className="profile-stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} style={{ padding: '16px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 이어보기 ── */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>이어보기</h2>
            <Link href="/my-learning" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>전체 보기 →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inProgress.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 14, padding: '14px', background: '#fff' }}>
                <div style={{ width: 72, height: 52, borderRadius: 8, flexShrink: 0, background: grad(p.category) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent)', width: `${p.pct}%` }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{p.pct}%</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>마지막 학습 {formatDate(p.lastDate ?? p.last_accessed_at)}</p>
                </div>
                <Link href={`/curriculum/${p.id}/learn`} style={{ padding: '9px 16px', borderRadius: 9, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>이어보기</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 완료 ── */}
      {completed.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>완료한 학습 <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>{completed.length}</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {completed.map((c: any) => (
              <Link key={c.id} href={`/curriculum/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #86efac', borderRadius: 12, overflow: 'hidden', background: '#f0fdf4' }}>
                  <div style={{ height: 52, background: grad(c.category), position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: 700, color: '#15803d', background: 'rgba(240,253,244,0.9)', borderRadius: 4, padding: '1px 6px' }}>✓ 완료</div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontWeight: 700, fontSize: 13, lineHeight: '18px', marginBottom: 2, color: '#166534' }}>{c.title}</p>
                    {(c.completedAt ?? c.completed_at) && <p style={{ fontSize: 11, color: '#15803d' }}>{formatDate(c.completedAt ?? c.completed_at)}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 저장한 커리큘럼 ── */}
      {saves.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>저장한 커리큘럼 <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500 }}>{saves.length}</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {saves.map((s: any) => {
              const cur = s.curricula ?? s
              return (
                <Link key={s.id ?? s.curriculum_id} href={`/curriculum/${s.id ?? s.curriculum_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ height: 52, background: grad(cur.category) }} />
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, lineHeight: '18px', marginBottom: 2 }}>{cur.title}</p>
                      {cur.category && <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{cur.category}</p>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 내가 만든 커리큘럼 ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>내가 만든 커리큘럼</h2>
          <Link href={isDemo ? '/auth' : '/create'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            + 새로 만들기
          </Link>
        </div>
        {myCurricula.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--border)', borderRadius: 16 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <PencilIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>아직 만든 커리큘럼이 없어요</p>
            <Link href={isDemo ? '/auth' : '/create'} style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 9, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              커리큘럼 만들기 →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myCurricula.map((c: any) => (
              <div key={c.id} style={{ display: 'flex', gap: 14, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 14, padding: '14px', background: '#fff' }}>
                <div style={{ width: 72, height: 52, borderRadius: 8, flexShrink: 0, background: grad(c.category) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, padding: '2px 7px', borderRadius: 4, background: c.is_published ? '#dcfce7' : '#fef9c3', color: c.is_published ? '#15803d' : '#92400e' }}>
                      {c.is_published ? '발행됨' : '초안'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {c.category ?? '미분류'} · {formatDate(c.updated_at ?? c.created_at)}
                    {FEATURES.CARD_ENROLLMENT_COUNT && c.enrollment_count > 0 && ` · ${c.enrollment_count.toLocaleString()}명`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!isDemo && <Link href={`/curriculum/${c.id}/edit`} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>편집</Link>}
                  <Link href={isDemo ? '/auth' : `/curriculum/${c.id}`} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--accent)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{isDemo ? '가입하기' : '보기'}</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 640px) {
          .profile-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  /* ── 데모 모드 (비로그인) ── */
  if (!user) {
    return (
      <>
        <DemoBanner />
        <MyPageLayout
          displayName={DEMO_PROFILE.displayName}
          email={DEMO_PROFILE.email}
          bio={DEMO_PROFILE.bio}
          initial={DEMO_PROFILE.initial}
          stats={DEMO_PROFILE.stats}
          isDemo
          inProgress={DEMO_IN_PROGRESS}
          completed={DEMO_COMPLETED}
          saves={DEMO_SAVES}
          myCurricula={DEMO_MY_CURRICULA}
        />
      </>
    )
  }

  /* ── 로그인 유저 실제 데이터 ── */
  const [{ data: profile }, { data: progressRaw }, { data: myCurriculaRaw }, { data: savesRaw }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('progress').select('*, curricula(*, profiles(username, avatar_url))').eq('user_id', user.id).order('last_accessed_at', { ascending: false }),
    supabase.from('curricula').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
    supabase.from('curriculum_saves').select('curriculum_id, curricula(*, profiles(username, avatar_url))').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progressList = (progressRaw ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myCurricula = (myCurriculaRaw ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saves = (savesRaw ?? []) as any[]

  const inProgress = progressList.filter(p => (p.progress_percent ?? 0) > 0 && p.progress_percent < 100)
    .map((p: any) => ({
      ...p.curricula,
      id: p.curriculum_id,
      pct: p.progress_percent,
      lastDate: p.last_accessed_at,
    }))
  const completed = progressList.filter(p => p.progress_percent === 100)
    .map((p: any) => ({
      ...p.curricula,
      id: p.curriculum_id,
      completedAt: p.completed_at,
    }))
  const published = myCurricula.filter((c: any) => c.is_published)
  const drafts = myCurricula.filter((c: any) => !c.is_published)

  const totalMinutes = progressList.filter(p => p.progress_percent === 100)
    .reduce((acc: number, p: any) => acc + (p.curricula?.estimated_duration ?? 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMinsRem = totalMinutes % 60

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? '사용자'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const stats = [
    { label: '진행 중', value: inProgress.length, color: 'var(--accent)' },
    { label: '완료', value: completed.length, color: 'var(--success)' },
    { label: '학습 시간', value: totalHours > 0 ? `${totalHours}h ${totalMinsRem}m` : `${totalMinsRem}m`, color: '#f59e0b' },
    { label: '제작 커리큘럼', value: myCurricula.length, color: '#8b5cf6' },
  ]

  return (
    <MyPageLayout
      displayName={displayName}
      email={user.email ?? ''}
      bio={profile?.bio ?? null}
      initial={initial}
      stats={stats}
      userId={user.id}
      profileUsername={profile?.username ?? null}
      profileBio={profile?.bio ?? null}
      inProgress={inProgress}
      completed={completed}
      saves={saves.map((s: any) => s.curricula ? { ...s.curricula, id: s.curriculum_id } : s)}
      myCurricula={myCurricula}
    />
  )
}
