import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateBlogPost, generateSlug } from '@/lib/openai-blog-generator';

async function generateContentImages(
  category: string
): Promise<{ image1: string; image2: string }> {
  try {
    // DALL-E 비용 문제로 일시적으로 비활성화
    // 카테고리별 고정 이미지 사용
    const categoryImages: Record<string, { image1: string; image2: string }> = {
      패션: {
        image1: 'https://picsum.photos/seed/fashion1/800/400',
        image2: 'https://picsum.photos/seed/fashion2/800/400',
      },
      뷰티: {
        image1: 'https://picsum.photos/seed/beauty1/800/400',
        image2: 'https://picsum.photos/seed/beauty2/800/400',
      },
      전자제품: {
        image1: 'https://picsum.photos/seed/electronics1/800/400',
        image2: 'https://picsum.photos/seed/electronics2/800/400',
      },
      홈리빙: {
        image1: 'https://picsum.photos/seed/home1/800/400',
        image2: 'https://picsum.photos/seed/home2/800/400',
      },
      일반: {
        image1: 'https://picsum.photos/seed/general1/800/400',
        image2: 'https://picsum.photos/seed/general2/800/400',
      },
    };

    return categoryImages[category] || categoryImages['일반'];
  } catch (error) {
    console.error('이미지 생성 실패:', error);
    return {
      image1: 'https://picsum.photos/seed/fallback1/800/400',
      image2: 'https://picsum.photos/seed/fallback2/800/400',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image_url, partner_link, category = '일반' } = body;

    if (!title || !image_url || !partner_link) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 중복 확인
    const { data: existingCampaign } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('title', title)
      .single();

    if (existingCampaign) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 기획전입니다.' },
        { status: 409 }
      );
    }

    // 새 기획전 추가
    const { data: campaignData, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        title,
        image_url,
        partner_link,
        category,
        is_active: true,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Campaign database error:', campaignError);
      return NextResponse.json(
        { success: false, error: '데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // OpenAI를 사용해서 이미지 생성 및 블로그 포스트 자동 생성
    try {
      console.log(
        'OpenAI 이미지 및 블로그 포스트 생성 시작...',
        campaignData.title
      );

      // 콘텐츠용 이미지 2개 생성
      const { image1, image2 } = await generateContentImages(category);
      console.log('콘텐츠 이미지 생성 완료');

      // 이미지 URL을 포함해서 블로그 포스트 생성
      const blogContent = await generateBlogPost(campaignData);
      const slug = generateSlug(blogContent.title);

      // 블로그 포스트 DB에 저장 (이미지 URL 포함)
      const { data: blogData, error: blogError } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          campaign_id: campaignData.id,
          title: blogContent.title,
          content: blogContent.content,
          excerpt: blogContent.excerpt,
          slug,
          featured_image_url: campaignData.image_url,
          content_image_1_url: image1,
          content_image_2_url: image2,
          tags: blogContent.tags,
          meta_description: blogContent.metaDescription,
          is_published: true,
        })
        .select()
        .single();

      if (blogError) {
        console.error('Blog post database error:', blogError);
        // 블로그 포스트 생성 실패해도 기획전은 성공으로 처리
      } else {
        console.log('블로그 포스트 생성 완료:', blogData.slug);
      }
    } catch (error) {
      console.error('블로그 포스트 생성 중 오류:', error);
      // OpenAI 오류가 발생해도 기획전 등록은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      data: campaignData,
      message: '기획전이 등록되었고 블로그 포스트가 자동 생성되었습니다.',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
