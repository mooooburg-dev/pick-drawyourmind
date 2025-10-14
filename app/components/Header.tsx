'use client';

import Link from 'next/link';
import { clearAllCache } from '@/lib/cache-utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname?.startsWith('/curation')) return '기획전';
    if (pathname?.startsWith('/blog')) return '블로그';
    if (pathname?.startsWith('/admin')) return '관리자 모드';
    return '';
  };

  const getPagePath = () => {
    if (pathname?.startsWith('/curation')) return '/curation';
    if (pathname?.startsWith('/blog')) return '/blog';
    if (pathname?.startsWith('/admin')) return '/admin';
    return '/';
  };

  const pageTitle = getPageTitle();
  const pagePath = getPagePath();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-1 md:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/mondaypick.png"
                alt="Pick"
                width={32}
                height={32}
                priority
              />
              <h1 className="text-2xl font-bold text-gray-900">Pick</h1>
            </Link>
            {pageTitle && (
              <>
                <span className="text-gray-300">|</span>
                <Link
                  href={pagePath}
                  className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {pageTitle}
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/curation"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              기획전
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              블로그
            </Link>

            <button
              onClick={() => {
                // 캐시 클리어 후 데이터 새로고침
                clearAllCache();
                window.location.reload();
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
              title="캐시를 지우고 새로고침"
            >
              새로고침
            </button>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              🔒
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
