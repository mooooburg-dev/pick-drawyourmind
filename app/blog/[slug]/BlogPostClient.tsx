'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, Campaign } from '@/lib/supabase';
import ShareMenu from '@/components/ShareMenu';
import GoogleAd from '@/components/GoogleAd';
import Header from '@/app/components/Header';

interface BlogPostWithCampaign extends BlogPost {
  campaigns?: Campaign;
}

interface BlogPostClientProps {
  initialPost: BlogPostWithCampaign;
}

export default function BlogPostClient({ initialPost }: BlogPostClientProps) {
  const [post] = useState<BlogPostWithCampaign | null>(initialPost);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>('');

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShareCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 블로그 내용 중간에 파트너스 링크 버튼을 삽입하는 함수
  const insertPartnerButtons = useCallback(
    (content: string, partnerLink: string, campaignTitle: string) => {
      if (!content || !partnerLink) return content;
      if (typeof window === 'undefined') return content; // 서버에서는 원본 반환

      // HTML을 파싱해서 적절한 위치 찾기
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const paragraphs = doc.querySelectorAll('p, h2, h3');

      if (paragraphs.length < 3) return content; // 너무 짧은 글은 버튼 삽입 안함

      // 첫 번째 버튼: 전체 길이의 1/3 지점
      const firstButtonIndex = Math.floor(paragraphs.length / 3);
      // 두 번째 버튼: 전체 길이의 2/3 지점
      const secondButtonIndex = Math.floor((paragraphs.length * 2) / 3);

      const partnerButtonHtml = `
      <div class="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div class="text-center">
          <div class="mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ⭐ 특가 혜택
            </span>
          </div>
          <h4 class="text-lg font-bold text-gray-900 mb-3">${campaignTitle.trim()} 확인하기</h4>
          <p class="text-gray-600 mb-4 text-sm !text-center">
            지금 바로 특가 혜택을 놓치지 마세요!
          </p>
          <a
            href="${partnerLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span class="text-white">기획전 확인하기</span>
            <svg class="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    `;

      // 첫 번째 버튼 삽입
      if (paragraphs[firstButtonIndex]) {
        paragraphs[firstButtonIndex].insertAdjacentHTML(
          'afterend',
          partnerButtonHtml
        );
      }

      // 두 번째 버튼 삽입 (인덱스 조정 필요)
      const updatedParagraphs = doc.querySelectorAll('p, h2, h3');
      if (updatedParagraphs[secondButtonIndex + 1]) {
        // +1은 첫 번째 버튼이 추가되었기 때문
        updatedParagraphs[secondButtonIndex + 1].insertAdjacentHTML(
          'afterend',
          partnerButtonHtml
        );
      }

      return doc.body.innerHTML;
    },
    []
  );

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

  useEffect(() => {
    // 클라이언트에서만 파트너 버튼 삽입
    if (post?.content && post?.campaigns?.partner_link) {
      const processed = insertPartnerButtons(
        post.content,
        post.campaigns.partner_link,
        post.campaigns.title
      );
      setProcessedContent(processed);
    } else if (post?.content) {
      setProcessedContent(post.content);
    }
  }, [post, insertPartnerButtons]);

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              포스트를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-6">
              요청하신 블로그 포스트를 찾을 수 없습니다.
            </p>
            <Link
              href="/blog"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              목록 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Blog Post */}
      <main className="container mx-auto px-2 md:px-4 py-8">
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
          <header
            className="mb-8"
            itemScope
            itemType="https://schema.org/BlogPosting"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              itemProp="headline"
            >
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

          {/* Google AdSense */}
          <GoogleAd className="my-8" />

          {/* 쿠팡 파트너스 안내문 */}
          <div className="bg-gray-100 rounded-lg shadow-sm p-4 md:p-8 mb-8 relative">
            <p>
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의
              수수료를 제공받을 수 있습니다.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8 relative">
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
              dangerouslySetInnerHTML={{
                __html: processedContent || post.content,
              }}
            />

            {/* Hidden SEO meta for structured data */}
            <div style={{ display: 'none' }}>
              <span
                itemProp="author"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <span itemProp="name">pick.drawyourmind.com</span>
                <span itemProp="url">https://pick.drawyourmind.com</span>
              </span>
              <span
                itemProp="publisher"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <span itemProp="name">Pick - 기획전 갤러리</span>
                <span itemProp="url">https://pick.drawyourmind.com</span>
              </span>
              {post.featured_image_url && (
                <img
                  itemProp="image"
                  src={post.featured_image_url}
                  alt={post.title}
                />
              )}
              {post.meta_description && (
                <span itemProp="description">{post.meta_description}</span>
              )}
              {post.updated_at && (
                <time itemProp="dateModified" dateTime={post.updated_at}></time>
              )}
            </div>
          </div>

          {/* Google AdSense */}
          <GoogleAd className="my-8" />

          {/* CTA Section */}
          {post.campaigns && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 md:p-8 text-white text-center">
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
