/**
 * 연속 학습 일수(Streak) 계산
 *
 * - progress.last_accessed_at 들의 날짜(yyyy-mm-dd)를 모음
 * - 오늘 또는 어제부터 연속으로 거꾸로 카운트
 * - 오늘/어제 모두 학습 흔적이 없으면 streak = 0
 */
export function calcStreak(accessedDates: (string | Date)[]): number {
  if (!accessedDates || accessedDates.length === 0) return 0

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const days = new Set(
    accessedDates
      .map(d => (typeof d === 'string' ? new Date(d) : d))
      .filter(d => !Number.isNaN(d.getTime()))
      .map(dayKey)
  )

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  // 오늘도, 어제도 기록 없으면 streak 끊김
  if (!days.has(dayKey(today)) && !days.has(dayKey(yesterday))) return 0

  let streak = 0
  const cursor = new Date(days.has(dayKey(today)) ? today : yesterday)
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * 총 학습 시간(분) → "24시간 30분" 같은 한국어 포맷
 */
export function formatStudyTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0분'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}
