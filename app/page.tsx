import type { Metadata } from 'next';
import { getSupabaseAdmin, Campaign } from '@/lib/supabase';
import Header from './components/Header';
import CampaignGrid from './components/CampaignGrid';

// 서버에서 초기 캠페인 데이터를 가져오는 함수
async function getCampaigns(): Promise<Campaign[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('캠페인 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('캠페인 로딩 에러:', error);
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const campaigns = await getCampaigns();
  const campaignCount = campaigns.length;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pick.drawyourmind.com';

  return {
    title: 'Pick | 갤러리',
    description: `최신 특가 정보와 이벤트를 한눈에! 현재 ${campaignCount}개의 상품을 확인하고 최고의 할인 혜택을 놓치지 마세요.`,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'Pick | 갤러리',
      description: `최신 특가 정보와 이벤트를 한눈에! 현재 ${campaignCount}개의 상품 정보를 확인하세요.`,
      url: baseUrl,
      siteName: 'Pick - 갤러리',
      images: [
        {
          url: '/api/og',
          width: 1200,
          height: 630,
          alt: 'Pick - 갤러리',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pick | 갤러리',
      description: `최신 특가 정보와 이벤트를 한눈에! 현재 ${campaignCount}개의 상품 정보를 확인하세요.`,
      images: ['/api/og'],
      creator: '@pick_deals',
    },
  };
}

export default async function Home() {
  // 서버에서 초기 데이터 로드
  const initialCampaigns = await getCampaigns();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CampaignGrid initialCampaigns={initialCampaigns} />

      {/* Footer */}
      <footer className="bg-white border-t mt-16 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Pick. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
