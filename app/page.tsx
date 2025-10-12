import type { Metadata } from 'next';
import Header from './components/Header';
import Link from 'next/link';

// 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pick.drawyourmind.com';

  return {
    title: 'Pick | 홈',
    description: '최신 특가 정보와 이벤트를 한눈에 확인하세요.',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'Pick | 홈',
      description: '최신 특가 정보와 이벤트를 한눈에 확인하세요.',
      url: baseUrl,
      siteName: 'Pick',
      images: [
        {
          url: '/api/og',
          width: 1200,
          height: 630,
          alt: 'Pick',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pick | 홈',
      description: '최신 특가 정보와 이벤트를 한눈에 확인하세요.',
      images: ['/api/og'],
      creator: '@pick_deals',
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pick에 오신 것을 환영합니다
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            최신 특가 정보와 이벤트를 확인하세요
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/curation"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              기획전 갤러리 보기
            </Link>
            <Link
              href="/blog"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
            >
              블로그 보기
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
              제공받을 수 있습니다.
            </p>
            <p>© 2025 Pick. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
