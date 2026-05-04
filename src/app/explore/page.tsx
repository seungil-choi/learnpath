import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import ExploreClient from '@/components/explore/ExploreClient'
import type { CurriculumWithCreator } from '@/lib/supabase/types'

interface SearchParams {
  q?: string
  category?: string
  level?: string
  duration?: string
  sort?: string
  view?: string
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('curricula')
    .select('*, profiles(username, avatar_url)')
    .eq('is_published', true)

  /* 필터 */
  if (params.category && params.category !== '전체') {
    query = query.eq('category', params.category)
  }
  if (params.level) {
    query = query.eq('level', params.level as 'beginner' | 'intermediate' | 'advanced')
  }
  if (params.duration) {
    query = query.lte('estimated_duration', parseInt(params.duration))
  }
  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }

  /* 정렬 */
  const sort = params.sort ?? 'popular'
  if (sort === 'popular') query = query.order('enrollment_count', { ascending: false })
  else if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'rating') query = query.order('avg_rating', { ascending: false })
  else query = query.order('enrollment_count', { ascending: false })

  const { data } = await query.limit(48)
  const curricula = (data ?? []) as CurriculumWithCreator[]

  return (
    <Suspense fallback={null}>
      <ExploreClient
        curricula={curricula}
        initialParams={{
          q: params.q ?? '',
          category: params.category ?? '전체',
          level: params.level ?? '',
          duration: params.duration ?? '',
          sort: sort,
          view: params.view ?? 'grid',
        }}
      />
    </Suspense>
  )
}
