import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { LocaleProvider } from '@/lib/i18n/context'
import { ToastProvider } from '@/components/ui/Toast'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  // 디스플레이 텍스트(Hero, 통계)용으로 800 추가. 900은 사용하지 않음(800으로 통일).
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LearnPath — 나만의 학습 경로',
  description: '검증된 학습 경로를 따라 배우고, 나만의 커리큘럼을 만드세요.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <MobileBottomNav />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
