import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 | LearnPath',
  description: 'LearnPath 개인정보처리방침',
}

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    body: (
      <>
        <p>LearnPath(이하 &ldquo;서비스&rdquo;)는 회원가입 및 서비스 이용 과정에서 아래의 개인정보를 수집합니다.</p>
        <ul>
          <li><strong>필수</strong>: 이메일 주소</li>
          <li><strong>Google 계정으로 가입 시</strong>: 이메일 주소, 이름, 프로필 사진</li>
          <li><strong>서비스 이용 과정에서 생성</strong>: 닉네임, 관심 분야, 학습 진행 기록(수강 커리큘럼, 완료 단계, 마지막 접속 시각), 직접 작성한 커리큘럼·노트</li>
          <li><strong>자동 수집</strong>: 서비스 이용 기록(페이지 방문, 학습 시작/완료 이벤트)</li>
        </ul>
      </>
    ),
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    body: (
      <ul>
        <li>회원 식별, 가입 의사 확인 및 로그인 인증(매직링크 이메일 발송 포함)</li>
        <li>학습 진도 저장 및 이어보기 기능 제공</li>
        <li>관심 분야 기반 커리큘럼 추천</li>
        <li>서비스 품질 개선을 위한 통계 분석(개인 식별이 불가능한 형태로 처리)</li>
      </ul>
    ),
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    body: (
      <>
        <p>회원 탈퇴 시 수집된 개인정보는 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
        <ul>
          <li>통신비밀보호법에 따른 접속 기록: 3개월</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. 개인정보의 처리 위탁 및 국외 이전',
    body: (
      <>
        <p>서비스는 안정적인 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있으며, 위탁 처리 과정에서 개인정보가 국외에 보관됩니다.</p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> (데이터베이스 및 인증) — 보관 위치: 싱가포르(AWS ap-southeast-1) —
            이전 항목: 제1조의 수집 항목 전체 — 보유 기간: 회원 탈퇴 시까지
          </li>
          <li>
            <strong>Vercel Inc.</strong> (웹 호스팅) — 처리 위치: 미국 — 이전 항목: 서비스 접속 기록 —
            보유 기간: 호스팅 서비스 제공 기간
          </li>
        </ul>
        <p>이용자는 국외 이전을 거부할 수 있으나, 이 경우 서비스 이용이 불가능합니다.</p>
      </>
    ),
  },
  {
    title: '5. 이용자의 권리와 행사 방법',
    body: (
      <>
        <p>이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람·정정·삭제·처리정지 요구</li>
          <li>회원 탈퇴(아래 문의처로 요청 시 지체 없이 처리)</li>
        </ul>
        <p>권리 행사는 아래 문의처로 이메일을 보내주시면 본인 확인 후 지체 없이 조치합니다.</p>
      </>
    ),
  },
  {
    title: '6. 개인정보의 파기 절차 및 방법',
    body: (
      <p>
        보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 재생이 불가능한 방법으로 즉시 파기합니다.
        전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법으로 삭제합니다.
      </p>
    ),
  },
  {
    title: '7. 개인정보 보호책임자 및 문의처',
    body: (
      <>
        <ul>
          <li>개인정보 보호책임자: LearnPath 운영자</li>
          <li>문의: <a href="mailto:seungil.9f@gmail.com" style={{ color: 'var(--accent)' }}>seungil.9f@gmail.com</a></li>
        </ul>
        <p>개인정보 침해에 대한 신고나 상담이 필요한 경우 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)로 문의하실 수 있습니다.</p>
      </>
    ),
  },
  {
    title: '8. 고지 의무',
    body: (
      <p>
        본 방침의 내용이 변경되는 경우, 변경 사항 시행 7일 전부터 서비스 내 공지를 통해 알려드립니다.
        <br />
        <strong>시행일: 2026년 6월 11일</strong>
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 8 }}>
        Privacy Policy
      </p>
      <h1 style={{ marginBottom: 12 }}>개인정보처리방침</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '24px', marginBottom: 40 }}>
        LearnPath는 이용자의 개인정보를 소중히 다루며, 개인정보보호법 등 관련 법령을 준수합니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="policy-body">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h3 style={{ marginBottom: 12 }}>{s.title}</h3>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '26px' }}>
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--divider)' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          ← 홈으로 돌아가기
        </Link>
      </div>

      <style>{`
        .policy-body ul { padding-left: 20px; margin: 8px 0; }
        .policy-body li { margin-bottom: 6px; }
        .policy-body p { margin-bottom: 8px; }
      `}</style>
    </div>
  )
}
