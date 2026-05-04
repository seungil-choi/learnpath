import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditForm from '@/components/profile/ProfileEditForm'

const CATEGORY_GRADIENT: Record<string, string> = {
  'AI·자동화':  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  '프로그래밍': 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
  '디자인':     'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
  '비즈니스':   'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
  '언어':       'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
  '취미·라이프': 'linear-gradient(135deg, #16a34a 0%, #0891b2 100%)',
  '기타':       'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?next=/my-page')

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
  const completed = progressList.filter(p => p.progress_percent === 100)
  const published = myCurricula.filter((c: any) => c.is_published)
  const drafts = myCurricula.filter((c: any) => !c.is_published)

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? '사용자'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const totalMinutes = completed.reduce((acc: number, p: any) => acc + (p.curricula?.estimated_duration ?? 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMinsRem = totalMinutes % 60

  const stats = [
    { label: '진행 중', value: inProgress.length, color: 'var(--accent)' },
    { label: '완료', value: completed.length, color: 'var(--success)' },
    { label: '학습 시간', value: totalHours > 0 ? `${totalHours}h ${totalMinsRem}m` : `${totalMinsRem}m`, color: '#f59e0b' },
    { label: '제작 커리큘럼', value: myCurricula.length, color: '#8b5cf6' },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 100px' }}>

      {/* ══ 프로필 카드 ══ */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 20,
        padding: '36px 32px',
        marginBottom: 24,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG decoration */}
        <div style={{
          position: 'absolute', right: -20, top: -20,
          width: 200, height: 200, borderRadius: 999,
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: 999, flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
            border: '3px solid rgba(255,255,255,0.2)',
          }}>
            {initial}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#fff', letterSpacing: '-0.3px' }}>
              {displayName}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              {user.email}
            </p>
            {profile?.bio && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: '20px' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Edit button */}
          <ProfileEditForm
            userId={user.id}
            initialUsername={profile?.username ?? null}
            initialBio={profile?.bio ?? null}
          />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, marginTop: 28,
          background: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden',
        }} className="profile-stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: '16px 12px', textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 이어보기 ══ */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>이어보기</h2>
            <Link href="/my-learning" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              전체 보기 →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inProgress.slice(0, 3).map((p: any) => {
              const cur = p.curricula
              if (!cur) return null
              const grad = CATEGORY_GRADIENT[cur.category] ?? CATEGORY_GRADIENT['기타']
              return (
                <div key={p.id} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  border: '1px solid var(--border)', borderRadius: 14,
                  padding: '14px', background: '#fff',
                }}>
                  <div style={{
                    width: 72, height: 52, borderRadius: 8, flexShrink: 0,
                    background: grad,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{cur.title}</p>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999, background: 'var(--accent)',
                        width: `${p.progress_percent}%`, transition: 'width 400ms ease',
                      }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {p.progress_percent}% · {p.last_accessed_at ? `마지막 학습 ${formatDate(p.last_accessed_at)}` : ''}
                    </p>
                  </div>
                  <Link href={`/curriculum/${p.curriculum_id}/learn`} style={{
                    padding: '9px 16px', borderRadius: 9, flexShrink: 0,
                    background: 'var(--accent)', color: '#fff',
                    textDecoration: 'none', fontSize: 13, fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    이어보기
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ══ 완료한 학습 ══ */}
      {completed.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>완료한 학습 <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>{completed.length}</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {completed.slice(0, 6).map((p: any) => {
              const cur = p.curricula
              if (!cur) return null
              const grad = CATEGORY_GRADIENT[cur.category] ?? CATEGORY_GRADIENT['기타']
              return (
                <Link key={p.id} href={`/curriculum/${p.curriculum_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    border: '1px solid #86efac', borderRadius: 12,
                    overflow: 'hidden', background: '#f0fdf4',
                  }}>
                    <div style={{ height: 52, background: grad, position: 'relative' }}>
                      <div style={{
                        position: 'absolute', top: 6, left: 6,
                        fontSize: 10, fontWeight: 700, color: '#15803d',
                        background: 'rgba(240,253,244,0.9)', borderRadius: 4, padding: '1px 6px',
                      }}>
                        ✓ 완료
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, lineHeight: '18px', marginBottom: 2, color: '#166534' }}>
                        {cur.title}
                      </p>
                      {p.completed_at && (
                        <p style={{ fontSize: 11, color: '#15803d' }}>{formatDate(p.completed_at)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ══ 저장한 커리큘럼 ══ */}
      {saves.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>저장한 커리큘럼 <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500 }}>{saves.length}</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {saves.map((s: any) => {
              const cur = s.curricula
              if (!cur) return null
              const grad = CATEGORY_GRADIENT[cur.category] ?? CATEGORY_GRADIENT['기타']
              return (
                <Link key={s.curriculum_id} href={`/curriculum/${s.curriculum_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ height: 52, background: grad }} />
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

      {/* ══ 내가 만든 커리큘럼 ══ */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            내가 만든 커리큘럼
            {published.length > 0 && <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginLeft: 8 }}>발행 {published.length}</span>}
            {drafts.length > 0 && <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, marginLeft: 6 }}>초안 {drafts.length}</span>}
          </h2>
          <Link href="/create" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 9,
            background: 'var(--accent)', color: '#fff',
            textDecoration: 'none', fontSize: 13, fontWeight: 700,
          }}>
            + 새로 만들기
          </Link>
        </div>

        {myCurricula.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            border: '1px dashed var(--border)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6 }}>
              아직 만든 커리큘럼이 없어요
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              첫 번째 커리큘럼을 만들어보세요
            </p>
            <Link href="/create" style={{
              display: 'inline-block', padding: '10px 22px',
              borderRadius: 9, background: 'var(--accent)', color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}>
              커리큘럼 만들기 →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myCurricula.map((c: any) => {
              const grad = CATEGORY_GRADIENT[c.category] ?? CATEGORY_GRADIENT['기타']
              return (
                <div key={c.id} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  border: '1px solid var(--border)', borderRadius: 14,
                  padding: '14px', background: '#fff',
                }}>
                  <div style={{ width: 72, height: 52, borderRadius: 8, flexShrink: 0, background: grad }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title || '(제목 없음)'}
                      </p>
                      <span style={{
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        padding: '2px 7px', borderRadius: 4,
                        background: c.is_published ? '#dcfce7' : '#fef9c3',
                        color: c.is_published ? '#15803d' : '#92400e',
                      }}>
                        {c.is_published ? '발행됨' : '초안'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {c.category ?? '미분류'} · 수정 {formatDate(c.updated_at ?? c.created_at)}
                      {c.enrollment_count > 0 && ` · ${c.enrollment_count.toLocaleString()}명 수강`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link href={`/curriculum/${c.id}/edit`} style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid var(--border)', color: 'var(--text-secondary)',
                      textDecoration: 'none', fontSize: 13, fontWeight: 500,
                    }}>
                      편집
                    </Link>
                    <Link href={`/curriculum/${c.id}`} style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid var(--accent)', color: 'var(--accent)',
                      textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    }}>
                      보기
                    </Link>
                  </div>
                </div>
              )
            })}
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
