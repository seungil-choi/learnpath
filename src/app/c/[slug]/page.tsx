import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

/**
 * /c/[slug] → /curriculum/[id] 로 리다이렉트
 * 슬러그 기반 공유 URL을 지원합니다.
 * 예) /c/claude-work-intro → /curriculum/uuid-...
 */
export default async function SlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('curricula')
    .select('id')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) notFound()

  redirect(`/curriculum/${data.id}`)
}
