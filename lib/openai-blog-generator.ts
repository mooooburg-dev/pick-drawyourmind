import OpenAI from 'openai';
import { Campaign } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BlogPostContent {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  metaDescription: string;
  contentImage1Url?: string;
  contentImage2Url?: string;
}

// DALL-E 비용 절약을 위해 비활성화, 카테고리별 기본 이미지 사용
export async function generateContentImage(description: string): Promise<string> {
  // 카테고리별 고정 이미지 매핑
  const categoryImages: Record<string, string> = {
    '패션': 'https://picsum.photos/seed/fashion/800/400',
    '뷰티': 'https://picsum.photos/seed/beauty/800/400',
    '전자제품': 'https://picsum.photos/seed/electronics/800/400',
    '홈리빙': 'https://picsum.photos/seed/home/800/400',
    '일반': 'https://picsum.photos/seed/general/800/400'
  };

  return categoryImages[description] || categoryImages['일반'];
}

export async function generateBlogPost(
  campaign: Campaign,
  contentImage1Url?: string,
  contentImage2Url?: string
): Promise<BlogPostContent> {
  try {
    const prompt = `기획전: ${campaign.title} (${campaign.category})

블로그 포스트 작성 요청:
- 제목: 50자 이내 SEO 최적화
- 본문: 600자 HTML (h2, p, ul 태그 사용)
- 발췌문: 100자 이내
- 태그: 3개
- 메타설명: 80자 이내

${contentImage1Url ? `이미지 포함: <img src="${contentImage1Url}" alt="관련 이미지" />` : ''}

JSON 응답:
{
  "title": "제목",
  "content": "HTML 본문",
  "excerpt": "발췌문",
  "tags": ["태그1", "태그2", "태그3"],
  "metaDescription": "메타설명"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '블로그 작가로서 매력적인 기획전 포스트를 JSON으로 작성하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }

    // JSON 응답 파싱
    const blogContent: BlogPostContent = JSON.parse(responseContent);

    // 데이터 검증
    if (!blogContent.title || !blogContent.content || !blogContent.excerpt) {
      throw new Error('OpenAI 응답에 필수 필드가 누락되었습니다.');
    }

    return {
      ...blogContent,
      contentImage1Url,
      contentImage2Url,
    };
  } catch (error) {
    console.error('블로그 포스트 생성 오류:', error);

    // OpenAI API 호출 실패 시 기본 블로그 포스트 생성 (이미지 포함)
    const fallbackImage1 = `https://picsum.photos/800/400?random=${Date.now()}`;
    const fallbackImage2 = `https://picsum.photos/800/400?random=${
      Date.now() + 1
    }`;

    const useContentImages = contentImage1Url && contentImage2Url;
    const img1 = useContentImages ? contentImage1Url : fallbackImage1;
    const img2 = useContentImages ? contentImage2Url : fallbackImage2;

    return {
      title: `${campaign.title} - 놓치면 후회할 특가 기회!`,
      content: `
        <h2>${campaign.title} 기획전 상세 리뷰</h2>

        <img src="${img1}" alt="${campaign.category} 기획전 상품 이미지" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

        <h3>🎯 기획전 개요</h3>
        <p>온라인에서 진행 중인 <strong>${campaign.title}</strong> 기획전이 뜨거운 관심을 받고 있습니다. ${campaign.category} 카테고리의 인기 상품들이 대폭 할인된 가격으로 만나볼 수 있는 절호의 기회입니다.</p>

        <h3>🔥 주목해야 하는 이유</h3>
        <p>최근 ${campaign.category} 시장 트렌드를 보면, 소비자들의 관심이 급증하고 있습니다. 특히 품질 대비 가격이 합리적인 상품들에 대한 수요가 크게 늘어나고 있어, 이번 기획전은 스마트한 구매를 원하는 분들에게 최적의 타이밍입니다.</p>

        <img src="${img2}" alt="${campaign.category} 트렌드 및 라이프스타일 이미지" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

        <h3>💰 특별 혜택 및 할인 정보</h3>
        <p>이번 기획전에서는 다음과 같은 다양한 혜택을 제공합니다:</p>
        <ul>
          <li>선택 상품 최대 50% 할인</li>
          <li>추가 쿠폰 및 적립금 혜택</li>
          <li>빠른 배송 서비스</li>
          <li>무료배송 혜택 (조건부)</li>
        </ul>

        <h3>🛍️ 현명한 구매 가이드</h3>
        <p>기획전 기간 중 현명한 구매를 위한 팁을 알려드립니다:</p>
        <ul>
          <li>리뷰가 많고 평점이 높은 상품 우선 선택</li>
          <li>가격 비교를 통한 최적 가격 확인</li>
          <li>배송 조건 및 반품/교환 정책 사전 확인</li>
          <li>쿠폰 및 적립금 활용으로 추가 절약</li>
        </ul>

        <h3>⏰ 놓치지 마세요!</h3>
        <p>이런 특가 기회는 자주 오지 않습니다. ${campaign.category} 상품 구매를 고려하고 계셨다면, 지금이 바로 그 때입니다. 재고 소진 전에 서둘러 확인해보세요!</p>

        <p class="cta-section" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <strong>🎉 지금 바로 특가 상품 확인하기!</strong><br>
          한정된 기간, 한정된 수량으로 진행되는 특별 기획전입니다.
        </p>
      `,
      excerpt: `${campaign.title} 기획전에서 ${campaign.category} 상품들을 특가로 만나보세요! 최대 50% 할인과 다양한 혜택이 준비되어 있습니다. 놓치면 후회할 기회, 지금 바로 확인해보세요.`,
      tags: [campaign.category || '일반', '특가', '할인', '기획전', '쇼핑'],
      metaDescription: `${campaign.title} 기획전 완벽 가이드! ${campaign.category} 상품 최대 50% 할인, 특별 혜택 총정리. 현명한 구매 팁과 추천 상품까지!`,
      contentImage1Url,
      contentImage2Url,
    };
  }
}

export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만 유지)
      .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
      .replace(/-+/g, '-') // 연속된 하이픈을 하나로 변경
      .trim() +
    '-' +
    Date.now()
  ); // 중복 방지를 위한 타임스탬프 추가
}
