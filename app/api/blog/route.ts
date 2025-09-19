import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabaseAdmin = getSupabaseAdmin()

    // 공개된 블로그 포스트만 조회 (이미지 URL 포함)
    const { data: blogPosts, error } = await supabaseAdmin
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
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: '데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 전체 개수 조회
    const { count } = await supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const response = NextResponse.json({
      success: true,
      data: blogPosts || [],
      count: count || 0
    })

    // 캐시 헤더 추가 (2분 캐시)
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}