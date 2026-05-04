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
          background: percent === 100 ? 'var(--success)' : 'var(--accent)',
          borderRadius: 999,
          transition: 'width 300ms ease',
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
