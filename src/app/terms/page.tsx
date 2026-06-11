import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 | LearnPath',
  description: 'LearnPath 서비스 이용약관',
}

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '제1조 (목적)',
    body: (
      <p>
        본 약관은 LearnPath(이하 &ldquo;서비스&rdquo;)가 제공하는 학습 경로 공유 서비스의 이용 조건 및 절차,
        이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
      </p>
    ),
  },
  {
    title: '제2조 (서비스의 내용)',
    body: (
      <>
        <p>서비스는 다음 기능을 제공합니다.</p>
        <ul>
          <li>학습 커리큘럼(Path) 탐색 및 학습 진행 관리</li>
          <li>학습 진도 저장 및 이어보기</li>
          <li>커리큘럼 직접 제작 및 공유</li>
          <li>외부 학습 자료(영상, 문서 등)로의 연결</li>
        </ul>
        <p>
          서비스는 현재 <strong>베타 버전</strong>으로 운영되고 있으며, 기능이 사전 고지 없이 추가·변경될 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: '제3조 (계정)',
    body: (
      <ul>
        <li>회원가입은 이메일 또는 Google 계정으로 할 수 있습니다.</li>
        <li>계정은 본인만 이용할 수 있으며, 타인에게 양도하거나 대여할 수 없습니다.</li>
        <li>탈퇴를 원하는 경우 문의처(seungil.9f@gmail.com)로 요청하면 지체 없이 처리됩니다.</li>
      </ul>
    ),
  },
  {
    title: '제4조 (이용자 제작 콘텐츠)',
    body: (
      <>
        <ul>
          <li>이용자가 제작한 커리큘럼·노트 등의 저작권은 해당 이용자에게 있습니다.</li>
          <li>
            이용자가 커리큘럼을 공개(발행)하는 경우, 서비스는 해당 콘텐츠를 서비스 내에서 노출·추천하는 데
            필요한 범위에서 사용할 수 있습니다.
          </li>
          <li>
            타인의 저작권을 침해하거나, 법령에 위반되거나, 부적절한 콘텐츠는 사전 통지 없이 비공개 처리될 수 있습니다.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '제5조 (외부 콘텐츠에 대한 책임)',
    body: (
      <p>
        서비스 내 커리큘럼은 YouTube 영상, 외부 문서 등 제3자가 제공하는 자료로 연결됩니다.
        외부 자료의 내용, 정확성, 가용성에 대한 책임은 해당 자료의 제공자에게 있으며,
        서비스는 외부 자료의 삭제·변경으로 인한 학습 중단에 대해 책임을 지지 않습니다.
      </p>
    ),
  },
  {
    title: '제6조 (서비스의 변경 및 중단)',
    body: (
      <>
        <ul>
          <li>서비스는 운영상·기술상 필요에 따라 제공하는 기능의 전부 또는 일부를 변경할 수 있습니다.</li>
          <li>
            서비스를 종료하는 경우 최소 30일 전에 공지하며, 이용자가 제작한 콘텐츠를 내보낼 수 있는
            방법을 제공하기 위해 노력합니다.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '제7조 (면책)',
    body: (
      <ul>
        <li>서비스는 무료 베타로 제공되며, 천재지변·외부 인프라 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
        <li>이용자의 학습 결과나 성과는 보장 대상이 아닙니다.</li>
      </ul>
    ),
  },
  {
    title: '제8조 (분쟁 해결 및 준거법)',
    body: (
      <p>
        본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 상호 협의로 해결하는 것을
        원칙으로 합니다.
        <br />
        <strong>시행일: 2026년 6월 11일</strong>
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 8 }}>
        Terms of Service
      </p>
      <h1 style={{ marginBottom: 12 }}>이용약관</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '24px', marginBottom: 40 }}>
        LearnPath를 이용해 주셔서 감사합니다. 서비스를 이용하시면 본 약관에 동의한 것으로 간주됩니다.
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
