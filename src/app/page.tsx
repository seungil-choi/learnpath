import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CurriculumCard from '@/components/curriculum/CurriculumCard'
import HomeCategorySection from '@/components/home/HomeCategorySection'
import FooterLocale from '@/components/ui/FooterLocale'
import type { CurriculumWithCreator } from '@/lib/supabase/types'

/* ─────────────────── 카테고리 매핑 ─────────────────── */
const SIDEBAR_CATEGORIES = [
  { label: '전체', value: '전체', icon: '🔥' },
  { label: 'AI · 자동화', value: 'AI·자동화', icon: '🤖' },
  { label: '프로그래밍', value: '프로그래밍', icon: '💻' },
  { label: '디자인', value: '디자인', icon: '🎨' },
  { label: '비즈니스', value: '비즈니스', icon: '💼' },
  { label: '생산성', value: '생산성', icon: '⚡' },
]

/* ─────────────────── 커뮤니티 더미 데이터 ─────────────────── */
const COMMUNITY_TOPICS = [
  { type: '질문', title: 'React에서 상태 관리를 Context API로 할 때 주의할 점은?', category: 'React', answers: 24, time: '2시간 전', likes: 35 },
  { type: '공유', title: '제가 만든 Notion 대시보드 템플릿 공유합니다!', category: '생산성', answers: 18, time: '5시간 전', likes: 52 },
  { type: '질문', title: '강의 5단계에서 막혔는데 힌트 좀 부탁드립니다 ㅠㅠ', category: 'Python', answers: 31, time: '7시간 전', likes: 28 },
  { type: '팁', title: 'Excel VLOOKUP보다 더 강력한 XLOOKUP 함수 활용법', category: 'Excel', answers: 15, time: '1일 전', likes: 41 },
  { type: '정보', title: 'AWS 프리티어로 시작할 때 추천하는 서비스 조합', category: 'AWS', answers: 27, time: '1일 전', likes: 33 },
]

const TOPIC_BADGE_COLOR: Record<string, { bg: string; color: string }> = {
  질문: { bg: '#eff6ff', color: '#1d4ed8' },
  공유: { bg: '#f0fdf4', color: '#15803d' },
  팁:  { bg: '#fef9c3', color: '#854d0e' },
  정보: { bg: '#f5f3ff', color: '#6d28d9' },
}

