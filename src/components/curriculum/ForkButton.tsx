'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface Props {
  curriculumId: string
  userId: string | null
}

export default function ForkButton({ curriculumId, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  const handleFork = async () => {
    if (!userId) {
      router.push('/auth?next=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      // Fetch original curriculum + steps + resources
      const { data: original } = await supabase
        .from('curricula')
        .select('*, steps(*, resources(*))')
        .eq('id', curriculumId)
        .single()

      if (!original) throw new Error('Not found')

      // Create forked curriculum
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orig = original as any
      const { data: forked, error } = await supabase
        .from('curricula')
        .insert({
          title: `${orig.title} (내 버전)`,
          description: orig.description,
          goal: orig.goal,
          level: orig.level,
          estimated_duration: orig.estimated_duration,
          category: orig.category,
          creator_id: userId,
          original_id: curriculumId,
          is_published: false,
        })
        .select()
        .single()

      if (error || !forked) throw error

      // Clone steps + resources
      const stepsWithResources = (original as any).steps ?? []
      for (const step of stepsWithResources) {
        const { data: newStep } = await supabase
          .from('steps')
          .insert({
            curriculum_id: forked.id,
            title: step.title,
            description: step.description,
            order: step.order,
          })
          .select()
          .single()

        if (newStep && step.resources?.length > 0) {
          await supabase.from('resources').insert(
            step.resources.map((r: any) => ({
              step_id: newStep.id,
              type: r.type,
              url: r.url,
              title: r.title,
            }))
          )
        }
      }

      showToast('커리큘럼을 내 목록으로 가져왔어요!', 'success')
      router.push(`/curriculum/${forked.id}/edit`)
    } catch (err) {
      showToast('가져오기 중 오류가 발생했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFork}
      disabled={loading}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 0',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '가져오는 중...' : '📋 내 커리큘럼으로 가져오기'}
    </button>
  )
}
