import { CoupangCrawler } from '../lib/crawler'

async function main() {
  console.log('크롤링 시작...')

  try {
    const crawler = new CoupangCrawler()
    await crawler.crawlAndSave()
    console.log('크롤링 완료!')
  } catch (error) {
    console.error('크롤링 실패:', error)
    process.exit(1)
  }
}

main()