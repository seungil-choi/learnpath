/**
 * LearnPath Icon System
 * 일관된 SVG 라인 아이콘 라이브러리
 * stroke-width: 1.8 (UI 아이콘) / 2 (강조 요소)
 * viewBox: 24x24, currentColor 사용
 */

interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
  strokeWidth?: number
}

type SVGProps = IconProps & React.SVGAttributes<SVGSVGElement>

function Icon({ size = 16, strokeWidth = 1.8, children, ...props }: SVGProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

/* ─── 탐색/검색 ─── */
export function SearchIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></Icon>
}

export function CompassIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/></Icon>
}

/* ─── 학습/콘텐츠 ─── */
export function BookIcon(p: SVGProps) {
  return <Icon {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></Icon>
}

export function BookOpenIcon(p: SVGProps) {
  return <Icon {...p}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></Icon>
}

export function GraduationCapIcon(p: SVGProps) {
  return <Icon {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Icon>
}

export function ListIcon(p: SVGProps) {
  return <Icon {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Icon>
}

export function CheckSquareIcon(p: SVGProps) {
  return <Icon {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></Icon>
}

/* ─── 시간 ─── */
export function ClockIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></Icon>
}

/* ─── 사람/커뮤니티 ─── */
export function UserIcon(p: SVGProps) {
  return <Icon {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
}

export function UsersIcon(p: SVGProps) {
  return <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Icon>
}

export function MessageCircleIcon(p: SVGProps) {
  return <Icon {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Icon>
}

/* ─── 별/평점 ─── */
export function StarIcon(p: SVGProps & { filled?: boolean }) {
  const { filled, ...rest } = p
  return (
    <Icon {...rest}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Icon>
  )
}

/* ─── 저장/북마크 ─── */
export function BookmarkIcon(p: SVGProps & { filled?: boolean }) {
  const { filled, ...rest } = p
  return (
    <Icon {...rest}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill={filled ? 'currentColor' : 'none'} />
    </Icon>
  )
}

/* ─── 편집/만들기 ─── */
export function PencilIcon(p: SVGProps) {
  return <Icon {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>
}

export function PlusIcon(p: SVGProps) {
  return <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>
}

export function PlusCircleIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></Icon>
}

/* ─── 링크/외부 ─── */
export function LinkIcon(p: SVGProps) {
  return <Icon {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></Icon>
}

export function ExternalLinkIcon(p: SVGProps) {
  return <Icon {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>
}

/* ─── 파일/문서 ─── */
export function FileTextIcon(p: SVGProps) {
  return <Icon {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Icon>
}

export function ClipboardIcon(p: SVGProps) {
  return <Icon {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></Icon>
}

export function VideoIcon(p: SVGProps) {
  return <Icon {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></Icon>
}

export function GitHubIcon(p: SVGProps & { filled?: boolean }) {
  const { filled: _f, strokeWidth: _sw, ...rest } = p
  return (
    <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  )
}

/* ─── 화살표/이동 ─── */
export function ChevronRightIcon(p: SVGProps) {
  return <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>
}

export function ChevronDownIcon(p: SVGProps) {
  return <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>
}

export function ArrowRightIcon(p: SVGProps) {
  return <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>
}

export function LogOutIcon(p: SVGProps) {
  return <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
}

/* ─── 알림/상태 ─── */
export function BellIcon(p: SVGProps) {
  return <Icon {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></Icon>
}

export function CheckIcon(p: SVGProps) {
  return <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>
}

export function CheckCircleIcon(p: SVGProps) {
  return <Icon {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>
}

export function AlertCircleIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>
}

export function XIcon(p: SVGProps) {
  return <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>
}

/* ─── 레이아웃/UI ─── */
export function MenuIcon(p: SVGProps) {
  return <Icon {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>
}

export function GridIcon(p: SVGProps) {
  return <Icon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Icon>
}

export function LayoutListIcon(p: SVGProps) {
  return <Icon {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="12" width="18" height="4" rx="1"/><rect x="3" y="20" width="18" height="4" rx="1" style={{ display: 'none' }}/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>
}

export function GlobeIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18M3 12h18" strokeLinecap="round"/></Icon>
}

export function MailIcon(p: SVGProps) {
  return <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>
}

export function SendIcon(p: SVGProps) {
  return <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>
}

export function ShareIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Icon>
}

/* ─── 카테고리 아이콘 ─── */
export function AiIcon(p: SVGProps) {
  // CPU/chip 형태
  return <Icon {...p}>
    <rect x="9" y="9" width="6" height="6" rx="1"/>
    <path d="M9 1v2M15 1v2M9 21v2M15 21v2M1 9h2M1 15h2M21 9h2M21 15h2"/>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </Icon>
}

export function CodeIcon(p: SVGProps) {
  return <Icon {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>
}

export function DesignIcon(p: SVGProps) {
  // 펜촉/nib
  return <Icon {...p}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></Icon>
}

export function BusinessIcon(p: SVGProps) {
  return <Icon {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></Icon>
}

export function ProductivityIcon(p: SVGProps) {
  return <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>
}

export function MarketingIcon(p: SVGProps) {
  return <Icon {...p}><path d="M3 11l19-9-9 19-2-8-8-2z"/></Icon>
}

export function TrophyIcon(p: SVGProps) {
  return <Icon {...p}><path d="M6 9H2v-1a1 1 0 011-1h1V5h12v2h1a1 1 0 011 1v1h-4"/><path d="M6 9c0 4 3 7 6 7s6-3 6-7"/><path d="M9 21h6M12 16v5"/></Icon>
}

export function FlagIcon(p: SVGProps) {
  return <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Icon>
}

export function HeartIcon(p: SVGProps & { filled?: boolean }) {
  const { filled, ...rest } = p
  return (
    <Icon {...rest}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled ? 'currentColor' : 'none'} />
    </Icon>
  )
}

export function TargetIcon(p: SVGProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></Icon>
}

export function SparkleIcon(p: SVGProps) {
  return <Icon {...p}><path d="M12 3l1.5 5h5l-4 3 1.5 5-4-3-4 3 1.5-5-4-3h5z"/></Icon>
}

export function RocketIcon(p: SVGProps) {
  return <Icon {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></Icon>
}

export function MapIcon(p: SVGProps) {
  return <Icon {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></Icon>
}

export function WaveIcon(p: SVGProps) {
  return <Icon {...p}><path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9s3-1.5 4.5-1.5S18 9 19.5 9 21 7.5 22 6"/><path d="M2 18c1.5-3 3-4.5 4.5-4.5S9 15 10.5 15s3-1.5 4.5-1.5S18 15 19.5 15 21 13.5 22 12"/></Icon>
}
