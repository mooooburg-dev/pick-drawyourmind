'use client';

import Link from 'next/link';
import { clearAllCache } from '@/lib/cache-utils';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Pick</h1>
          </div>
          <div className="flex items-center space-x-4">
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
