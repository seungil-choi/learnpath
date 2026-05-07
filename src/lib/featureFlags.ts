/**
 * Feature Flags — Phase별 기능 노출 정책
 *
 * 사용자 규모에 따라 점진적으로 기능을 켭니다.
 *
 * Phase 1 (~100명) — PMF 검증 단계
 *   "사람들이 진짜 Path를 따라가고 다시 돌아오는가?"
 *   사회성/네트워크 기능은 사용자가 충분히 모인 뒤 활성화합니다.
 *
 * Phase 2 (~5,000명+) — 사회성 활성화 단계
 *   리뷰, Q&A, 커뮤니티 토픽, 추천 알고리즘, AI 기능 등.
 *
 * 플래그를 한 곳에서 관리하므로 사용자 규모가 늘면 단순히 true로 토글합니다.
 */
export const FEATURES = {
  // ── 홈 ──
  /** 홈의 "커뮤니티 인기 토픽" 섹션 */
  COMMUNITY_TOPICS: false,

  // ── 학습 상세 ──
  /** 리뷰 탭 (별점/텍스트 리뷰) */
  REVIEWS_TAB: false,
  /** Q&A 탭 (Step별 질문/답변) */
  QA_TAB: false,
  /** 추천(다른 커리큘럼) 탭 */
  RECOMMEND_TAB: false,

  // ── 학습 진행 ──
  /** 우측 사이드바의 AI 요약 (베타) 박스 */
  AI_SUMMARY: false,
  /** 우측 사이드바의 "도움이 필요하신가요? — 커뮤니티 질문" CTA */
  COMMUNITY_QUESTION_CTA: false,

  // ── 헤더 ──
  /** 한국어/영어 로케일 스위처 (영문 번역 미완 + 한국 PMF 우선) */
  LOCALE_SWITCHER: false,

  // ── 카드 / 메타 ──
  /** 카드/상세에 학습자 수 노출 (3명 학습 중 같은 작은 숫자는 부정적) */
  CARD_ENROLLMENT_COUNT: false,
  /** 카드/상세에 포크 수 노출 */
  CARD_FORK_COUNT: false,
  /** 카드에 평점 노출 (리뷰가 적을 땐 의미 없음) */
  CARD_RATING: false,

  // ── 게이미피케이션 ──
  /** Streak 배지/리워드 (단순 수치 표시는 별개) */
  STREAK_GAMIFICATION: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isEnabled(flag: FeatureKey): boolean {
  return FEATURES[flag]
}
