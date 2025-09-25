/**
 * 클라이언트 사이드 캐시 무효화 유틸리티
 */

// 캐시 무효화를 알리기 위한 커스텀 이벤트
const CACHE_INVALIDATED_EVENT = 'cacheInvalidated';

/**
 * 모든 페이지의 캐시를 무효화합니다
 */
export const clearAllCache = (): void => {
  if (typeof window === 'undefined') return;

  // 기획전 캐시 무효화
  sessionStorage.removeItem('all_campaigns_cache');
  sessionStorage.removeItem('all_campaigns_cache_time');

  // 블로그 캐시 무효화
  sessionStorage.removeItem('blog_posts_cache');
  sessionStorage.removeItem('blog_posts_cache_time');

  // 캐시 무효화 이벤트 발생
  window.dispatchEvent(new CustomEvent(CACHE_INVALIDATED_EVENT, {
    detail: { type: 'all' }
  }));
};

/**
 * 기획전 관련 캐시만 무효화합니다
 */
export const clearCampaignsCache = (): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('all_campaigns_cache');
  sessionStorage.removeItem('all_campaigns_cache_time');

  // 캐시 무효화 이벤트 발생
  window.dispatchEvent(new CustomEvent(CACHE_INVALIDATED_EVENT, {
    detail: { type: 'campaigns' }
  }));
};

/**
 * 블로그 관련 캐시만 무효화합니다
 */
export const clearBlogCache = (): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('blog_posts_cache');
  sessionStorage.removeItem('blog_posts_cache_time');

  // 캐시 무효화 이벤트 발생
  window.dispatchEvent(new CustomEvent(CACHE_INVALIDATED_EVENT, {
    detail: { type: 'blog' }
  }));
};

/**
 * 기획전과 블로그 관련 모든 캐시를 무효화합니다
 * (기획전 생성 시 블로그도 자동 생성되므로 함께 무효화)
 */
export const clearContentCache = (): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('all_campaigns_cache');
  sessionStorage.removeItem('all_campaigns_cache_time');
  sessionStorage.removeItem('blog_posts_cache');
  sessionStorage.removeItem('blog_posts_cache_time');

  // 캐시 무효화 이벤트 발생
  window.dispatchEvent(new CustomEvent(CACHE_INVALIDATED_EVENT, {
    detail: { type: 'content' }
  }));
};

/**
 * 캐시 무효화 이벤트를 감지하는 유틸리티 함수
 */
export const addCacheInvalidationListener = (callback: (eventType: string) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCacheInvalidated = (event: CustomEvent) => {
    callback(event.detail.type);
  };

  window.addEventListener(CACHE_INVALIDATED_EVENT, handleCacheInvalidated as EventListener);

  return () => {
    window.removeEventListener(CACHE_INVALIDATED_EVENT, handleCacheInvalidated as EventListener);
  };
};

/**
 * API 응답에서 캐시 무효화 헤더를 확인하고 적절한 캐시를 무효화합니다
 */
export const handleApiCacheInvalidation = (response: Response): void => {
  if (typeof window === 'undefined') return;

  const cacheInvalidateHeader = response.headers.get('X-Cache-Invalidate');

  if (cacheInvalidateHeader) {
    switch (cacheInvalidateHeader) {
      case 'blog':
        clearBlogCache();
        break;
      case 'campaigns':
        clearCampaignsCache();
        break;
      case 'content':
        clearContentCache();
        break;
      case 'all':
        clearAllCache();
        break;
    }
  }
};