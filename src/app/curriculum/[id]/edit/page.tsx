import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CreateWizard from '@/components/curriculum/CreateWizard'

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/auth?next=/curriculum/${id}/edit`)

  const { data: curriculumRaw } = await supabase
    .from('curricula')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curriculum = curriculumRaw as any
  if (!curriculum) notFound()
  if (curriculum.creator_id !== user.id) redirect(`/curriculum/${id}`)

  const { data: steps } = await supabase
    .from('steps')
    .select('*, resources(*)')
    .eq('curriculum_id', id)
    .order('order')

  const curriculumWithSteps = {
    ...curriculum,
    steps: steps ?? [],
  }

  return <CreateWizard userId={user.id} curriculum={curriculumWithSteps as any} />
}
