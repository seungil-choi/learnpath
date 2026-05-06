'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { BookmarkIcon } from '@/components/ui/icons'

interface Props {
  curriculumId: string
  userId: string | null
  initialSaved: boolean
  hasProgress: boolean
  progressPercent: number
}

/**
 * 모바일 학습상세 페이지의 하단 고정 CTA 바
 * 시안: [북마크] [학습 시작하기 / 이어서 학습하기]
 * PC에선 숨김, 모바일(≤900px)에서만 표시
 */
export default function MobileDetailCTA({
  curriculumId,
  userId,
  initialSaved,
  hasProgress,
  progressPercent,
}: Props) {
  const supabase = createClient()
  const { showToast } = useToast()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, setPending] = useState(false)

  const ctaLabel = hasProgress
    ? progressPercent === 100
      ? '다시 보기'
      : '이어서 학습하기'
    : '학습 시작하기'

  const ctaHref = userId
    ? `/curriculum/${curriculumId}/learn`
    : `/auth?next=/curriculum/${curriculumId}/learn`

  async function toggleSave() {
    if (!userId) {
      window.location.href = `/auth?next=/curriculum/${curriculumId}`
      return
    }
    setPending(true)
    if (saved) {
      await supabase.from('curriculum_saves').delete()
        .eq('user_id', userId).eq('curriculum_id', curriculumId)
      setSaved(false)
      showToast('저장을 취소했어요', 'info')
    } else {
      await supabase.from('curriculum_saves').insert({
        user_id: userId, curriculum_id: curriculumId,
      })
      setSaved(true)
      showToast('내 학습에 저장했어요', 'success')
    }
    setPending(false)
  }

  return (
    <>
      <div className="mobile-detail-cta">
        <button
          onClick={toggleSave}
          disabled={pending}
          aria-label={saved ? '저장 취소' : '저장'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: '#fff',
            color: saved ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <BookmarkIcon size={22} style={{ fill: saved ? 'var(--accent)' : 'none' }} />
        </button>

        <Link
          href={ctaHref}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px 20px',
            borderRadius: 12,
            background: 'var(--accent)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      <style>{`
        .mobile-detail-cta {
          display: none;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
          gap: 10px;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(8px);
          border-top: 1px solid var(--border);
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
        }
        @media (max-width: 900px) {
          .mobile-detail-cta {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}
