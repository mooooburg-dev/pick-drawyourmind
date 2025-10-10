import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pick - 블로그 포스트';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://pick-drawyourmind.vercel.app'
        : 'http://localhost:3000');

    const response = await fetch(`${baseUrl}/api/blog/${slug}`);
    if (!response.ok) return null;

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch blog post for OG image:', error);
    return null;
  }
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const title = post?.title || 'Pick 블로그';
  const category = post?.campaigns?.category || '기획전';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: '80px',
        }}
      >
        {/* 브랜드 로고 */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '40px',
            opacity: 0.9,
          }}
        >
          Pick
        </div>

        {/* 메인 제목 */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '30px',
            maxWidth: '1000px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {title.length > 50 ? title.substring(0, 50) + '...' : title}
        </div>

        {/* 카테고리 태그 */}
        <div
          style={{
            fontSize: '24px',
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '25px',
            marginBottom: '20px',
          }}
        >
          {category}
        </div>

        {/* 하단 설명 */}
        <div
          style={{
            fontSize: '20px',
            color: 'white',
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          기획전 정보와 특가 상품을 확인하세요
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
