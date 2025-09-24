'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/supabase';
import { useCacheInvalidation } from '@/lib/cache-utils';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updatePageMetadata = () => {
    if (typeof window === 'undefined') return;

    // Update document title
    document.title = '블로그 - Pick 특가 정보 및 기획전 소식';

    // Update meta description
    updateMetaTag(
      'description',
      'AI가 엄선한 최신 쿠팡 기획전 정보와 특가 상품 리뷰를 확인하세요. 매일 업데이트되는 쇼핑 정보와 할인 혜택을 놓치지 마세요.'
    );

    // Update keywords
    updateMetaTag(
      'keywords',
      '블로그, 특가정보, 기획전소식, 쿠팡리뷰, 할인정보, 쇼핑가이드, 상품추천, 세일정보'
    );

    // Open Graph
    updateMetaTag(
      'og:title',
      '블로그 - Pick 특가 정보 및 기획전 소식',
      'property'
    );
    updateMetaTag(
      'og:description',
      'AI가 엄선한 최신 쿠팡 기획전 정보와 특가 상품 리뷰를 확인하세요.',
      'property'
    );
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', window.location.href, 'property');

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', '블로그 - Pick 특가 정보 및 기획전 소식');
    updateMetaTag(
      'twitter:description',
      'AI가 엄선한 최신 쿠팡 기획전 정보와 특가 상품 리뷰를 확인하세요.'
    );

    // Canonical URL
    updateLinkTag('canonical', window.location.href);
  };

  const updateMetaTag = (
    name: string,
    content: string,
    attribute: string = 'name'
  ) => {
    let meta = document.querySelector(
      `meta[${attribute}="${name}"]`
    ) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  const updateLinkTag = (rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  };

  useEffect(() => {
    fetchBlogPosts();
    // Update page metadata for SEO
    updatePageMetadata();
  }, []); // Remove circular dependency

  // 캐시 무효화 이벤트 감지하여 데이터 새로고침
  useEffect(() => {
    const cleanup = useCacheInvalidation((eventType) => {
      if (eventType === 'all' || eventType === 'blog' || eventType === 'content') {
        console.log('캐시 무효화 감지, 블로그 데이터 새로고침 중...');
        fetchBlogPosts();
      }
    });

    return cleanup;
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);

      // 간단한 세션 저장소 캐싱 (2분)
      const cacheKey = 'blog_posts_cache';
      const cacheTimeKey = 'blog_posts_cache_time';
      const cacheTime = sessionStorage.getItem(cacheTimeKey);
      const cachedData = sessionStorage.getItem(cacheKey);

      if (
        cacheTime &&
        cachedData &&
        Date.now() - parseInt(cacheTime) < 120000
      ) {
        // 캐시된 데이터가 2분 이내면 사용
        setBlogPosts(JSON.parse(cachedData));
        setError(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/blog');
      const result = await response.json();

      if (result.success) {
        setBlogPosts(result.data);
        setError(null);

        // 캐시에 저장
        sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      } else {
        setError(result.error || '블로그 포스트를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('블로그 포스트 로딩 실패:', error);
      setError('블로그 포스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">블로그 포스트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">블로그</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Supabase에서 blog_posts 테이블을 생성해주세요.
              </p>
              <button
                onClick={fetchBlogPosts}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
