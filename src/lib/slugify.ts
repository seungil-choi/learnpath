/**
 * title → URL-safe slug 변환
 * 한글 포함 문자열을 소문자 영문/숫자/하이픈으로 변환합니다.
 * 한글은 romanize 없이 unicode 범위를 그대로 허용합니다.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣가-힣0-9\s-]/g, '') // 허용 문자 외 제거
    .replace(/\s+/g, '-')                             // 공백 → 하이픈
    .replace(/-{2,}/g, '-')                           // 연속 하이픈 축소
    .replace(/^-+|-+$/g, '')                          // 앞뒤 하이픈 제거
    .slice(0, 100)                                    // 최대 100자
}

/**
 * Supabase에서 slug 유일성을 보장합니다.
 * 충돌 시 -2, -3, ... suffix를 붙입니다.
 */
export async function uniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string,
): Promise<string> {
  let candidate = base
  let n = 2
  while (await checkExists(candidate)) {
    candidate = `${base}-${n++}`
    if (n > 99) break // 안전장치
  }
  return candidate
}
