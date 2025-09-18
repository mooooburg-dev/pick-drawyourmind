import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pick | 쿠팡 기획전 갤러리',
  description:
    '최신 쿠팡 기획전과 이벤트를 한눈에! 매일 업데이트되는 특가 상품과 프로모션을 확인하세요.',
  keywords: '쿠팡, 기획전, 특가, 할인, 이벤트, 프로모션',
  openGraph: {
    title: 'Pick | 쿠팡 기획전 갤러리',
    description: '최신 쿠팡 기획전과 이벤트를 한눈에!',
    url: 'https://pick.drawyourmind.com',
    siteName: 'Pick - 기획전 갤러리',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
