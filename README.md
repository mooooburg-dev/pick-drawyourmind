# Pick - 기획전 갤러리

갤러리와 AI 블로그 포스팅 자동 생성하는 웹사이트입니다.

## 🎯 프로젝트 개요

- **목표**: 갤러리 및 블로그 자동화 서비스
- **도메인**: pick.drawyourmind.com
- **기술 스택**: Next.js 15 + TypeScript + Tailwind CSS + Supabase + TinyMCE

## 🚀 주요 기능

### 1. 갤러리 웹사이트

- Pinterest 스타일 갤러리
- 카테고리별 필터링 기능
- 반응형 디자인 (모바일 최적화)

### 2. 블로그 시스템

- **자동 블로그 생성**: OpenAI GPT를 이용한 블로그 포스팅 자동 작성
- **관리자 패널**: 블로그 포스트 편집 및 관리 기능
- **TinyMCE 에디터**: 전문적인 WYSIWYG 에디터로 블로그 편집
- **프리미엄 기능**: AI Assistant, 스펠체크, 마크다운, Word/PDF 가져오기/내보내기

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Storage)
- **Editor**: TinyMCE (Premium WYSIWYG Editor)
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

# TinyMCE (Optional - using cloud CDN with API key)
TINYMCE_API_KEY=your_tinymce_api_key

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

### 6. 관리자 패널 접속

개발 서버 실행 후 `http://localhost:3000/admin`에 접속하여 관리자 패널을 사용할 수 있습니다.

- **기본 비밀번호**: `admin2024!`
- **기능**: 기획전 관리, 블로그 포스트 편집, TinyMCE 에디터 사용

## 🤖 테스트

### OpenAI 테스트

```bash
npm run test:openai
```

## 📊 데이터 구조

### campaigns 테이블

- `id` (UUID): 고유 식별자
- `title` (TEXT): 제목
- `image_url` (TEXT): 이미지 URL
- `partner_link` (TEXT): 링크
- `category` (TEXT): 카테고리
- `start_date` (DATE): 시작일
- `end_date` (DATE): 종료일
- `is_active` (BOOLEAN): 활성 상태
- `created_at` (TIMESTAMP): 생성일

### blog_posts 테이블

- `id` (UUID): 고유 식별자
- `campaign_id` (UUID): 캠페인 ID (외래키)
- `title` (TEXT): 블로그 포스트 제목
- `content` (TEXT): 블로그 포스팅 HTML 내용
- `excerpt` (TEXT): 블로그 포스트 요약
- `tags` (TEXT[]): 태그 배열
- `meta_description` (TEXT): SEO 메타 설명
- `slug` (TEXT): URL 슬러그
- `is_published` (BOOLEAN): 발행 여부
- `created_at` (TIMESTAMP): 생성일
- `updated_at` (TIMESTAMP): 수정일

## 🔄 데이터 플로우

1. **관리자 패널** → 데이터 입력
   ↓
2. **ChatGPT** → 블로그 포스팅 생성
   ↓
3. **Supabase** → 데이터 저장
   ↓
4. **Vercel** → 자동 재배포

## 📝 API 엔드포인트

### 캠페인 API

- `GET /api/campaigns` - 캠페인 목록 조회
- `GET /api/campaigns/[id]` - 특정 캠페인 조회

### 블로그 API

- `GET /api/blog` - 블로그 포스트 목록 조회
- `GET /api/blog/[slug]` - 특정 블로그 포스트 조회

### 관리자 API

- `GET /api/admin/campaigns/all` - 모든 캠페인 조회 (관리자)
- `POST /api/admin/campaigns` - 캠페인 추가
- `PATCH /api/admin/campaigns/[id]` - 캠페인 수정
- `DELETE /api/admin/campaigns/[id]` - 캠페인 삭제
- `GET /api/admin/blog` - 모든 블로그 포스트 조회 (관리자)
- `PATCH /api/admin/blog/[id]` - 블로그 포스트 수정
- `DELETE /api/admin/blog/[id]` - 블로그 포스트 삭제

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정
3. 자동 배포

### GitHub Secrets 설정

필요한 환경변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.
