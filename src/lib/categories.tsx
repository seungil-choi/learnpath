/**
 * 카테고리 시스템 중앙 정의
 * CurriculumCard, ExploreClient, my-page, my-learning, CreateWizard, OnboardingWizard
 * 모두 이 파일에서 import 하여 사용
 */
import { AiIcon, CodeIcon, DesignIcon, BusinessIcon, ProductivityIcon, MarketingIcon } from '@/components/ui/icons'

export interface Category {
  key: string
  label: string
  emoji?: string        // 레거시 호환용 (seed 데이터 표시용)
  gradient: string
  Icon: React.FC<{ size?: number; style?: React.CSSProperties }>
}

export const CATEGORIES: Category[] = [
  {
    key: 'ai',
    label: 'AI·자동화',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    Icon: AiIcon,
  },
  {
    key: 'programming',
    label: '프로그래밍',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
    Icon: CodeIcon,
  },
  {
    key: 'design',
    label: '디자인',
    gradient: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
    Icon: DesignIcon,
  },
  {
    key: 'business',
    label: '비즈니스',
    gradient: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
    Icon: BusinessIcon,
  },
  {
    key: 'productivity',
    label: '생산성',
    gradient: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
    Icon: ProductivityIcon,
  },
  {
    key: 'marketing',
    label: '디지털마케팅',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    Icon: MarketingIcon,
  },
  {
    key: 'other',
    label: '기타',
    gradient: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
    Icon: CodeIcon,
  },
]

/** label 문자열로 카테고리 찾기 */
export function getCategoryByLabel(label: string | null | undefined): Category {
  const found = CATEGORIES.find(c =>
    c.label === label ||
    label?.includes(c.label) ||
    c.label?.includes(label ?? '')
  )
  return found ?? CATEGORIES[CATEGORIES.length - 1] // fallback: 기타
}

/** 카테고리 그라디언트 반환 */
export function getCategoryGradient(label: string | null | undefined): string {
  return getCategoryByLabel(label).gradient
}

/** 카테고리 아이콘 컴포넌트 반환 */
export function getCategoryIcon(label: string | null | undefined) {
  return getCategoryByLabel(label).Icon
}

/** 선택 UI용 카테고리 목록 (기타 제외) */
export const SELECTABLE_CATEGORIES = CATEGORIES.filter(c => c.key !== 'other')
