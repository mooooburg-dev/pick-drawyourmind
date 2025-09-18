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
- 제목: 50자 이내 SEO 최적화 제목
- 본문: 1200-2000자 HTML (h2, h3, p, ul, li 태그 사용)
  구조: 도입부(200자) → 상품분석(600자) → 구매가이드(500자) → 마무리(300자)
- 발췌문: 150자 이내 핵심 요약
- 태그: 5개 (카테고리 포함)
- 메타설명: 120자 이내

이미지 위치:
- 이미지1: ${contentImage1Url || 'https://picsum.photos/seed/img1/800/400'}
- 이미지2: ${contentImage2Url || 'https://picsum.photos/seed/img2/800/400'}
- 이미지3: https://picsum.photos/seed/img3/800/400
- 이미지4: https://picsum.photos/seed/img4/800/400

JSON 응답:
{
  "title": "제목",
  "content": "HTML 본문 (이미지 4장을 적절한 위치에 배치)",
  "excerpt": "발췌문",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "metaDescription": "메타설명"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 전문 블로그 작가입니다. 1200-2000자의 상세하고 매력적인 기획전 포스트를 JSON 형식으로 작성하세요. 코드 블록(```) 없이 순수 JSON만 반환하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }

    // JSON 응답 파싱 (코드 블록 제거)
    let cleanedResponse = responseContent;
    if (responseContent.includes('```json')) {
      cleanedResponse = responseContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
    }
    const blogContent: BlogPostContent = JSON.parse(cleanedResponse);

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

        <img src="https://picsum.photos/seed/img3/800/400" alt="특가 혜택 상세 이미지" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

        <h3>🏆 왜 이 기획전이 특별한가?</h3>
        <p>수많은 온라인 기획전 중에서도 이번 ${campaign.title}이 주목받는 이유가 있습니다. 단순히 할인만 제공하는 것이 아니라, 정말 좋은 상품들을 엄선해서 소개하고 있기 때문입니다.</p>

        <p>특히 ${campaign.category} 분야에서 오랜 경험을 쌓은 전문가들이 직접 상품을 큐레이션했다는 점이 인상적입니다. 가격만 저렴한 상품이 아니라, 가성비와 품질을 모두 만족시키는 상품들만을 엄선했습니다.</p>

        <h3>📈 최신 트렌드 반영</h3>
        <p>2024년 ${campaign.category} 트렌드를 완벽하게 반영한 상품 구성도 이번 기획전의 큰 장점입니다. SNS에서 화제가 되고 있는 아이템부터 전문가들이 추천하는 숨은 명품까지, 다양한 스타일과 취향을 모두 아우르는 폭넓은 선택지를 제공합니다.</p>

        <ul>
          <li>인플루언서들이 추천하는 인기 아이템</li>
          <li>품질 대비 가격이 우수한 가성비 상품</li>
          <li>오래 사용할 수 있는 내구성 좋은 제품</li>
          <li>디자인과 실용성을 모두 갖춘 아이템</li>
        </ul>

        <img src="https://picsum.photos/seed/img4/800/400" alt="구매 가이드 및 팁" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

        <h3>💡 구매 전 체크포인트</h3>
        <p>기획전에서 실패하지 않는 구매를 위해 몇 가지 체크포인트를 알려드리겠습니다:</p>

        <p><strong>1. 리뷰 분석</strong><br>
        단순히 별점만 보지 말고, 실제 후기 내용을 꼼꼼히 읽어보세요. 특히 본인과 비슷한 조건의 구매자들의 후기를 중점적으로 확인하시면 됩니다.</p>

        <p><strong>2. 사이즈 및 스펙 확인</strong><br>
        온라인 구매의 가장 큰 단점은 실물을 직접 확인할 수 없다는 점입니다. 상품 상세 페이지의 사이즈 정보와 스펙을 꼼꼼히 확인하세요.</p>

        <p><strong>3. 배송비 포함 가격 계산</strong><br>
        할인가만 보지 말고 배송비까지 포함한 최종 가격을 계산해보세요. 때로는 배송비가 포함되면 다른 쇼핑몰보다 비쌀 수도 있습니다.</p>

        <h3>⏰ 마지막 기회, 놓치지 마세요!</h3>
        <p>이런 대규모 특가 기회는 정말 자주 오지 않습니다. 특히 ${campaign.category} 분야의 인기 상품들이 이렇게 대폭 할인되는 경우는 더욱 드뭅니다. 평소 관심 있게 지켜봤던 상품이 있으시다면, 이번이 바로 그 기회입니다.</p>

        <p>다만 인기 상품의 경우 조기 품절될 가능성이 높으니, 너무 오랫동안 고민하지 마시고 빠른 결정을 내리시는 것이 좋겠습니다. 특히 한정 수량으로 진행되는 상품들은 더욱 서둘러야 합니다.</p>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <h4 style="color: white; margin-bottom: 15px;">🎉 지금 바로 특가 상품 확인하기!</h4>
          <p style="margin-bottom: 0; font-size: 16px; opacity: 0.9;">한정된 기간, 한정된 수량으로 진행되는 특별 기획전입니다.<br>망설이다가 놓치는 일이 없도록 서둘러 확인해보세요!</p>
        </div>
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
