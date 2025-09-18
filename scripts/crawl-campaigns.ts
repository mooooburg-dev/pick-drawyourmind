import { config } from 'dotenv'
import { ImprovedCoupangCrawler } from '../lib/crawler-improved'

// 환경변수 로드
config({ path: '.env.local' })

async function main() {
  console.log('개선된 크롤링 시작...')

  try {
    const crawler = new ImprovedCoupangCrawler()
    await crawler.crawlAndSave()
    console.log('크롤링 완료!')
  } catch (error) {
    console.error('크롤링 실패:', error)
    console.error('Error details:', error)
    process.exit(1)
  }
}

main()