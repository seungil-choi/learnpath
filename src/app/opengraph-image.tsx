import { ImageResponse } from 'next/og'

/**
 * 동적 OG 이미지 — 카카오톡/슬랙/트위터 공유 시 보이는 카드
 * C안 Path Metaphor: 점→선→깃발 경로 시각화가 시그니처
 */
export const runtime = 'edge'
export const alt = 'LearnPath — 나만의 학습 경로'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 50%, #f0f0ff 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 44, gap: 5 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: '#5B5CF0' }} />
            <div style={{ width: 18, height: 18, borderRadius: 5, background: '#5B5CF0', opacity: 0.55 }} />
            <div style={{ width: 18, height: 18, borderRadius: 5, background: '#5B5CF0', opacity: 0.35 }} />
            <div style={{ width: 18, height: 18, borderRadius: 5, background: '#5B5CF0', opacity: 0.75 }} />
          </div>
          <span style={{ fontSize: 44, fontWeight: 800, color: '#5B5CF0', letterSpacing: '-1px' }}>
            LearnPath
          </span>
        </div>

        {/* 메인 카피 */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 900, color: '#111111', lineHeight: 1.25, letterSpacing: '-2px' }}>
          <span>무엇부터 배울지보다,</span>
          <span style={{ display: 'flex' }}>
            <span style={{ color: '#5B5CF0' }}>어떻게 시작할지</span>가
          </span>
          <span>중요하니까.</span>
        </div>

        <div style={{ display: 'flex', fontSize: 30, color: '#6b7280', marginTop: 36, letterSpacing: '0.5px' }}>
          Follow the Path · Followable · Resumable · Shareable
        </div>

        {/* 우측 경로 시각화 — 점선 길 + 노드 + 깃발 */}
        <svg
          width="380"
          height="500"
          viewBox="0 0 380 500"
          style={{ position: 'absolute', right: 40, top: 65 }}
        >
          <path
            d="M60 440 C 180 440 140 300 240 300 C 340 300 300 160 320 100"
            stroke="#c7c7f9"
            strokeWidth="6"
            strokeDasharray="14 12"
            fill="none"
          />
          <path
            d="M60 440 C 180 440 140 300 240 300"
            stroke="#5B5CF0"
            strokeWidth="6"
            fill="none"
          />
          <circle cx="60" cy="440" r="16" fill="#5B5CF0" />
          <circle cx="240" cy="300" r="14" fill="#ffffff" stroke="#5B5CF0" strokeWidth="6" />
          <line x1="320" y1="100" x2="320" y2="40" stroke="#5B5CF0" strokeWidth="8" strokeLinecap="round" />
          <path d="M320 40 L378 58 L320 76 Z" fill="#5B5CF0" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
