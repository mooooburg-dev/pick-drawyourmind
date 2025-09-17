import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 환경변수가 설정되지 않은 경우 404 반환
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const { id } = await params
    const supabase = getSupabase()
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        blog_posts (*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('캠페인 조회 실패:', error)
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign
    })
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}