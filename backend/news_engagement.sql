-- 1. Update 'news' table with engagement counters if they don't exist
ALTER TABLE news ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 2. Create 'news_reactions' table (Likes/Dislikes)
CREATE TABLE IF NOT EXISTS news_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- 3. Create 'news_comments' table
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  translated_body TEXT,
  likes INTEGER DEFAULT 0,
  liked_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_comments_news ON news_comments(news_id, created_at DESC);

-- 4. Create 'news_bookmarks' table
CREATE TABLE IF NOT EXISTS news_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- 5. Add Triggers for updated_at (if not already present)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_news_comments_updated_at ON news_comments;
CREATE TRIGGER update_news_comments_updated_at BEFORE UPDATE ON news_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
