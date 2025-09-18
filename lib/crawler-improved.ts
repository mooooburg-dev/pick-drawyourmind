import { chromium, Browser, Page, ElementHandle } from 'playwright'
import { getSupabaseAdmin } from './supabase'

export interface CampaignData {
  title: string
  imageUrl: string
  partnerLink: string
  category?: string
}

export class ImprovedCoupangCrawler {
  private browser: Browser | null = null
  private page: Page | null = null

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    // 일반적인 브라우저처럼 보이도록 설정
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    })

    this.page = await context.newPage()

    // 뷰포트 설정
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      console.log('쿠팡 파트너스 로그인 시작...')

      // 쿠팡 파트너스 메인 페이지로 이동
      await this.page.goto('https://partners.coupang.com/', { waitUntil: 'networkidle' })

      // 로그인 페이지로 이동하는 버튼/링크 찾기
      const loginButton = await this.page.waitForSelector('a[href*="login"], button:has-text("로그인"), .login', { timeout: 10000 })
      if (loginButton) {
        await loginButton.click()
        await this.page.waitForLoadState('networkidle')
      }

      // 환경변수 확인
      const email = process.env.COUPANG_PARTNERS_EMAIL
      const password = process.env.COUPANG_PARTNERS_PASSWORD

      console.log('이메일 환경변수:', email ? '설정됨' : '없음')
      console.log('패스워드 환경변수:', password ? '설정됨' : '없음')

      if (!email || !password) {
        throw new Error('쿠팡 파트너스 로그인 정보가 환경변수에 설정되지 않았습니다.')
      }

      // 이메일 입력
      await this.page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="이메일"]', { timeout: 10000 })
      await this.page.fill('input[type="email"], input[name="email"], input[placeholder*="이메일"]', email)

      // 패스워드 입력
      await this.page.fill('input[type="password"], input[name="password"]', password)

      // 약간의 지연 (사람처럼 보이도록)
      await this.page.waitForTimeout(1000)

      // 로그인 버튼 클릭
      const submitButton = await this.page.waitForSelector('button[type="submit"], input[type="submit"], button:has-text("로그인")')
      await submitButton.click()

      // 로그인 완료 대기 (URL 변경 또는 특정 요소 나타날 때까지)
      await this.page.waitForFunction(() => {
        return window.location.href.includes('partners.coupang.com') &&
               !window.location.href.includes('login')
      }, { timeout: 30000 })

      await this.page.waitForTimeout(3000)
      console.log('쿠팡 파트너스 로그인 완료')

    } catch (error) {
      console.error('로그인 실패:', error)

      // 스크린샷 저장 (디버깅용)
      if (this.page) {
        await this.page.screenshot({ path: 'login-error.png', fullPage: true })
      }

      throw new Error('Failed to login to Coupang Partners')
    }
  }

  async navigateToEvents(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      console.log('이벤트 페이지로 이동...')

      // 직접 이벤트 페이지 URL로 이동
      await this.page.goto('https://partners.coupang.com/#affiliate/ws/events', {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // SPA 로딩 대기
      await this.page.waitForTimeout(5000)

      // 이벤트 목록이 로드될 때까지 대기
      await this.page.waitForFunction(() => {
        // React 앱이 로드되고 이벤트 데이터가 있는지 확인
        return document.querySelector('[data-testid="event-list"], .event-list, .promotion-list') !== null ||
               document.querySelectorAll('.event-item, .promotion-item').length > 0
      }, { timeout: 20000 })

      console.log('이벤트 페이지 로딩 완료')

    } catch (error) {
      console.error('이벤트 페이지 이동 실패:', error)

      if (this.page) {
        await this.page.screenshot({ path: 'events-page-error.png', fullPage: true })
        console.log('현재 URL:', this.page.url())

        // 페이지 내용 확인
        const pageContent = await this.page.content()
        console.log('페이지 내용 일부:', pageContent.substring(0, 1000))
      }

      throw new Error('Failed to navigate to events page')
    }
  }

  async extractCampaigns(): Promise<CampaignData[]> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      console.log('기획전 데이터 추출 시작...')
      const campaigns: CampaignData[] = []

      // 다양한 셀렉터로 이벤트 아이템들을 찾아보기
      const possibleSelectors = [
        '[data-testid="event-item"]',
        '.event-item',
        '.promotion-item',
        '.campaign-item',
        '[class*="event"]',
        '[class*="promotion"]',
        '[class*="campaign"]'
      ]

      let eventElements: ElementHandle[] = []

      for (const selector of possibleSelectors) {
        eventElements = await this.page.$$(selector)
        if (eventElements.length > 0) {
          console.log(`셀렉터 "${selector}"로 ${eventElements.length}개 요소 발견`)
          break
        }
      }

      // 만약 특정 셀렉터로 찾지 못했다면, 이미지가 있는 링크들을 찾기
      if (eventElements.length === 0) {
        console.log('기본 셀렉터로 찾지 못함, 이미지 링크로 검색...')
        eventElements = await this.page.$$('a:has(img)')
        console.log(`이미지 링크 ${eventElements.length}개 발견`)
      }

      // 최대 10개까지만 처리
      const elementsToProcess = eventElements.slice(0, 10)

      for (let i = 0; i < elementsToProcess.length; i++) {
        try {
          const element = elementsToProcess[i]

          // 제목 추출 시도
          const title = await element.evaluate((el: Element) => {
            const titleSelectors = ['h1', 'h2', 'h3', 'h4', '.title', '[class*="title"]', 'img']
            for (const sel of titleSelectors) {
              const titleEl = el.querySelector(sel)
              if (titleEl) {
                return titleEl.getAttribute('alt') || titleEl.textContent?.trim() || ''
              }
            }
            return ''
          })

          // 이미지 URL 추출
          const imageUrl = await element.evaluate((el: Element) => {
            const img = el.querySelector('img')
            return img?.src || img?.getAttribute('data-src') || ''
          })

          // 링크 추출
          const link = await element.evaluate((el: Element) => {
            if (el.tagName === 'A') return (el as HTMLAnchorElement).href
            const linkEl = el.querySelector('a')
            return linkEl?.href || ''
          })

          if (title && imageUrl && link) {
            campaigns.push({
              title: title.length > 100 ? title.substring(0, 100) + '...' : title,
              imageUrl,
              partnerLink: link,
              category: '일반' // 기본 카테고리
            })

            console.log(`기획전 ${i + 1}: ${title.substring(0, 50)}...`)
          }

        } catch (err) {
          console.log(`요소 ${i} 처리 중 오류:`, err)
          continue
        }
      }

      console.log(`총 ${campaigns.length}개의 기획전 데이터 추출 완료`)
      return campaigns

    } catch (error) {
      console.error('기획전 추출 실패:', error)

      if (this.page) {
        await this.page.screenshot({ path: 'extract-error.png', fullPage: true })
      }

      // 빈 배열 반환 (오류 시에도 프로세스 중단하지 않음)
      return []
    }
  }

  async saveCampaignToDatabase(campaign: CampaignData): Promise<string | null> {
    try {
      const supabaseAdmin = getSupabaseAdmin()

      // 중복 확인
      const { data: existingCampaign } = await supabaseAdmin
        .from('campaigns')
        .select('id')
        .eq('title', campaign.title)
        .single()

      if (existingCampaign) {
        console.log(`기존 캠페인 발견: ${campaign.title}`)
        return existingCampaign.id
      }

      // 새 캠페인 저장
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .insert({
          title: campaign.title,
          image_url: campaign.imageUrl,
          partner_link: campaign.partnerLink,
          category: campaign.category,
          is_active: true
        })
        .select('id')
        .single()

      if (error) {
        console.error('캠페인 저장 실패:', error)
        return null
      }

      console.log(`새 캠페인 저장 완료: ${campaign.title}`)
      return data.id

    } catch (error) {
      console.error('데이터베이스 저장 오류:', error)
      return null
    }
  }

  async crawlAndSave(): Promise<void> {
    try {
      await this.init()
      await this.login()
      await this.navigateToEvents()

      const campaigns = await this.extractCampaigns()

      for (const campaign of campaigns) {
        await this.saveCampaignToDatabase(campaign)
        console.log(`처리 완료: ${campaign.title}`)
      }

      console.log('크롤링 프로세스 완료!')

    } catch (error) {
      console.error('크롤링 프로세스 오류:', error)
      throw error
    } finally {
      await this.close()
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}