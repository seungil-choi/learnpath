/**
 * LearnPath Analytics
 * MVP 핵심 이벤트를 Supabase analytics_events 테이블에 기록합니다.
 * 클라이언트 전용 (브라우저에서만 호출)
 */

import { createClient } from '@/lib/supabase/client'

export type EventName =
  | 'curriculum_viewed'
  | 'curriculum_started'
  | 'curriculum_completed'
  | 'step_completed'
  | 'step_viewed'
  | 'resume_clicked'
  | 'save_toggled'
  | 'curriculum_draft_created'
  | 'curriculum_published'
  | 'search_performed'
  | 'login_completed'

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * 이벤트를 Supabase에 기록합니다.
 * 오류가 나도 UX에 영향을 주지 않도록 조용히 실패합니다.
 */
export async function track(
  eventName: EventName,
  properties: EventProperties = {},
  curriculumId?: string
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      curriculum_id: curriculumId ?? null,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.pathname : null,
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // 분석 실패는 조용히 무시
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to track event:', eventName)
    }
  }
}

/**
 * 개발 환경에서 이벤트를 콘솔에 출력합니다.
 */
export function trackDev(eventName: EventName, properties: EventProperties = {}): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [LearnPath Event] ${eventName}`, properties)
  }
}
