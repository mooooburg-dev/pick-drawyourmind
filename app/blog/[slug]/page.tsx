import { Metadata } from 'next';
import Link from 'next/link';
import { BlogPost, Campaign } from '@/lib/supabase';
import BlogPostClient from './BlogPostClient';

interface BlogPostWithCampaign extends BlogPost {
  campaigns?: Campaign;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server-side data fetching function
async function getBlogPostData(slug: string): Promise<BlogPostWithCampaign | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: 'no-store', // Always fetch fresh data for SEO
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostData(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 | Pick',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.',
    };
  }

  const title = post.title || 'Pick - 쿠팡 파트너스 기획전';
  const description =
    post.meta_description ||
    post.excerpt ||
    `${post.campaigns?.title || '특가 상품'}을 확인해보세요!`;

  // Image URL with proper fallback
  const getImageUrl = () => {
    if (post.featured_image_url) {
      // Validate if it's a full URL, if not make it absolute
      if (post.featured_image_url.startsWith('http')) {
        return post.featured_image_url;
      }
      return `https://pick.drawyourmind.com${post.featured_image_url}`;
    }

    if (post.campaigns?.image_url) {
      return post.campaigns.image_url;
    }

    return '/default-og-image.svg';
  };

  const imageUrl = getImageUrl();
  const keywords = post.tags ? post.tags.join(', ') : '쿠팡, 파트너스, 특가, 쇼핑, 기획전';

  return {
    title,
    description,
    keywords: keywords.split(', '),
    authors: [{ name: 'Pick Team' }],
    creator: 'Pick Team',
    publisher: 'Pick - 쿠팡 파트너스 기획전 갤러리',
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: ['Pick Team'],
      section: post.campaigns?.category,
      tags: post.tags || [],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Pick - 쿠팡 파트너스 기획전 갤러리',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@pick_deals',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `/blog/${slug}`,
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
            <p className="text-gray-600 mb-6">요청하신 블로그 포스트를 찾을 수 없습니다.</p>
            <Link
              href="/blog"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BlogPostClient initialPost={post} slug={slug} />;
}
