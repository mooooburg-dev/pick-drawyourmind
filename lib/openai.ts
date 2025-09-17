import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateBlogPost(campaignData: {
  title: string
  category?: string
}): Promise<string> {
  try {
    const prompt = `
쿠팡 파트너스 기획전 정보를 바탕으로 블로그 포스팅을 작성해주세요.

기획전 정보:
- 제목: ${campaignData.title}
- 카테고리: ${campaignData.category || '일반'}

작성 가이드라인:
1. 친근하고 자연스러운 톤앤매너 사용
2. 1000-1500자 분량
3. 제품의 장점과 특징 강조
4. 구매 유도 문구 포함
5. 마크다운 형식으로 작성
6. SEO를 고려한 키워드 자연스럽게 포함

구조:
- 제목 (H1)
- 인트로 (소개)
- 제품/이벤트 소개 (H2)
- 주요 특징/장점 (H2)
- 추천 이유 (H2)
- 구매 링크 안내 (H2)
- 마무리

블로그 포스팅을 작성해주세요:
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 쿠팡 파트너스 마케팅에 특화된 블로그 작성 전문가입니다. 독자들이 관심을 가질 만한 매력적이고 자연스러운 포스팅을 작성합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating blog post:', error)
    throw new Error('Failed to generate blog post')
  }
}

export { openai }