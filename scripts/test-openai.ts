import { config } from 'dotenv'
import path from 'path'

// 환경변수 로드
config({ path: path.join(process.cwd(), '.env.local') })

async function testOpenAI() {
  // 환경변수 로드 후 동적 import
  const { generateBlogPost, generateContentImage } = await import('../lib/openai-blog-generator')
  console.log('OpenAI API 테스트 시작...')
  console.log('API 키 확인:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음')

  // 테스트용 가짜 캠페인 데이터
  const testCampaign = {
    id: 'test-id',
    title: '겨울 패션 특가 기획전',
    image_url: 'https://picsum.photos/400/400',
    partner_link: 'https://example.com',
    category: '패션',
    start_date: null,
    end_date: null,
    is_active: true,
    created_at: new Date().toISOString()
  }

  try {
    console.log('이미지 생성 테스트...')
    const imageUrl = await generateContentImage('패션')
    console.log('생성된 이미지 URL:', imageUrl)

    console.log('블로그 포스트 생성 테스트...')
    const blogPost = await generateBlogPost(testCampaign, imageUrl)

    console.log('✅ 성공!')
    console.log('제목:', blogPost.title)
    console.log('발췌문:', blogPost.excerpt)
    console.log('태그:', blogPost.tags.join(', '))
    console.log('메타 설명:', blogPost.metaDescription)
    console.log('본문 길이:', blogPost.content.length, '자')
    console.log('본문 미리보기:', blogPost.content.substring(0, 200) + '...')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message)
    }
  }
}

testOpenAI()