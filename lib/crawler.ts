import { chromium, Browser, Page } from 'playwright'
import { getSupabaseAdmin } from './supabase'
import { generateBlogPost } from './openai'

export interface CampaignData {
  title: string
  imageUrl: string
  partnerLink: string
  category?: string
}

export class CoupangCrawler {
  private browser: Browser | null = null
  private page: Page | null = null

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()

    // 한국어 설정
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    })
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      // 쿠팡 파트너스 로그인 페이지로 이동
      await this.page.goto('https://partners.coupang.com/login')
      await this.page.waitForLoadState('networkidle')

      // 로그인 정보 입력
      await this.page.fill('input[name="email"], input[type="email"]', process.env.COUPANG_PARTNERS_EMAIL!)
      await this.page.fill('input[name="password"], input[type="password"]', process.env.COUPANG_PARTNERS_PASSWORD!)

      // 로그인 버튼 클릭
      await this.page.click('button[type="submit"], .login-button, input[type="submit"]')

      // 로그인 완료 대기
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(3000)

      console.log('쿠팡 파트너스 로그인 완료')
    } catch (error) {
      console.error('로그인 실패:', error)
      throw new Error('Failed to login to Coupang Partners')
    }
  }

  async navigateToPromotions(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      // 링크생성 > 이벤트/프로모션 링크 메뉴로 이동
      await this.page.goto('https://partners.coupang.com/promotions')
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(2000)

      console.log('이벤트/프로모션 페이지로 이동 완료')
    } catch (error) {
      console.error('프로모션 페이지 이동 실패:', error)
      throw new Error('Failed to navigate to promotions page')
    }
  }

  async extractCampaigns(): Promise<CampaignData[]> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      const campaigns: CampaignData[] = []

      // 기획전 목록 요소들 대기
      await this.page.waitForSelector('.promotion-item, .campaign-item, .event-item', { timeout: 10000 })

      // 기획전 정보 추출
      const campaignElements = await this.page.$$('.promotion-item, .campaign-item, .event-item')

      for (const element of campaignElements.slice(0, 10)) { // 최신 10개만 가져오기
        try {
          const title = await element.$eval('h3, .title, .campaign-title', el => el.textContent?.trim())
          const imageUrl = await element.$eval('img', el => el.src)
          const link = await element.$eval('a', el => el.href)

          if (title && imageUrl && link) {
            campaigns.push({
              title,
              imageUrl,
              partnerLink: link,
              category: '일반'
            })
          }
        } catch (err) {
          console.log('개별 캠페인 추출 실패:', err)
          continue
        }
      }

      console.log(`총 ${campaigns.length}개의 기획전 추출 완료`)
      return campaigns
    } catch (error) {
      console.error('기획전 추출 실패:', error)
      throw new Error('Failed to extract campaigns')
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

  async generateAndSaveBlogPost(campaignId: string, campaignData: CampaignData): Promise<void> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const blogContent = await generateBlogPost({
        title: campaignData.title,
        category: campaignData.category
      })

      const { error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          campaign_id: campaignId,
          content: blogContent
        })

      if (error) {
        console.error('블로그 포스트 저장 실패:', error)
      } else {
        console.log(`블로그 포스트 생성 완료: ${campaignData.title}`)
      }
    } catch (error) {
      console.error('블로그 포스트 생성 오류:', error)
    }
  }

  async crawlAndSave(): Promise<void> {
    try {
      await this.init()
      await this.login()
      await this.navigateToPromotions()

      const campaigns = await this.extractCampaigns()

      for (const campaign of campaigns) {
        const campaignId = await this.saveCampaignToDatabase(campaign)

        if (campaignId) {
          // 새로 저장된 캠페인에만 블로그 포스트 생성
          const supabaseAdmin = getSupabaseAdmin()
          const { data: existingPost } = await supabaseAdmin
            .from('blog_posts')
            .select('id')
            .eq('campaign_id', campaignId)
            .single()

          if (!existingPost) {
            await this.generateAndSaveBlogPost(campaignId, campaign)
          }
        }
      }
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