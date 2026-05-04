import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      background: 'linear-gradient(160deg, #f5f4ff 0%, #eeeeff 60%, #f0f0ff 100%)',
    }}>
      {/* 404 visual */}
      <div style={{
        width: 120, height: 120, borderRadius: 999, marginBottom: 32,
        background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48,
        boxShadow: '0 12px 40px rgba(91,92,240,0.25)',
      }}>
        🔍
      </div>

      <p style={{
        fontSize: 72, fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 16,
        letterSpacing: '-2px',
      }}>
        404
      </p>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: '26px', marginBottom: 36, maxWidth: 380 }}>
        요청하신 페이지가 존재하지 않거나,<br />
        이동되었거나, 삭제되었을 수 있어요.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '12px 24px', borderRadius: 10,
          background: 'var(--accent)', color: '#fff',
          textDecoration: 'none', fontWeight: 700, fontSize: 15,
        }}>
          홈으로 돌아가기
        </Link>
        <Link href="/explore" style={{
          padding: '12px 24px', borderRadius: 10,
          border: '1.5px solid var(--accent)', color: 'var(--accent)',
          textDecoration: 'none', fontWeight: 700, fontSize: 15,
          background: '#fff',
        }}>
          커리큘럼 탐색하기
        </Link>
      </div>
    </div>
  )
}
