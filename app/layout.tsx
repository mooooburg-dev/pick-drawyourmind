import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
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
    default: 'Pick | 기획전 갤러리',
    template: '%s | Pick - 기획전',
  },
  description:
    '최신 기획전과 이벤트를 한눈에! 먼데이픽이 엄선한 특가 상품 정보와 매일 업데이트되는 프로모션을 확인하세요.',
  keywords: [
    '쿠팡',
    '기획전',
    '특가',
    '할인',
    '이벤트',
    '프로모션',
    '쿠팡',
    '온라인쇼핑',
    '쇼핑몰',
    '세일',
    '특가정보',
  ],
  authors: [{ name: 'pick.drawyourmind.com' }],
  creator: 'pick.drawyourmind.com',
  publisher: 'Pick - 기획전 갤러리',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pick.drawyourmind.com'
  ),
  openGraph: {
    siteName: 'Pick - 기획전 갤러리',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pick | 기획전 갤러리',
    description:
      '최신 기획전과 이벤트를 한눈에! AI가 엄선한 특가 상품 정보를 확인하세요.',
    images: ['/api/og'],
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
      'naver-site-verification': '4691df5c600809ae466538729e29024f0fce7cb6',
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
      >
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YB8VTKNVJ1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YB8VTKNVJ1');
          `}
        </Script>

        {/* Google Adsense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9851663453336407"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
