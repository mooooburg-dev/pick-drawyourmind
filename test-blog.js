const { chromium } = require('playwright');

(async () => {
  console.log('🎭 Starting Playwright test for blog functionality...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to blog page
    console.log('📱 Navigating to blog page...');
    await page.goto('https://pick-drawyourmind.vercel.app/blog');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of blog page
    await page.screenshot({ path: 'blog-page.png' });
    console.log('📸 Screenshot saved as blog-page.png');

    // Check if blog posts are loaded
    const blogPosts = await page.locator('article').count();
    console.log(`📝 Found ${blogPosts} blog posts on the page`);

    if (blogPosts > 0) {
      // Try to click the first "자세히 보기" link
      console.log('🔗 Trying to click first "자세히 보기" link...');
      const firstDetailLink = page.locator('text=자세히 보기').first();

      if (await firstDetailLink.count() > 0) {
        const href = await firstDetailLink.getAttribute('href');
        console.log(`🔗 First detail link href: ${href}`);

        // Click the link
        await firstDetailLink.click();

        // Wait for navigation
        await page.waitForLoadState('networkidle');

        // Check current URL
        const currentUrl = page.url();
        console.log(`📍 Current URL after click: ${currentUrl}`);

        // Take screenshot of blog post page
        await page.screenshot({ path: 'blog-post-page.png' });
        console.log('📸 Screenshot saved as blog-post-page.png');

        // Check if we're on a blog post page or error page
        const pageTitle = await page.title();
        const h1Text = await page.locator('h1').first().textContent();
        console.log(`📄 Page title: ${pageTitle}`);
        console.log(`📋 H1 text: ${h1Text}`);

        // Check if there's an error message
        const errorText = await page.locator('text=포스트를 찾을 수 없습니다').count();
        if (errorText > 0) {
          console.log('❌ Error: Blog post not found message detected');
        } else {
          console.log('✅ Blog post page loaded successfully');
        }
      } else {
        console.log('❌ No "자세히 보기" links found');
      }
    } else {
      console.log('❌ No blog posts found on the page');

      // Check if there's a "no posts" message
      const noPostsText = await page.locator('text=아직 블로그 포스트가 없습니다').count();
      if (noPostsText > 0) {
        console.log('📝 "No blog posts" message found');
      }
    }

    // Test direct URL access
    console.log('🔗 Testing direct URL access...');
    await page.goto('https://pick-drawyourmind.vercel.app/blog/독서의-계절-도서x문구-sale로-특별한-할인-혜택--1758211184216');
    await page.waitForLoadState('networkidle');

    const directUrlTitle = await page.title();
    const directUrlH1 = await page.locator('h1').first().textContent();
    console.log(`📄 Direct URL page title: ${directUrlTitle}`);
    console.log(`📋 Direct URL H1 text: ${directUrlH1}`);

    // Take screenshot of direct URL access
    await page.screenshot({ path: 'direct-blog-url.png' });
    console.log('📸 Screenshot saved as direct-blog-url.png');

    const directUrlError = await page.locator('text=포스트를 찾을 수 없습니다').count();
    if (directUrlError > 0) {
      console.log('❌ Error: Direct URL also shows "post not found"');
    } else {
      console.log('✅ Direct URL works correctly');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    console.log('🔚 Test completed. Keeping browser open for manual inspection...');
    // Don't close browser automatically so we can inspect
    // await browser.close();
  }
})();