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
  title: {
    default: 'Pick | 쿠팡 파트너스 기획전 갤러리',
    template: '%s | Pick - 쿠팡 기획전',
  },
  description:
    '최신 쿠팡 기획전과 이벤트를 한눈에! AI가 엄선한 특가 상품 정보와 매일 업데이트되는 쿠팡 파트너스 프로모션을 확인하세요.',
  keywords: [
    '쿠팡',
    '기획전',
    '특가',
    '할인',
    '이벤트',
    '프로모션',
    '쿠팡파트너스',
    '온라인쇼핑',
    '쇼핑몰',
    '세일',
    '특가정보'
  ],
  authors: [{ name: 'Pick Team' }],
  creator: 'Pick Team',
  publisher: 'Pick - 쿠팡 파트너스 기획전 갤러리',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pick.drawyourmind.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pick | 쿠팡 파트너스 기획전 갤러리',
    description: '최신 쿠팡 기획전과 이벤트를 한눈에! AI가 엄선한 특가 상품 정보를 확인하세요.',
    url: 'https://pick.drawyourmind.com',
    siteName: 'Pick - 쿠팡 파트너스 기획전 갤러리',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pick - 쿠팡 파트너스 기획전 갤러리',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pick | 쿠팡 파트너스 기획전 갤러리',
    description: '최신 쿠팡 기획전과 이벤트를 한눈에! AI가 엄선한 특가 상품 정보를 확인하세요.',
    images: ['/og-image.png'],
    creator: '@pick_deals',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'naver-site-verification': 'naver-verification-code',
    },
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
