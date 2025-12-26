-- Ensure news table has engagement columns
ALTER TABLE news ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Ensure news_reactions table exists
CREATE TABLE IF NOT EXISTS news_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- Ensure news_comments table exists
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

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_news_comments_news ON news_comments(news_id, created_at DESC);

-- Ensure news_bookmarks table exists
CREATE TABLE IF NOT EXISTS news_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

