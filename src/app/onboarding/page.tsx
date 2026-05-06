import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // 이미 온보딩 완료한 사용자는 홈으로
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, display_name, interest_category_keys')
    .eq('id', user.id)
    .single()

  if (profile?.onboarded_at) redirect('/')

  // 추천 커리큘럼 (나중에 카테고리 기반 필터 가능)
  const { data: curricula } = await supabase
    .from('curricula')
    .select('id, title, subtitle, description, level, estimated_duration, enrollment_count, avg_rating, category, slug')
    .eq('is_published', true)
    .order('enrollment_count', { ascending: false })
    .limit(9)

  const { next } = await searchParams

  return (
    <OnboardingWizard
      userId={user.id}
      userEmail={user.email ?? ''}
      initialDisplayName={profile?.display_name ?? ''}
      initialCategories={profile?.interest_category_keys ?? []}
      allCurricula={(curricula ?? []) as any[]}
      nextUrl={next ?? '/'}
    />
  )
}
