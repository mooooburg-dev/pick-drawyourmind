import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/supabase';

// 서버에서 블로그 포스트 데이터를 가져오는 함수
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://pick-drawyourmind.vercel.app'
        : 'http://localhost:3002');

    const response = await fetch(`${baseUrl}/api/blog`, {
      next: {
        revalidate: 60, // 1분마다 재검증
        tags: ['blog-list'],
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch blog posts:', response.status);
      return [];
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

// 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pick.drawyourmind.com';
  const pageUrl = `${baseUrl}/blog`;

  return {
    title: '블로그 - 특가 정보 및 기획전 소식',
    description:
      'AI가 엄선한 최신 기획전 정보와 특가 상품 리뷰를 확인하세요. 매일 업데이트되는 쇼핑 정보와 할인 혜택을 놓치지 마세요.',
    keywords: [
      '블로그',
      '특가정보',
      '기획전소식',
      '쿠팡리뷰',
      '할인정보',
      '쇼핑가이드',
      '상품추천',
      '세일정보',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: '블로그 - Pick 특가 정보 및 기획전 소식',
      description:
        'AI가 엄선한 최신 기획전 정보와 특가 상품 리뷰를 확인하세요.',
      type: 'website',
      url: pageUrl,
      siteName: 'Pick - 기획전 갤러리',
      images: [
        {
          url: '/api/og',
          width: 1200,
          height: 630,
          alt: 'Pick 블로그',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '블로그 - Pick 특가 정보 및 기획전 소식',
      description:
        'AI가 엄선한 최신 기획전 정보와 특가 상품 리뷰를 확인하세요.',
      images: ['/api/og'],
      creator: '@pick_deals',
    },
  };
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">블로그</h1>
              <p className="text-gray-600 mt-1">최신 기획전 정보와 소식</p>
            </div>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              갤러리로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* Blog Posts */}
      <main
        className="container mx-auto px-4 py-8"
        itemScope
        itemType="https://schema.org/Blog"
      >
        {blogPosts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              아직 블로그 포스트가 없습니다
            </h2>
            <p className="text-gray-500">
              기획전을 등록하면 자동으로 블로그 포스트가 생성됩니다.
            </p>
            <Link
              href="/admin"
              className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              기획전 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post: BlogPost) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                {post.featured_image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.tags
                      ?.slice(0, 2)
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <h2
                    className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                    itemProp="headline"
                  >
                    {post.title}
                  </h2>

                  <p
                    className="text-gray-600 text-sm mb-4 line-clamp-3"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <time
                      className="text-xs text-gray-500"
                      itemProp="datePublished"
                      dateTime={post.created_at}
                    >
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </time>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      itemProp="url"
                      prefetch={true}
                    >
                      자세히 보기 →
                    </Link>
                  </div>

                  {/* Hidden SEO metadata */}
                  <div style={{ display: 'none' }}>
                    <span
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Organization"
                    >
                      <span itemProp="name">Pick Team</span>
                    </span>
                    <span
                      itemProp="publisher"
                      itemScope
                      itemType="https://schema.org/Organization"
                    >
                      <span itemProp="name">Pick - 큐레이션 갤러리</span>
                    </span>
                    {post.featured_image_url && (
                      <img
                        itemProp="image"
                        src={post.featured_image_url}
                        alt={post.title}
                      />
                    )}
                    {post.updated_at && (
                      <time
                        itemProp="dateModified"
                        dateTime={post.updated_at}
                      ></time>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