export default async function HomePage() {
  const supabase = await createClient()

  /* 인기 커리큘럼 (추천 학습 경로 + 인기 주제 탐색용) */
  const { data: popular } = await supabase
    .from('curricula')
    .select('*, profiles(username, avatar_url)')
    .eq('is_published', true)
    .order('enrollment_count', { ascending: false })
    .limit(12)

  const curricula = (popular ?? []) as CurriculumWithCreator[]

  /* 로그인 유저 + 진행 중 커리큘럼 */
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myProgress } = user
    ? await supabase
        .from('progress')
        .select('*, curricula(*, profiles(username, avatar_url))')
        .eq('user_id', user.id)
        .lt('progress_percent', 100)
        .order('last_accessed_at', { ascending: false })
        .limit(4)
    : { data: null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inProgress = (myProgress ?? []) as any[]

  return (
    <div>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 50%, #f0f0ff 100%)',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '72px 32px 64px',
          display: 'grid',
          gridTemplateColumns: '1fr 440px',
          gap: 60,
          alignItems: 'center',
        }} className="hero-grid">

          {/* Left: Text */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 999,
              background: 'rgba(91,92,240,0.1)',
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 24,
              letterSpacing: '0.2px',
            }}>
              <span>✦</span> 나만의 속도로, 체계적으로
            </div>

            <h1 style={{
              fontSize: 48,
              fontWeight: 900,
              lineHeight: '60px',
              letterSpacing: '-1.2px',
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}>
              배움이{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                이어지는
              </span>
              <br />
              나만의 학습 경로
            </h1>

            <p style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: '28px',
              marginBottom: 36,
              maxWidth: 480,
            }}>
              양질의 커리큘럼을 발견하고,<br />
              나만의 학습 로드맵을 만들어 체계적으로 성장하세요.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
              <Link href="/#explore" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px',
                borderRadius: 10,
                background: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 15,
                transition: 'background 150ms',
              }}>
                추천 경로 둘러보기
              </Link>
              <Link href="/create" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px',
                borderRadius: 10,
                border: '1.5px solid var(--accent)',
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 15,
                background: '#fff',
                transition: 'background 150ms',
              }}>
                나만의 경로 만들기
              </Link>
            </div>

            {/* Feature badges */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '✓', label: '검증된 커리큘럼' },
                { icon: '✓', label: '개인 맞춤 추천' },
                { icon: '✓', label: '전문 성장 추적' },
                { icon: '✓', label: '커뮤니티 연계' },
              ].map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Learning path visualization */}
          <div style={{ position: 'relative', height: 340 }} className="hero-viz">
            {/* Track line */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              viewBox="0 0 440 340"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 100 300 C 200 300 160 220 260 220 C 360 220 300 150 380 120 C 420 105 400 60 380 40"
                stroke="#c7c7f9"
                strokeWidth="3"
                strokeDasharray="8 5"
                fill="none"
              />
              {/* Completed portion (solid) */}
              <path
                d="M 100 300 C 200 300 160 220 260 220"
                stroke="var(--accent)"
                strokeWidth="3"
                fill="none"
              />
            </svg>

            {/* Stage nodes */}
            {[
              { x: 100, y: 300, label: '기초 다지기', pct: 100, done: true },
              { x: 260, y: 220, label: '핵심 개념 이해', pct: 60, done: false },
              { x: 360, y: 130, label: '실전 적용', pct: 20, done: false },
              { x: 375, y: 48, label: '마스터 단계', pct: 0, done: false, flag: true },
            ].map((node) => (
              <div key={node.label} style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
              }}>
                {/* Node bubble */}
                <div style={{
                  position: 'relative',
                  width: node.done ? 20 : 16,
                  height: node.done ? 20 : 16,
                  borderRadius: 999,
                  background: node.done ? 'var(--accent)' : node.pct > 0 ? 'var(--accent-light)' : '#e5e7eb',
                  border: `3px solid ${node.done ? 'var(--accent)' : node.pct > 0 ? 'var(--accent)' : '#d1d5db'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                }}>
                  {node.done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {node.flag && (
                    <div style={{
                      position: 'absolute', top: -32, left: 8,
                      fontSize: 20, lineHeight: 1,
                    }}>🚩</div>
                  )}
                </div>

                {/* Label card */}
                <div style={{
                  position: 'absolute',
                  left: node.x > 300 ? 'auto' : 24,
                  right: node.x > 300 ? 24 : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  minWidth: 130,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{node.label}</p>
                  {node.pct > 0 ? (
                    <>
                      <div style={{
                        height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 2,
                      }}>
                        <div style={{ height: '100%', width: `${node.pct}%`, background: node.done ? 'var(--success)' : 'var(--accent)', borderRadius: 999 }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>진행률 {node.pct}%</p>
                    </>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>진행 전</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          추천 학습 경로
      ══════════════════════════════════════ */}
      <section style={{ padding: '56px 0 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>추천 학습 경로</h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>지금 가장 인기 있는 학습 경로를 확인해보세요</p>
            </div>
            <Link href="/#explore" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              전체 보기 →
            </Link>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div style={{ paddingLeft: 32, paddingRight: 32, overflowX: 'auto' }}>
          <div style={{
            display: 'flex',
            gap: 16,
            paddingBottom: 8,
            width: 'max-content',
          }} className="category-scroll">
            {curricula.slice(0, 8).map(c => (
              <div key={c.id} style={{ width: 240, flexShrink: 0 }}>
                <CurriculumCard curriculum={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          인기 주제 탐색
      ══════════════════════════════════════ */}
      <section id="explore" style={{ padding: '56px 0 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>인기 주제 탐색</h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>관심 있는 주제를 선택해보세요</p>
            </div>
          </div>
        </div>

        <HomeCategorySection
          curricula={curricula}
          categories={SIDEBAR_CATEGORIES}
        />
      </section>

      {/* ══════════════════════════════════════
          내 학습 현황 (로그인 시)
      ══════════════════════════════════════ */}
      {user && inProgress.length > 0 && (
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 4 }}>내 학습 현황</h2>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>현재 진행 중인 학습을 이어가세요</p>
              </div>
              <Link href="/my-learning" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                전체 보기 →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {inProgress.map((p) => {
                const cur = p.curricula
                if (!cur) return null
                return (
                  <div key={p.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#fff',
                  }}>
                    {/* Thumbnail */}
                    <div style={{
                      height: 80,
                      background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: 8, left: 8,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 6, padding: '2px 8px',
                        fontSize: 11, fontWeight: 600, color: '#fff',
                      }}>
                        진행 중
                      </div>
                    </div>
                    <div style={{ padding: '14px' }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: '20px' }}>{cur.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                        {p.progress_percent}% 완료
                      </p>
                      {/* Progress bar */}
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ height: '100%', width: `${p.progress_percent}%`, background: 'var(--accent)', borderRadius: 999 }} />
                      </div>
                      <Link href={`/curriculum/${cur.id}/learn`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '9px',
                        borderRadius: 8, border: '1.5px solid var(--accent)',
                        color: 'var(--accent)', textDecoration: 'none',
                        fontSize: 13, fontWeight: 700,
                      }}>
                        이어보기 →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          커뮤니티 인기 토픽
      ══════════════════════════════════════ */}
      <section style={{ padding: '56px 0 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>커뮤니티 인기 토픽</h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>지금 뜨고 있는 주제를 확인해보세요</p>
            </div>
            <a href="#" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              커뮤니티 전체 보기 →
            </a>
          </div>

          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
            background: '#fff',
          }}>
            {COMMUNITY_TOPICS.map((topic, i) => {
              const badge = TOPIC_BADGE_COLOR[topic.type] ?? { bg: '#f5f5f5', color: '#6b7280' }
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: i < COMMUNITY_TOPICS.length - 1 ? '1px solid var(--divider)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  className="menu-item"
                >
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 6,
                    background: badge.bg, color: badge.color,
                    whiteSpace: 'nowrap',
                  }}>
                    {topic.type}
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic.title}
                  </p>
                  <span style={{
                    fontSize: 12, color: 'var(--text-tertiary)',
                    padding: '2px 8px', background: 'var(--surface)', borderRadius: 4,
                    whiteSpace: 'nowrap',
                  }}>
                    {topic.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    답변 {topic.answers} · {topic.time}
                  </span>
                  <span style={{ fontSize: 12, color: '#ef4444', whiteSpace: 'nowrap' }}>
                    ♥ {topic.likes}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          Footer CTA
      ══════════════════════════════════════ */}
      <section style={{ padding: '64px 32px 0', marginTop: 64 }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          background: 'linear-gradient(135deg, #f5f4ff 0%, #eeeeff 100%)',
          border: '1px solid #c7c7f9',
          borderRadius: 20,
          padding: '56px 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 48,
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* BG decoration */}
          <div style={{
            position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)',
            width: 200, height: 200, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(91,92,240,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
              ✦ 지금 바로 시작하세요
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 10 }}>
              나만의 <span style={{ color: 'var(--accent)' }}>학습 여정</span>을 시작하세요
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '22px' }}>
              수천 개의 검증된 커리큘럼과 함께 성장의 길을 걸어보세요.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link href="/#explore" style={{
              padding: '12px 22px',
              borderRadius: 10,
              border: '1.5px solid var(--accent)',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              background: '#fff',
              whiteSpace: 'nowrap',
            }}>
              추천 경로 둘러보기
            </Link>
            <Link href="/create" style={{
              padding: '12px 22px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}>
              나만의 경로 만들기
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          Dark Footer
      ══════════════════════════════════════ */}
      <footer style={{
        background: '#0f0d2e',
        color: '#fff',
        marginTop: 64,
        padding: '56px 0 0',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr 1fr 1fr 1fr',
            gap: 40,
            marginBottom: 48,
          }} className="footer-grid">

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  {[1,0.55,0.35,0.75].map((op, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: 2, background: '#fff', opacity: op }} />
                  ))}
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>LearnPath</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: '20px', marginBottom: 20 }}>
                체계적인 학습 경로로<br />당신의 성장을 함께합니다
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* GitHub */}
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'background 150ms, color 150ms' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
                {/* X (Twitter) */}
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'background 150ms, color 150ms' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'background 150ms, color 150ms' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
                {/* Discord */}
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'background 150ms, color 150ms' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: '서비스',
                links: ['탐색', '학습 로드맵', '만들기', '커뮤니티', '내 학습'],
              },
              {
                title: '회사',
                links: ['회사 소개', '블로그', '채용', '문의하기'],
              },
              {
                title: '지원',
                links: ['도움말 센터', '이용 가이드', '자주 묻는 질문', '피드백'],
              },
              {
                title: '정책',
                links: ['이용약관', '개인정보처리방침', '쿠키 정책', '콘텐츠 가이드라인'],
              },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 16 }}>
                  {col.title}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 150ms' }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} LearnPath. All rights reserved.
            </p>
            <FooterLocale />
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-viz { display: none !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
