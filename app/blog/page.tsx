'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/supabase';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog');
      const result = await response.json();

      if (result.success) {
        setBlogPosts(result.data);
        setError(null);
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
      <main className="container mx-auto px-4 py-8">
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

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <time className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </time>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      자세히 보기 →
                    </Link>
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
