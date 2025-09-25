import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pick - 기획전 갤러리';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Pick
          </div>
        </div>
        <div
          style={{
            fontSize: '36px',
            color: 'white',
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: '800px',
            lineHeight: 1.2,
          }}
        >
          최신 기획전과 이벤트를 한눈에!
        </div>
        <div
          style={{
            fontSize: '24px',
            color: 'white',
            textAlign: 'center',
            opacity: 0.7,
            marginTop: '20px',
          }}
        >
          AI가 엄선한 특가 상품 정보를 확인하세요
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
