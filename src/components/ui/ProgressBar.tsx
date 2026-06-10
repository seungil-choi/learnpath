interface ProgressBarProps {
  percent: number
  showLabel?: boolean
}

export default function ProgressBar({ percent, showLabel = false }: ProgressBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: 'var(--border)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(percent, 100)}%`,
          // 진행은 감정이다 — 100% 도달 시 시그니처 그라데이션
          background: percent === 100
            ? 'linear-gradient(90deg, var(--accent) 0%, #818cf8 100%)'
            : 'var(--accent)',
          borderRadius: 999,
          transition: 'width 600ms var(--ease-out, ease)',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 32 }}>
          {percent}%
        </span>
      )}
    </div>
  )
}
