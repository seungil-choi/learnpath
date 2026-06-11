import { NextResponse } from 'next/server'

/**
 * Supabase free tier 자동 일시정지(7일 미사용) 방지용 keep-alive.
 * vercel.json의 cron이 매일 1회 호출 — 경량 SELECT 1회로 활동 기록을 남긴다.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'env missing' }, { status: 500 })
  }

  try {
    const res = await fetch(`${url}/rest/v1/curricula?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      at: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'fetch failed' },
      { status: 502 }
    )
  }
}
