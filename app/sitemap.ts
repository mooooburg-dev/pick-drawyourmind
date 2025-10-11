import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pick.drawyourmind.com'

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/curation`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // 동적 블로그 포스트 페이지
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: blogPosts } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    const blogPages: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...blogPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // 오류가 발생해도 정적 페이지는 반환
    return staticPages
  }
}
