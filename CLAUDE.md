# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 커밋 메시지, 주석 등은 모두 한글을 사용해서 작성함.
- 커밋 할때 CLAUDE 관련 이름, 내용은 제거

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run crawl` - Execute the Coupang Partners crawler script
- `npx playwright install` - Install Playwright browsers (required for crawling)

## Architecture Overview

This is a Next.js 15 application that creates a gallery of Coupang Partners campaigns (Korean e-commerce affiliate marketing). The system consists of three main components:

### Core Components

1. **Web Crawler (`lib/crawler-improved.ts`)**: Playwright-based automation that logs into Coupang Partners and scrapes campaign data. Runs via GitHub Actions daily at 3 AM KST.

2. **Gallery Frontend**: Next.js app with a Pinterest-style grid layout displaying campaigns with category filtering. Uses `app/` directory structure.

3. **Blog System**: AI-generated blog posts about campaigns using OpenAI API, stored in Supabase.

### Key Architecture Patterns

- **Data Flow**: Crawler → Supabase → API routes → Frontend
- **Image Handling**: External image URLs from Coupang CDN, configured in `next.config.ts`
- **Database**: Supabase PostgreSQL with two main tables: `campaigns` and `blog_posts`
- **Styling**: Tailwind CSS with custom component patterns
- **State Management**: React hooks with client-side fetching

### Directory Structure

- `app/` - Next.js 15 app directory with pages and API routes
- `lib/` - Core utilities (Supabase client, crawler, OpenAI integration)
- `scripts/` - Executable scripts for crawling
- `.github/workflows/` - Automated crawling via GitHub Actions

### API Routes

- `GET /api/campaigns` - Fetch campaigns with pagination and category filtering
- `GET /api/campaigns/[id]` - Get specific campaign
- `POST /api/crawl` - Trigger manual crawling
- `/api/admin/` - Admin management endpoints
- `/api/blog/` - Blog post endpoints

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
COUPANG_PARTNERS_EMAIL=
COUPANG_PARTNERS_PASSWORD=
NEXT_PUBLIC_SITE_URL=
```

### Database Schema

Two main tables defined in `lib/database.sql`:

- `campaigns` - Campaign data with title, image_url, partner_link, category
- `blog_posts` - AI-generated blog content linked to campaigns

### Korean Language Support

The application is fully Korean-localized including:

- UI text and error messages
- Date formatting (`ko-KR` locale)
- SEO metadata in Korean
- Category names in Korean

### Automation

GitHub Actions workflow runs daily crawler that:

1. Logs into Coupang Partners using Playwright
2. Scrapes new campaign data
3. Saves to Supabase database
4. Optionally generates blog posts via OpenAI

### Testing Notes

- Run `npm run crawl` locally to test crawler functionality
- Ensure Playwright browsers are installed before crawling
- Use admin interface at `/admin` for campaign management
- Check `/blog` route for AI-generated content
