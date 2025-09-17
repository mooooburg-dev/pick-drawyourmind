# Pick - 쿠팡 파트너스 기획전 갤러리

쿠팡 파트너스 기획전을 자동으로 수집하여 예쁘게 갤러리로 보여주는 웹사이트입니다.

## 🎯 프로젝트 개요

- **목표**: 쿠팡 파트너스 기획전 자동 큐레이션 서비스 구축
- **도메인**: pick.drawyourmind.com
- **기술 스택**: Next.js + TypeScript + Tailwind CSS + Supabase + Playwright

## 🚀 주요 기능

### 1. 자동 크롤링
- 매일 자정 GitHub Actions를 통한 자동 크롤링
- Playwright를 이용한 쿠팡 파트너스 페이지 크롤링
- 새로운 기획전 자동 감지 및 데이터 수집

### 2. 갤러리 웹사이트
- Pinterest 스타일 기획전 갤러리
- 카테고리별 필터링 기능
- 반응형 디자인 (모바일 최적화)
- 쿠팡 파트너스 링크 직접 연결

### 3. AI 블로그 포스팅
- ChatGPT를 이용한 자동 블로그 포스팅 생성
- 기획전 정보 기반 컨텐츠 작성
- Supabase에 자동 저장

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Storage)
- **Automation**: Playwright + GitHub Actions
- **AI**: OpenAI GPT API
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/pick-drawyourmind.git
cd pick-drawyourmind
```

### 2. 의존성 설치
```bash
npm install
npx playwright install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 필요한 환경변수를 설정합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Coupang Partners
COUPANG_PARTNERS_EMAIL=your_email
COUPANG_PARTNERS_PASSWORD=your_password

# Application
NEXT_PUBLIC_SITE_URL=https://pick.drawyourmind.com
```

### 4. 데이터베이스 설정
Supabase에서 다음 SQL을 실행하여 테이블을 생성합니다:

```sql
-- lib/database.sql 파일의 내용을 실행
```

### 5. 개발 서버 실행
```bash
npm run dev
```

## 🤖 크롤링 실행

### 수동 크롤링
```bash
npm run crawl
```

### API를 통한 크롤링
```bash
curl -X POST http://localhost:3000/api/crawl
```

## 📊 데이터 구조

### campaigns 테이블
- `id` (UUID): 고유 식별자
- `title` (TEXT): 기획전 제목
- `image_url` (TEXT): 이미지 URL
- `partner_link` (TEXT): 쿠팡 파트너스 링크
- `category` (TEXT): 카테고리
- `start_date` (DATE): 시작일
- `end_date` (DATE): 종료일
- `is_active` (BOOLEAN): 활성 상태
- `created_at` (TIMESTAMP): 생성일

### blog_posts 테이블
- `id` (UUID): 고유 식별자
- `campaign_id` (UUID): 캠페인 ID (외래키)
- `content` (TEXT): 블로그 포스팅 내용
- `created_at` (TIMESTAMP): 생성일

## 🔄 자동화 워크플로우

1. **GitHub Actions** (매일 오전 3시)
   ↓
2. **Playwright** → 쿠팡 파트너스 크롤링
   ↓
3. **새 기획전 감지** → 이미지/데이터 수집
   ↓
4. **ChatGPT** → 블로그 포스팅 생성
   ↓
5. **Supabase** → 데이터 저장
   ↓
6. **Vercel** → 자동 재배포

## 📝 API 엔드포인트

- `GET /api/campaigns` - 기획전 목록 조회
- `GET /api/campaigns/[id]` - 특정 기획전 조회
- `POST /api/crawl` - 크롤링 실행

## 🚀 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경변수 설정
3. 자동 배포

### GitHub Secrets 설정
GitHub Actions를 위해 다음 secrets을 설정해야 합니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `COUPANG_PARTNERS_EMAIL`
- `COUPANG_PARTNERS_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

**면책 조항**: 이 프로젝트는 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.