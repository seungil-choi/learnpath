'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics/track'

interface Props {
  curriculumId: string
}

/** 커리큘럼 상세 페이지 진입 시 curriculum_viewed 이벤트를 기록합니다. */
export default function CurriculumViewTracker({ curriculumId }: Props) {
  useEffect(() => {
    track('curriculum_viewed', {}, curriculumId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId])

  return null
}
