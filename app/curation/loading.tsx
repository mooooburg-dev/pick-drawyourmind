import Header from '../components/Header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Category Filter Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            >
              {/* 이미지 Skeleton */}
              <div className="aspect-square bg-gray-200 animate-pulse" />
              {/* 텍스트 Skeleton */}
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="mt-2 h-6 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
