import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.buzzni.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.coupangcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbnail*.coupangcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      // 뉴스 사이트 이미지 도메인들
      {
        protocol: 'https',
        hostname: 'imgnews.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'img.khan.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'res.heraldm.com',
      },
      {
        protocol: 'https',
        hostname: 'images.chosun.com',
      },
      {
        protocol: 'https',
        hostname: 'ojsfile.ohmynews.com',
      },
      {
        protocol: 'https',
        hostname: 'img.seoul.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'cdn.aitimes.com',
      },
      {
        protocol: 'https',
        hostname: 'thumb.mt.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'file.mk.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'photo.hankooki.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.newspim.com',
      },
      {
        protocol: 'https',
        hostname: 'image.kmib.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'img.ytn.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'flexible.img.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mhns.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'newsimg.sedaily.com',
      },
      {
        protocol: 'https',
        hostname: 'photo.jtbc.joins.com',
      },
      {
        protocol: 'https',
        hostname: 'img.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.zdnet.co.kr',
      },
      // 와일드카드 패턴으로 더 많은 뉴스 사이트 커버
      {
        protocol: 'https',
        hostname: '*.joins.com',
      },
      {
        protocol: 'https',
        hostname: '*.donga.com',
      },
      {
        protocol: 'https',
        hostname: '*.chosun.com',
      },
      {
        protocol: 'https',
        hostname: '*.hankyung.com',
      },
      {
        protocol: 'https',
        hostname: '*.naver.com',
      },
      {
        protocol: 'https',
        hostname: '*.daum.net',
      },
      {
        protocol: 'https',
        hostname: '*.kakao.com',
      },
    ],
  },
};

export default nextConfig;
