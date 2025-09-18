'use client';

import { useState, useRef, useEffect } from 'react';

interface ShareMenuProps {
  title?: string;
  url: string;
  onCopySuccess?: () => void;
}

export default function ShareMenu({
  title = '',
  url,
  onCopySuccess,
}: ShareMenuProps) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const handleShare = async (platform: string) => {
    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          onCopySuccess?.();
        } catch (error) {
          console.error('URL 복사 실패:', error);
        }
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          '_blank'
        );
        break;
      case 'kakao':
        window.open(
          `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'naver':
        window.open(
          `https://share.naver.com/web/shareView?url=${encodeURIComponent(
            url
          )}&title=${encodeURIComponent(title)}`,
          '_blank'
        );
        break;
    }
    setShareMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShareMenuOpen(false);
      }
    };

    if (shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareMenuOpen]);

  return (
    <div className="relative" ref={shareMenuRef}>
      <button
        onClick={() => setShareMenuOpen(!shareMenuOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        공유
      </button>

      {/* Share Menu */}
      {shareMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          <button
            onClick={() => handleShare('copy')}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 text-gray-500"
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
            링크 복사
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            페이스북
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            트위터
          </button>
          <button
            onClick={() => handleShare('kakao')}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3C6.486 3 2 6.262 2 10.5c0 2.665 1.708 5.024 4.357 6.477-.184-.698-.675-2.727-.766-3.074-.034-.131.014-.268.131-.336 2.673-1.558 4.278-4.086 4.278-7.067 0-4.239-4.486-7.5-10-7.5S0 6.261 0 10.5 4.486 18 10 18c.553 0 1.095-.034 1.621-.101.132-.017.266.04.334.145.563 .869 1.706 2.677 1.746 2.749.045.082.06.178.041.268-.021.103-.078.193-.159.248C11.746 22.68 10.914 23 10 23 4.486 23 0 19.739 0 15.5S4.486 8 10 8s10 3.261 10 7.5S17.514 23 12 23z" />
            </svg>
            카카오스토리
          </button>
          <button
            onClick={() => handleShare('naver')}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
            </svg>
            네이버
          </button>
        </div>
      )}
    </div>
  );
}
