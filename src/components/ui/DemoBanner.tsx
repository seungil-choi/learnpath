'use client'

import Link from 'next/link'

export default function DemoBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: '#fff',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>
          ✦
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14 }}>데모 모드로 둘러보는 중이에요</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
            실제 진도 저장 및 커리큘럼 제작은 로그인 후 이용할 수 있어요
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Link href="/explore" style={{
          padding: '7px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.15)',
          color: '#fff', textDecoration: 'none',
          fontSize: 13, fontWeight: 600,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          whiteSpace: 'nowrap',
        }}>
          탐색하기
        </Link>
        <Link href="/auth" style={{
          padding: '7px 14px', borderRadius: 8,
          background: '#fff',
          color: '#4f46e5', textDecoration: 'none',
          fontSize: 13, fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          시작하기 →
        </Link>
      </div>
    </div>
  )
}
