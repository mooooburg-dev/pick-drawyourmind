import { NextResponse } from 'next/server'
import { CoupangCrawler } from '@/lib/crawler'

export async function POST() {
  try {
    console.log('크롤링 시작...')

    const crawler = new CoupangCrawler()
    await crawler.crawlAndSave()

    console.log('크롤링 완료!')

    return NextResponse.json({
      success: true,
      message: '크롤링이 성공적으로 완료되었습니다.'
    })
  } catch (error) {
    console.error('크롤링 실패:', error)

    return NextResponse.json(
      {
        success: false,
        error: '크롤링 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// 개발 환경에서 GET 요청도 허용 (테스트 용도)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only allowed in development' },
      { status: 405 }
    )
  }

  return POST()
}