import { createClient } from '@/lib/supabase/server'
import MyLearningClient from '@/components/my-learning/MyLearningClient'
import DemoBanner from '@/components/ui/DemoBanner'

/* ── 데모용 가상 진도 데이터 (실제 커리큘럼 ID 사용) ── */
const DEMO_IN_PROGRESS = [
  {
    id: 'demo-1',
    curriculum_id: 'cd1429bd-cb66-41ff-8847-fae93525aecb',
    progress_percent: 60,
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    completed_at: null,
    curricula: {
      id: 'cd1429bd-cb66-41ff-8847-fae93525aecb',
      title: 'Claude 업무 활용 입문',
      category: 'AI·자동화',
      level: 'beginner',
      estimated_duration: 360,
      enrollment_count: 2184,
      avg_rating: 4.8,
    },
  },
  {
    id: 'demo-2',
    curriculum_id: 'da42ce6a-1bc8-4e8e-8d9d-48c4ecaf9ddd',
    progress_percent: 35,
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
    completed_at: null,
    curricula: {
      id: 'da42ce6a-1bc8-4e8e-8d9d-48c4ecaf9ddd',
      title: 'Python 데이터 분석 기초',
      category: '프로그래밍',
      level: 'beginner',
      estimated_duration: 720,
      enrollment_count: 1830,
      avg_rating: 4.7,
    },
  },
  {
    id: 'demo-3',
    curriculum_id: 'a011cec4-f6eb-40a7-bb20-28e4f0d13111',
    progress_percent: 20,
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3일 전
    completed_at: null,
    curricula: {
      id: 'a011cec4-f6eb-40a7-bb20-28e4f0d13111',
      title: 'React 완벽 가이드',
      category: '프로그래밍',
      level: 'intermediate',
      estimated_duration: 900,
      enrollment_count: 1203,
      avg_rating: 4.8,
    },
  },
]

const DEMO_COMPLETED = [
  {
    id: 'demo-c1',
    curriculum_id: 'a1d18fa6-229d-48b3-91c3-2c4960b3c599',
    progress_percent: 100,
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    curricula: {
      id: 'a1d18fa6-229d-48b3-91c3-2c4960b3c599',
      title: 'Notion으로 개인 업무 대시보드 만들기',
      category: '비즈니스',
      level: 'beginner',
      estimated_duration: 180,
      enrollment_count: 856,
      avg_rating: 4.8,
    },
  },
  {
    id: 'demo-c2',
    curriculum_id: '96f2cb0b-84a6-41c8-a617-0ee299c2b4c5',
    progress_percent: 100,
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    curricula: {
      id: '96f2cb0b-84a6-41c8-a617-0ee299c2b4c5',
      title: 'Excel 실무 활용법',
      category: '비즈니스',
      level: 'beginner',
      estimated_duration: 240,
      enrollment_count: 512,
      avg_rating: 4.6,
    },
  },
]

const DEMO_SAVES = [
  {
    curriculum_id: '6a84bf38-17bd-4fca-9eae-a5ba8831c8b7',
    created_at: new Date().toISOString(),
    curricula: {
      id: '6a84bf38-17bd-4fca-9eae-a5ba8831c8b7',
      title: 'UI/UX 디자인 시스템 구축',
      category: '디자인',
      level: 'intermediate',
      enrollment_count: 987,
      avg_rating: 4.9,
    },
  },
  {
    curriculum_id: '01cc552c-4c83-4f3a-8687-155e85ad5973',
    created_at: new Date().toISOString(),
    curricula: {
      id: '01cc552c-4c83-4f3a-8687-155e85ad5973',
      title: 'AWS 클라우드 입문',
      category: '프로그래밍',
      level: 'beginner',
      enrollment_count: 643,
      avg_rating: 4.6,
    },
  },
]

export default async function MyLearningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  /* ── 데모 모드 (비로그인) ── */
  if (!user) {
    const demoStats = {
      inProgressCount: DEMO_IN_PROGRESS.length,
      completedCount: DEMO_COMPLETED.length,
      savedCount: DEMO_SAVES.length,
      totalTime: '7시간 0분',
      overallPercent: 38,
    }
    return (
      <>
        <DemoBanner />
        <MyLearningClient
          inProgress={DEMO_IN_PROGRESS}
          completed={DEMO_COMPLETED}
          drafts={[]}
          saves={DEMO_SAVES}
          stats={demoStats}
          isDemoMode
        />
      </>
    )
  }

  /* ── 로그인 유저 실제 데이터 ── */
  const [progressResult, myCurriculaResult, savesResult] = await Promise.all([
    supabase
      .from('progress')
      .select('*, curricula(*, profiles(username, avatar_url))')
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false }),
    supabase
      .from('curricula')
      .select('*, profiles(username, avatar_url)')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('curriculum_saves')
      .select('curriculum_id, created_at, curricula(*, profiles(username, avatar_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progressList = (progressResult.data ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myCurricula = (myCurriculaResult.data ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saves = (savesResult.data ?? []) as any[]

  const inProgress = progressList.filter(p => (p.progress_percent ?? 0) > 0 && p.progress_percent < 100)
  const completed = progressList.filter(p => p.progress_percent === 100)
  const drafts = myCurricula.filter((c: any) => !c.is_published)

  const totalMinutes = completed.reduce((acc: number, p: any) =>
    acc + (p.curricula?.estimated_duration ?? 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60

  return (
    <MyLearningClient
      inProgress={inProgress}
      completed={completed}
      drafts={drafts}
      saves={saves}
      stats={{
        inProgressCount: inProgress.length,
        completedCount: completed.length,
        savedCount: saves.length,
        totalTime: totalHours > 0
          ? `${totalHours}시간${totalMins > 0 ? ` ${totalMins}분` : ''}`
          : `${totalMins > 0 ? `${totalMins}분` : '0분'}`,
        overallPercent: progressList.length > 0
          ? Math.round(progressList.reduce((acc: number, p: any) =>
              acc + (p.progress_percent ?? 0), 0) / progressList.length)
          : 0,
      }}
    />
  )
}
