import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 특정 블로그 포스트 조회 (이미지 URL 포함)
    const { data: blogPost, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        id,
        campaign_id,
        title,
        content,
        excerpt,
        slug,
        featured_image_url,
        content_image_1_url,
        content_image_2_url,
        tags,
        meta_description,
        is_published,
        created_at,
        updated_at,
        campaigns:campaign_id (
          title,
          image_url,
          partner_link,
          category
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !blogPost) {
      return NextResponse.json(
        { success: false, error: '블로그 포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // DB에 저장된 이미지 URL이 있으면 HTML content에서 이미지 URL 교체
    let content = blogPost.content
    if (blogPost.content_image_1_url && blogPost.content_image_2_url) {
      // HTML에서 picsum 이미지 URL을 DB의 이미지 URL로 교체
      const imgRegex = /<img[^>]+src="https:\/\/picsum\.photos\/[^"]*"[^>]*>/g
      const imgMatches = content.match(imgRegex)

      if (imgMatches && imgMatches.length >= 2) {
        // 첫 번째 이미지를 content_image_1_url로 교체
        content = content.replace(imgMatches[0],
          imgMatches[0].replace(/src="[^"]*"/, `src="${blogPost.content_image_1_url}"`))

        // 두 번째 이미지를 content_image_2_url로 교체
        content = content.replace(imgMatches[1],
          imgMatches[1].replace(/src="[^"]*"/, `src="${blogPost.content_image_2_url}"`))
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...blogPost,
        content // 수정된 content 반환
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}