-- Supabase 데이터베이스 스키마 설정

-- campaigns 테이블 생성
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  partner_link TEXT NOT NULL,
  category TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- blog_posts 테이블 생성
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_campaign_id ON blog_posts(campaign_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Enable read access for all users" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON blog_posts FOR SELECT USING (true);

-- 서비스 역할만 쓰기 가능하도록 설정
CREATE POLICY "Enable insert for service role only" ON campaigns FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update for service role only" ON campaigns FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Enable delete for service role only" ON campaigns FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Enable insert for service role only" ON blog_posts FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update for service role only" ON blog_posts FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Enable delete for service role only" ON blog_posts FOR DELETE USING (auth.role() = 'service_role');