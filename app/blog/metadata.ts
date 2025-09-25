import { Metadata } from 'next';

export const blogMetadata: Metadata = {
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
  openGraph: {
    title: '블로그 - Pick 특가 정보 및 기획전 소식',
    description: 'AI가 엄선한 최신 기획전 정보와 특가 상품 리뷰를 확인하세요.',
    type: 'website',
    url: 'https://pick.drawyourmind.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: '블로그 - Pick 특가 정보 및 기획전 소식',
    description: 'AI가 엄선한 최신 기획전 정보와 특가 상품 리뷰를 확인하세요.',
  },
  alternates: {
    canonical: '/blog',
  },
};
