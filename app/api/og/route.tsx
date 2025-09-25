import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: '"Inter", "Arial", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            marginBottom: 40,
          }}
        >
          Pick
        </div>
        <div
          style={{
            fontSize: 40,
            marginBottom: 20,
            opacity: 0.9,
          }}
        >
          갤러리
        </div>
        <div
          style={{
            fontSize: 28,
            opacity: 0.8,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          최신 특가 상품과 이벤트 정보
        </div>
        <div
          style={{
            fontSize: 20,
            opacity: 0.7,
            marginTop: 60,
          }}
        >
          pick.drawyourmind.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}