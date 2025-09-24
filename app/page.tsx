'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/lib/supabase';
import { clearAllCache, addCacheInvalidationListener } from '@/lib/cache-utils';

export default function Home() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filterCampaigns = useCallback(
    (campaigns: Campaign[], category: string) => {
      setFiltering(true);
      // 부드러운 전환을 위해 약간의 딜레이 추가
      setTimeout(() => {
        if (category === 'all') {
          setFilteredCampaigns(campaigns);
        } else {
          setFilteredCampaigns(
            campaigns.filter((campaign) => campaign.category === category)
          );
        }
        setFiltering(false);
      }, 100);
    },
    []
  );

  const fetchAllCampaigns = useCallback(async () => {
    try {
      setLoading(true);

      // 간단한 세션 저장소 캐싱 (3분)
      const cacheKey = 'all_campaigns_cache';
      const cacheTimeKey = 'all_campaigns_cache_time';
      const cacheTime = sessionStorage.getItem(cacheTimeKey);
      const cachedData = sessionStorage.getItem(cacheKey);

      if (
        cacheTime &&
        cachedData &&
        Date.now() - parseInt(cacheTime) < 180000
      ) {
        // 캐시된 데이터가 3분 이내면 사용
        const campaigns = JSON.parse(cachedData);
        setAllCampaigns(campaigns);
        filterCampaigns(campaigns, selectedCategory);
        setLoading(false);
        return;
      }

      // 모든 캠페인을 한 번에 로드 (limit을 크게 설정)
      const response = await fetch('/api/campaigns?limit=100&offset=0');
      const result = await response.json();

      if (result.success) {
        setAllCampaigns(result.data);
        filterCampaigns(result.data, selectedCategory);

        // 캐시에 저장
        sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      }
    } catch (error) {
      console.error('캠페인 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, filterCampaigns]);

  const updateHomeMetadata = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Update document title based on selected category
    const categoryLabel =
      categories.find((cat) => cat.value === selectedCategory)?.label || '전체';
    const title =
      selectedCategory === 'all'
        ? 'Pick | 쿠팡 기획전 갤러리'
        : `${categoryLabel} 기획전 | Pick - 쿠팡 특가 갤러리`;

    document.title = title;

    // Update meta description
    const description =
      selectedCategory === 'all'
        ? '최신 쿠팡 기획전과 이벤트를 한눈에! AI가 엄선한 특가 상품 정보와 매일 업데이트되는 쿠팡 프로모션을 확인하세요.'
        : `${categoryLabel} 카테고리의 최신 쿠팡 기획전과 특가 상품을 확인하세요. 매일 업데이트되는 ${categoryLabel} 관련 할인 혜택을 놓치지 마세요.`;

    updateMetaTag('description', description);

    // Update keywords based on category
    const baseKeywords =
      '쿠팡, 기획전, 특가, 할인, 이벤트, 프로모션, 쿠팡, 온라인쇼핑';
    const categoryKeywords =
      selectedCategory !== 'all'
        ? `, ${categoryLabel}, ${categoryLabel}특가, ${categoryLabel}할인`
        : '';
    updateMetaTag('keywords', baseKeywords + categoryKeywords);

    // Open Graph
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', window.location.href, 'property');

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Canonical URL
    updateLinkTag('canonical', window.location.href);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

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
    fetchAllCampaigns();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 캐시 무효화 이벤트 감지하여 데이터 새로고침
  useEffect(() => {
    const cleanup = addCacheInvalidationListener((eventType) => {
      if (eventType === 'all' || eventType === 'campaigns' || eventType === 'content') {
        console.log('캐시 무효화 감지, 기획전 데이터 새로고침 중...');
        fetchAllCampaigns();
      }
    });

    return cleanup;
  }, [fetchAllCampaigns]);

  useEffect(() => {
    // 카테고리 변경시 클라이언트에서 즉시 필터링
    filterCampaigns(allCampaigns, selectedCategory);
  }, [selectedCategory, allCampaigns, filterCampaigns]);

  useEffect(() => {
    // Update homepage metadata for SEO when category changes
    updateHomeMetadata();
  }, [selectedCategory, updateHomeMetadata]);

  const categories = [
    { value: 'all', label: '전체' },
    { value: '일반', label: '일반' },
    { value: '패션', label: '패션' },
    { value: '뷰티', label: '뷰티' },
    { value: '전자제품', label: '전자제품' },
    { value: '홈리빙', label: '홈리빙' },
    { value: '식품', label: '식품' },
    { value: '출산육아', label: '출산육아' },
    { value: '생활용품', label: '생활용품' },
    { value: '가구', label: '가구' },
    { value: '주방용품', label: '주방용품' },
    { value: '문구', label: '문구' },
    { value: '책', label: '책' },
    { value: '아동', label: '아동' },
    { value: '명품', label: '명품' },
    { value: '스포츠', label: '스포츠' },
    { value: '기타', label: '기타' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Pick</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/blog"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                블로그
              </Link>
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                관리자
              </Link>
              <button
                onClick={() => {
                  // 캐시 클리어 후 데이터 새로고침
                  clearAllCache();
                  window.location.reload();
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
                title="캐시를 지우고 새로고침"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === category.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">아직 기획전이 없습니다.</div>
            <p className="text-gray-400 text-sm mt-2">
              곧 새로운 기획전이 업데이트될 예정입니다.
            </p>
          </div>
        ) : (
          <>
            {/* Campaign Grid */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-opacity duration-200 ${
                filtering ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                더 보기
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Pick. All rights reserved.</p>
            <p className="mt-1">
              쿠팡 활동으로 일정 수수료를 받을 수 있습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const handleClick = () => {
    // 쿠팡 링크로 직접 이동
    window.open(campaign.partner_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200"
    >
      <div className="aspect-square relative">
        <Image
          src={campaign.image_url}
          alt={campaign.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
          {campaign.title}
        </h3>
        {campaign.category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {campaign.category}
            </span>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          {new Date(campaign.created_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  );
}
