import Header from '@/app/components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-2 md:px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Featured Image Skeleton */}
          <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden bg-gray-200 animate-pulse" />

          {/* Header Skeleton */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="h-7 w-20 bg-blue-100 rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-blue-100 rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-blue-100 rounded-full animate-pulse" />
            </div>

            <div className="h-10 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-10 bg-gray-200 rounded animate-pulse w-2/3 mb-4" />

            <div className="flex items-center gap-4">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </header>

          {/* 쿠팡 파트너스 안내문 Skeleton */}
          <div className="bg-gray-100 rounded-lg shadow-sm p-4 md:p-8 mb-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8">
            <div className="space-y-4">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 bg-gray-200 rounded animate-pulse ${
                    i % 5 === 0 ? 'w-1/2' : i % 3 === 0 ? 'w-3/4' : 'w-full'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA Section Skeleton */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 md:p-8 text-center">
            <div className="h-8 bg-white/20 rounded animate-pulse mb-4 mx-auto w-2/3" />
            <div className="h-5 bg-white/20 rounded animate-pulse mb-6 mx-auto w-1/2" />
            <div className="h-12 bg-white rounded-lg animate-pulse mx-auto w-48" />
          </div>
        </article>
      </main>
    </div>
  );
}
