interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'level' | 'success'
}

const levelColors: Record<string, string> = {
  beginner: '#dcfce7',
  intermediate: '#fef9c3',
  advanced: '#fee2e2',
}
const levelText: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
}
const levelTextColor: Record<string, string> = {
  beginner: '#15803d',
  intermediate: '#92400e',
  advanced: '#b91c1c',
}

export function LevelBadge({ level }: { level: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      background: levelColors[level] ?? '#f3f4f6',
      color: levelTextColor[level] ?? '#374151',
    }}>
      {levelText[level] ?? level}
    </span>
  )
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      background: variant === 'success' ? '#dcfce7' : '#f3f4f6',
      color: variant === 'success' ? '#15803d' : '#374151',
    }}>
      {children}
    </span>
  )
}
