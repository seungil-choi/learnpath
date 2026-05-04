import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyLearningClient from '@/components/my-learning/MyLearningClient'

export default async function MyLearningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?next=/my-learning')

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

  const totalMinutes = completed.reduce((acc: number, p: any) => {
    return acc + (p.curricula?.estimated_duration ?? 0)
  }, 0)
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
          ? Math.round(progressList.reduce((acc: number, p: any) => acc + (p.progress_percent ?? 0), 0) / progressList.length)
          : 0,
      }}
    />
  )
}
