import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateWizard from '@/components/curriculum/CreateWizard'

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth?next=/create')

  return <CreateWizard userId={user.id} />
}
