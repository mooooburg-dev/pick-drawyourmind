import Header from '../components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Blog List Skeleton - 실제 레이아웃과 동일한 그리드 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* 이미지 Skeleton */}
              <div className="relative h-48 w-full bg-gray-200 animate-pulse" />

              {/* 콘텐츠 Skeleton */}
              <div className="p-6">
                {/* 태그 Skeleton */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-16 bg-blue-100 rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-blue-100 rounded-full animate-pulse" />
                </div>

                {/* 제목 Skeleton */}
                <div className="mb-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>

                {/* 요약 Skeleton */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>

                {/* 하단 정보 Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-blue-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
