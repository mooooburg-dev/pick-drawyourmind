'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, Campaign } from '@/lib/supabase';
import ShareMenu from '@/components/ShareMenu';

interface BlogPostWithCampaign extends BlogPost {
  campaigns?: Campaign;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPostWithCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShareCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMetaTags = useCallback((post: BlogPostWithCampaign) => {
    if (typeof window === 'undefined') return;

    const title = post.title || 'Pick - 쿠팡 파트너스 기획전';
    const description = post.meta_description || post.excerpt || `${post.campaigns?.title || '특가 상품'}을 확인해보세요!`;
    const imageUrl = post.featured_image_url || post.campaigns?.image_url || '/default-og-image.png';
    const url = window.location.href;
    const siteName = 'Pick - 쿠팡 파트너스 기획전 갤러리';

    // Basic meta tags
    document.title = title;
    updateMetaTag('description', description);
    updateMetaTag('keywords', post.tags ? post.tags.join(', ') : '쿠팡, 파트너스, 특가, 쇼핑, 기획전');

    // Open Graph tags
    updateMetaTag('og:type', 'article', 'property');
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', imageUrl, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    if (post.campaigns?.category) {
      updateMetaTag('og:section', post.campaigns.category, 'property');
    }
    updateMetaTag('og:published_time', post.created_at, 'property');
    if (post.updated_at) {
      updateMetaTag('og:modified_time', post.updated_at, 'property');
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);
    updateMetaTag('twitter:url', url);

    // Additional SEO tags
    updateMetaTag('author', 'Pick Team');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Canonical URL
    updateLinkTag('canonical', url);

    // JSON-LD Structured Data
    updateJsonLD(post);
  }, []);

  const updateJsonLD = (post: BlogPostWithCampaign) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description || post.excerpt,
      image: post.featured_image_url || post.campaigns?.image_url,
      author: {
        '@type': 'Organization',
        name: 'Pick Team',
        url: 'https://pick.drawyourmind.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Pick - 쿠팡 파트너스 기획전 갤러리',
        url: 'https://pick.drawyourmind.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://pick.drawyourmind.com/logo.png'
        }
      },
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      },
      url: window.location.href,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Pick - 쿠팡 파트너스 기획전 갤러리',
        url: 'https://pick.drawyourmind.com'
      }
    };

    // Add product information if campaign exists
    if (post.campaigns) {
      const productData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: post.campaigns.title,
        image: post.campaigns.image_url,
        category: post.campaigns.category,
        url: post.campaigns.partner_link,
        brand: {
          '@type': 'Brand',
          name: '쿠팡'
        },
        offers: {
          '@type': 'Offer',
          url: post.campaigns.partner_link,
          availability: post.campaigns.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: '쿠팡'
          }
        }
      };

      // Combine blog post and product data
      structuredData['mentions'] = [productData];
    }

    // Remove existing JSON-LD
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
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

  const fetchBlogPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${slug}`);
      const result = await response.json();

      if (result.success) {
        setPost(result.data);
        setError(null);
        // Update meta tags for SEO and social sharing
        updateMetaTags(result.data);
      } else {
        setError(result.error || '블로그 포스트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('블로그 포스트 로딩 실패:', error);
      setError('블로그 포스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [slug, updateMetaTags]);

  useEffect(() => {
    fetchBlogPost();
  }, [fetchBlogPost]);

  useEffect(() => {
    // 관리자 인증 상태 확인
    const checkAdminAuth = () => {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      setIsAdmin(authStatus === 'true');
    };

    checkAdminAuth();

    // 세션 스토리지 변경 감지
    const handleStorageChange = () => {
      checkAdminAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const copyContent = useCallback(async () => {
    if (!post?.content) return;

    try {
      // HTML 태그 제거하고 텍스트만 추출
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      await navigator.clipboard.writeText(textContent);
      setCopied(true);

      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      // fallback: 텍스트 선택
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      const textArea = document.createElement('textarea');
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [post?.content]);

  const handleEdit = useCallback(() => {
    if (!post?.id) return;

    // 관리자 페이지의 블로그 관리 탭으로 이동하면서 해당 포스트 편집 모드로 설정
    const editUrl = `/admin?tab=blogs&edit=${post.id}`;
    window.open(editUrl, '_blank');
  }, [post?.id]);

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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              포스트를 찾을 수 없습니다
            </h1>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-blue-600 hover:text-blue-800">
              ← 블로그로 돌아가기
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
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
          <header className="mb-8" itemScope itemType="https://schema.org/BlogPosting">
            <div className="flex items-center gap-2 mb-4">
              {post.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" itemProp="headline">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time itemProp="datePublished" dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.campaigns && (
                <span>카테고리: {post.campaigns.category}</span>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 relative">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Share Button - Always visible */}
              <ShareMenu
                title={post?.title || ''}
                url={shareUrl}
                onCopySuccess={handleShareCopySuccess}
              />

              {/* Admin Only Buttons */}
              {isAdmin && (
                <>
                  {/* Edit Button */}
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    수정
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        복사
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            <div
              className="blog-content"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Hidden SEO meta for structured data */}
            <div style={{ display: 'none' }}>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">Pick Team</span>
                <span itemProp="url">https://pick.drawyourmind.com</span>
              </span>
              <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">Pick - 쿠팡 파트너스 기획전 갤러리</span>
                <span itemProp="url">https://pick.drawyourmind.com</span>
              </span>
              {post.featured_image_url && (
                <img itemProp="image" src={post.featured_image_url} alt={post.title} />
              )}
              {post.meta_description && (
                <span itemProp="description">{post.meta_description}</span>
              )}
              {post.updated_at && (
                <time itemProp="dateModified" dateTime={post.updated_at}></time>
              )}
            </div>
          </div>

          {/* CTA Section */}
          {post.campaigns && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                지금 바로 확인해보세요!
              </h3>
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
  );
}
