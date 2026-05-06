/**
 * 한국어 상대 시간 포맷
 * "방금 전", "5분 전", "3시간 전", "2일 전", "3주 전", "5개월 전", "1년 전"
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  if (Number.isNaN(diff) || diff < 0) return ''

  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}일 전`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}주 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`
  const years = Math.floor(days / 365)
  return `${years}년 전`
}
