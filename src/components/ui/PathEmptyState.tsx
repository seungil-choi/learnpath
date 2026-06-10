import Link from 'next/link'

/**
 * Path Metaphor 빈 상태 — "비어 있음"이 아니라 "길의 시작"으로 보여준다.
 *
 * C안 디자인 컨셉: 점선 경로 SVG(점 → 선 → 깃발)가 시그니처.
 * 모든 빈 상태(검색 결과 없음 / 진행 중 없음 / 저장 없음)에서 재사용.
 */
interface Props {
  message: string
  desc?: string
  cta?: string
  href?: string
}

export default function PathEmptyState({ message, desc, cta, href }: Props) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        border: '1px dashed var(--border)',
        borderRadius: 12,
        background: 'var(--accent-subtle)',
      }}
    >
      {/* 점선 경로 일러스트 — 점에서 출발해 깃발로 이어지는 길 */}
      <svg
        width="180"
        height="72"
        viewBox="0 0 180 72"
        fill="none"
        style={{ marginBottom: 20 }}
        aria-hidden="true"
      >
        {/* 점선 경로 */}
        <path
          d="M16 56 C 50 56 44 28 86 28 C 128 28 122 14 152 14"
          stroke="#c7c7f9"
          strokeWidth="2.5"
          strokeDasharray="6 5"
          strokeLinecap="round"
          fill="none"
        />
        {/* 출발 노드 (채워진 점) */}
        <circle cx="16" cy="56" r="6" fill="var(--accent)" />
        {/* 중간 노드 (빈 점) */}
        <circle cx="86" cy="28" r="5" fill="#fff" stroke="#c7c7f9" strokeWidth="2" />
        {/* 도착 깃발 */}
        <g transform="translate(146, 0)">
          <line x1="6" y1="14" x2="6" y2="34" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M6 14 L22 19 L6 24 Z" fill="var(--accent)" />
        </g>
      </svg>

      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {message}
      </p>
      {desc && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '20px', marginBottom: 4 }}>
          {desc}
        </p>
      )}
      {cta && href && (
        <Link
          href={href}
          style={{
            display: 'inline-block',
            marginTop: 18,
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {cta} →
        </Link>
      )}
    </div>
  )
}
