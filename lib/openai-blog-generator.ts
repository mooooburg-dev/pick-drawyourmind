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

// OpenAI DALL-E를 사용한 이미지 생성
export async function generateContentImage(
  description: string
): Promise<string> {
  try {
    console.log(`DALL-E 이미지 생성 시작: ${description}`);

    // 카테고리별 상세한 프롬프트 생성
    const categoryPrompts: Record<string, string> = {
      // 기본 카테고리
      패션: `A modern fashion collection showcasing stylish clothing items, trendy outfits, elegant models in a clean studio setting, professional fashion photography style, high quality, commercial fashion shoot aesthetic`,
      뷰티: `Beautiful cosmetics and beauty products arranged elegantly, skincare items, makeup palette, clean white background, professional product photography, soft lighting, luxury beauty brand aesthetic`,
      전자제품: `Modern electronic devices and gadgets, sleek technology products, smartphones, headphones, computers, clean white background, professional product photography, minimalist tech aesthetic`,
      홈리빙: `Cozy home interior design, modern furniture, comfortable living space, decorative items, warm lighting, Scandinavian style, clean and organized home decor`,
      일반: `Modern lifestyle products and accessories, clean commercial photography, professional product arrangement, neutral background, high quality commercial imagery`,

      // 라이프스타일 이미지
      패션_lifestyle: `People wearing fashionable outfits in everyday life, street style photography, trendy lifestyle, urban fashion, natural poses, high quality lifestyle photography`,
      뷰티_lifestyle: `Beautiful people using skincare and makeup products, self-care routine, natural beauty lifestyle, soft lighting, wellness and beauty concept`,
      전자제품_lifestyle: `People using modern technology in daily life, working with gadgets, tech-savvy lifestyle, modern workspace, digital lifestyle photography`,
      홈리빙_lifestyle: `People enjoying comfortable home life, cozy living spaces, family time at home, comfortable lifestyle, warm and inviting atmosphere`,
      일반_lifestyle: `Happy people enjoying modern lifestyle, everyday life moments, contemporary living, positive lifestyle photography`,

      // 상세/특징 이미지
      패션_detail: `Close-up details of clothing fabric, texture, quality materials, fashion design elements, professional detail photography, luxury fashion aesthetics`,
      뷰티_detail: `Close-up of beauty product textures, skincare application, makeup details, product quality shots, luxury beauty brand photography`,
      전자제품_detail: `Close-up of technology features, device details, premium build quality, tech specifications, professional product photography`,
      홈리빙_detail: `Interior design details, furniture craftsmanship, home decor elements, quality materials, architectural details`,
      일반_detail: `Product quality details, craftsmanship, premium materials, professional close-up photography, attention to detail`,

      // 쇼핑/혜택 이미지
      패션_shopping: `Fashion shopping experience, boutique store, special deals and discounts, shopping bags, retail environment, luxury shopping aesthetic`,
      뷰티_shopping: `Beauty store shopping, cosmetics counter, special offers, beauty shopping experience, retail beauty environment`,
      전자제품_shopping: `Electronics store, tech shopping, special promotions, modern retail space, technology showcase`,
      홈리빙_shopping: `Home goods store, interior shopping, furniture showroom, home decor retail, shopping for home items`,
      일반_shopping: `Modern retail shopping experience, special offers, promotional display, shopping concept, retail environment`,
    };

    const prompt = categoryPrompts[description] || categoryPrompts['일반'];

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('DALL-E 응답에서 이미지 URL을 찾을 수 없습니다.');
    }

    console.log(`DALL-E 이미지 생성 완료: ${imageUrl}`);
    return imageUrl;

  } catch (error) {
    console.error('DALL-E 이미지 생성 실패:', error);

    // 실패 시 카테고리별 고품질 Unsplash 이미지로 폴백
    const fallbackImages: Record<string, string> = {
      // 기본 카테고리
      패션: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop&crop=center',
      뷰티: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop&crop=center',
      전자제품: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop&crop=center',
      홈리빙: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop&crop=center',
      일반: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center',

      // 라이프스타일 이미지
      패션_lifestyle: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=400&fit=crop&crop=center',
      뷰티_lifestyle: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop&crop=center',
      전자제품_lifestyle: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop&crop=center',
      홈리빙_lifestyle: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop&crop=center',
      일반_lifestyle: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=800&h=400&fit=crop&crop=center',

      // 상세/특징 이미지
      패션_detail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=400&fit=crop&crop=center',
      뷰티_detail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center',
      전자제품_detail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=400&fit=crop&crop=center',
      홈리빙_detail: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=400&fit=crop&crop=center',
      일반_detail: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b43d?w=800&h=400&fit=crop&crop=center',

      // 쇼핑/혜택 이미지
      패션_shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center',
      뷰티_shopping: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=400&fit=crop&crop=center',
      전자제품_shopping: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center',
      홈리빙_shopping: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=400&fit=crop&crop=center',
      일반_shopping: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop&crop=center',
    };

    return fallbackImages[description] || fallbackImages['일반'];
  }
}

