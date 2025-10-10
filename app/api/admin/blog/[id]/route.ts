import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'

// 특정 블로그 포스트 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 허용되는 필드만 업데이트
    const allowedFields = ['title', 'content', 'excerpt', 'tags', 'meta_description', 'is_published']
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 1) { // only updated_at
      return NextResponse.json(
        { success: false, error: '업데이트할 데이터가 없습니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: '데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '해당 블로그 포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data
    })

    // 캐시 무효화 - 블로그 페이지 갱신
    revalidatePath('/blog')

    // 캐시 무효화 신호를 헤더에 추가
    response.headers.set('X-Cache-Invalidate', 'blog')

    // 개별 블로그 포스트 캐시도 무효화
    if (data.slug) {
      try {
        revalidateTag(`blog-${data.slug}`)
        revalidatePath(`/blog/${data.slug}`)
      } catch (error) {
        // 캐시 무효화 실패는 무시
      }
    }

    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 블로그 포스트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: '데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '해당 블로그 포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data
    })

    // 캐시 무효화 - 블로그 페이지 갱신
    revalidatePath('/blog')

    // 캐시 무효화 신호를 헤더에 추가
    response.headers.set('X-Cache-Invalidate', 'blog')

    // 개별 블로그 포스트 캐시도 무효화
    if (data.slug) {
      try {
        revalidateTag(`blog-${data.slug}`)
        revalidatePath(`/blog/${data.slug}`)
      } catch (error) {
        // 캐시 무효화 실패는 무시
      }
    }

    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}