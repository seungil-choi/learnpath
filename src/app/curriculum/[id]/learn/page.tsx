import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LearningPlayer from '@/components/curriculum/LearningPlayer'

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step: stepParam } = await searchParams
  const supabase = await createClient()

  const { data: curriculum } = await supabase
    .from('curricula')
    .select('id, title, is_published, creator_id')
    .eq('id', id)
    .single()

  if (!curriculum) notFound()

  const { data: stepsRaw } = await supabase
    .from('steps')
    .select('*, resources(*)')
    .eq('curriculum_id', id)
    .order('order')

  if (!stepsRaw || stepsRaw.length === 0) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps = stepsRaw as any[]

  const { data: { user } } = await supabase.auth.getUser()

  const { data: userProgress } = user
    ? await supabase
        .from('progress')
        .select('*')
        .eq('curriculum_id', id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  // Create progress record on first visit
  if (user && !userProgress) {
    await supabase.from('progress').insert({
      user_id: user.id,
      curriculum_id: id,
      completed_steps: [] as string[],
      progress_percent: 0,
    })
  }

  // ?step=N (0-based) takes priority, then last accessed, then 0
  const stepFromParam = stepParam !== undefined ? parseInt(stepParam) : -1
  const initialStepIdx = stepFromParam >= 0 && stepFromParam < steps.length
    ? stepFromParam
    : userProgress?.last_step_id
      ? steps.findIndex(s => s.id === userProgress.last_step_id)
      : 0

  return (
    <LearningPlayer
      curriculum={curriculum as any}
      steps={steps}
      userId={user?.id ?? null}
      initialProgress={userProgress}
      initialStepIdx={Math.max(0, initialStepIdx)}
    />
  )
}