export async function generateBlogPost(
  campaign: Campaign,
  contentImage1Url?: string,
  contentImage2Url?: string
): Promise<BlogPostContent> {
  // 이미지 변수들을 함수 스코프로 이동
  let image1Url = contentImage1Url;
  let image2Url = contentImage2Url;
  let image3Url = '';
  let image4Url = '';

  try {

    // 이미지 1 생성 (메인 제품/카테고리 이미지)
    if (!image1Url) {
      console.log('이미지 1 생성 중...');
      image1Url = await generateContentImage(campaign.category || '일반');
    }

    // 이미지 2 생성 (라이프스타일 이미지)
    if (!image2Url) {
      console.log('이미지 2 생성 중...');
      image2Url = await generateContentImage(`${campaign.category}_lifestyle`);
    }

    // 이미지 3 생성 (상세/특징 이미지)
    console.log('이미지 3 생성 중...');
    image3Url = await generateContentImage(`${campaign.category}_detail`);

    // 이미지 4 생성 (혜택/쇼핑 이미지)
    console.log('이미지 4 생성 중...');
    image4Url = await generateContentImage(`${campaign.category}_shopping`);

    const prompt = `기획전: ${campaign.title} (${campaign.category})

블로그 포스트 작성 요청:
- 제목: 50자 이내 SEO 최적화 제목
- 본문: 1200-2000자 HTML (h2, h3, p, ul, li 태그 사용)
  구조: 도입부(200자) → 상품분석(600자) → 구매가이드(500자) → 마무리(300자)
- 발췌문: 150자 이내 핵심 요약
- 태그: 5개 (카테고리 포함)
- 메타설명: 120자 이내

이미지 위치:
- 이미지1: ${image1Url}
- 이미지2: ${image2Url}
- 이미지3: ${image3Url}
- 이미지4: ${image4Url}

JSON 응답:
{
  "title": "제목",
  "content": "HTML 본문 (이미지 4장을 적절한 위치에 배치)",
  "excerpt": "발췌문",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "metaDescription": "메타설명"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '당신은 SEO를 잘 이해하고, 검색 엔진 노출 최적화를 잘하는 전문 블로그 작가입니다. 이모지를 적절히 활용해서 약 1,200~2,000자의 상세하고 매력적인 기획전 포스트를 JSON 형식으로 작성하세요. 코드 블록(```) 없이 순수 JSON만 반환하세요. 글체는 너무 딱딱하지 않은 캐쥬얼 톤으로 작성하세요. 기획전을 소개하는 블로그 포스팅입니다. 기획전 제목은 ${campaign.title} 입니다.',
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
      cleanedResponse = responseContent
        .replace(/```json\s*/, '')
        .replace(/\s*```$/, '');
    }
    const blogContent: BlogPostContent = JSON.parse(cleanedResponse);

    // 데이터 검증
    if (!blogContent.title || !blogContent.content || !blogContent.excerpt) {
      throw new Error('OpenAI 응답에 필수 필드가 누락되었습니다.');
    }

    return {
      ...blogContent,
      contentImage1Url: image1Url,
      contentImage2Url: image2Url,
    };
  } catch (error) {
    console.error('블로그 포스트 생성 오류:', error);

    // OpenAI API 호출 실패 시 기본 블로그 포스트 생성 (DALL-E 이미지 포함)
    // 이미지가 이미 생성되었다면 사용, 아니면 생성
    let img1 = image1Url;
    let img2 = image2Url;
    let img3 = image3Url;
    let img4 = image4Url;

    // 이미지가 없는 경우에만 생성 (에러 핸들링을 위해)
    if (!img1) {
      try {
        img1 = await generateContentImage(campaign.category || '일반');
      } catch {
        img1 = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center`;
      }
    }
    if (!img2) {
      try {
        img2 = await generateContentImage(`${campaign.category}_lifestyle`);
      } catch {
        img2 = `https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=800&h=400&fit=crop&crop=center`;
      }
    }
    if (!img3) {
      try {
        img3 = await generateContentImage(`${campaign.category}_detail`);
      } catch {
        img3 = `https://images.unsplash.com/photo-1486312338219-ce68e2c6b43d?w=800&h=400&fit=crop&crop=center`;
      }
    }
    if (!img4) {
      try {
        img4 = await generateContentImage(`${campaign.category}_shopping`);
      } catch {
        img4 = `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop&crop=center`;
      }
    }

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

        <img src="${img3}" alt="특가 혜택 상세 이미지" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

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

        <img src="${img4}" alt="구매 가이드 및 팁" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />

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
      contentImage1Url: img1,
      contentImage2Url: img2,
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
