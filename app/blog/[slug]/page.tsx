'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/supabase'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogPost()
  }, [slug])

  const fetchBlogPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/${slug}`)
      const result = await response.json()

      if (result.success) {
        setPost(result.data)
        setError(null)
      } else {
        setError(result.error || '블로그 포스트를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('블로그 포스트 로딩 실패:', error)
      setError('블로그 포스트를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

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
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">포스트를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/blog"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800"
            >
              ← 블로그로 돌아가기
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      {/* Blog Post */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time>
                {new Date(post.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {post.campaigns && (
                <span>카테고리: {post.campaigns.category}</span>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* CTA Section */}
          {post.campaigns && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">지금 바로 확인해보세요!</h3>
              <p className="mb-6 opacity-90">
                {post.campaigns.title}에서 특가 상품을 만나보세요
              </p>
              <a
                href={post.campaigns.partner_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                기획전 보러가기 →
              </a>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}