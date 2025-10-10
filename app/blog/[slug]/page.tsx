import { Metadata } from 'next';
import Link from 'next/link';
import { BlogPost, Campaign, getSupabase } from '@/lib/supabase';
import BlogPostClient from './BlogPostClient';

interface BlogPostWithCampaign extends BlogPost {
  campaigns?: Campaign;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server-side data fetching function - Supabase에서 직접 가져오기
async function getBlogPostData(
  slug: string
): Promise<BlogPostWithCampaign | null> {
  try {
    // URL 디코딩 (이미 디코딩되어 있을 수 있지만 명시적으로 처리)
    const decodedSlug = decodeURIComponent(slug);

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        campaigns (*)
      `
      )
      .eq('slug', decodedSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data as BlogPostWithCampaign;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostData(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  const title = post.title || 'Pick - 기획전';
  const description =
    post.meta_description ||
    post.excerpt ||
    `${post.campaigns?.title || '특가 상품'}을 확인해보세요!`;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pick.drawyourmind.com';
  const pageUrl = `${baseUrl}/blog/${slug}`;

  const imageUrl = post.featured_image_url || post.campaigns?.image_url || `${baseUrl}/default-og-image.svg`;

  const keywords = post.tags || ['기획전', '쇼핑', '특가', '할인'];

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'pick.drawyourmind.com', url: baseUrl }],
    creator: 'pick.drawyourmind.com',
    publisher: 'Pick - 기획전 갤러리',
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: pageUrl,
      siteName: 'Pick - 기획전 갤러리',
      locale: 'ko_KR',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: ['pick.drawyourmind.com'],
      section: post.campaigns?.category || '기획전',
      tags: post.tags || [],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@pick_deals',
      site: '@pick_deals',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostData(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              포스트를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-6">
              요청하신 블로그 포스트를 찾을 수 없습니다.
            </p>
            <Link
              href="/blog"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              목록 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BlogPostClient initialPost={post} />;
}
