-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Initial Schema (from 001_initial_schema.sql)
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'publisher', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  profile JSONB DEFAULT '{}',
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  otp_verified_at TIMESTAMPTZ,
  refresh_token_hash TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Device Sessions table
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_platform TEXT,
  app_version TEXT,
  last_ip TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id),
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status, published_at DESC);

-- News Bookmarks
CREATE TABLE IF NOT EXISTS news_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- News Reactions
CREATE TABLE IF NOT EXISTS news_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- News Comments
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

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ,
  related_event_ids UUID[] DEFAULT '{}',
  related_feast_ids UUID[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  audio_url TEXT,
  reading_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);

-- Article Bookmarks
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  coordinates JSONB,
  description TEXT,
  feast_id UUID,
  featured BOOLEAN DEFAULT FALSE,
  flyer_images TEXT[] DEFAULT '{}',
  reminder_enabled BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Feasts table
CREATE TABLE IF NOT EXISTS feasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  region TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  article_ids UUID[] DEFAULT '{}',
  biography TEXT,
  traditions TEXT[] DEFAULT '{}',
  readings TEXT[] DEFAULT '{}',
  prayers TEXT[] DEFAULT '{}',
  reminder_enabled BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feasts_date ON feasts(date);
CREATE INDEX IF NOT EXISTS idx_feasts_region_date ON feasts(region, date);

-- Game Scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('trivia', 'puzzle', 'saint', 'memory')),
  score INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_game ON game_scores(user_id, game, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_leaderboard ON game_scores(game, score DESC);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  cloudinary_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document', 'audio')),
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by, created_at DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('assignment', 'submission', 'news', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_user_ids UUID[] DEFAULT '{}',
  target_role TEXT CHECK (target_role IN ('all', 'user', 'publisher', 'admin')),
  metadata JSONB DEFAULT '{}',
  read_by_user_ids UUID[] DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications USING GIN(target_user_ids);

-- Progress Reports table
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  pdf_url TEXT,
  before_image TEXT,
  after_image TEXT,
  media_gallery TEXT[] DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  liked_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Readings table
CREATE TABLE IF NOT EXISTS daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  gospel JSONB NOT NULL,
  epistle JSONB,
  psalms TEXT[] DEFAULT '{}',
  reflections TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'amharic' CHECK (language IN ('amharic', 'english', 'geez')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_readings_date ON daily_readings(date);

-- Publisher Requests table
CREATE TABLE IF NOT EXISTS publisher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_publisher_requests_status ON publisher_requests(status, requested_at DESC);

-- Offline Cache table
CREATE TABLE IF NOT EXISTS offline_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  entity TEXT NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  version INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  device_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offline_cache_user_device ON offline_cache(user_id, device_id, entity);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_comments_updated_at ON news_comments;
CREATE TRIGGER update_news_comments_updated_at BEFORE UPDATE ON news_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feasts_updated_at ON feasts;
CREATE TRIGGER update_feasts_updated_at BEFORE UPDATE ON feasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_reports_updated_at ON progress_reports;
CREATE TRIGGER update_progress_reports_updated_at BEFORE UPDATE ON progress_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_readings_updated_at ON daily_readings;
CREATE TRIGGER update_daily_readings_updated_at BEFORE UPDATE ON daily_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publisher_requests_updated_at ON publisher_requests;
CREATE TRIGGER update_publisher_requests_updated_at BEFORE UPDATE ON publisher_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_offline_cache_updated_at ON offline_cache;
CREATE TRIGGER update_offline_cache_updated_at BEFORE UPDATE ON offline_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. Add News Images (from 002)
-- ==========================================
ALTER TABLE news ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

UPDATE news 
SET images = ARRAY[cover_image] 
WHERE cover_image IS NOT NULL 
  AND cover_image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- ==========================================
-- 3. Add Articles Images (from 003)
-- ==========================================
ALTER TABLE articles ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

UPDATE articles 
SET images = ARRAY[cover_image] 
WHERE cover_image IS NOT NULL 
  AND cover_image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- ==========================================
-- 4. Ensure News Engagement Columns (from 004)
-- ==========================================
ALTER TABLE news ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- (The tables news_reactions, news_comments, news_bookmarks were already included in section 1 because they were present in 001 or 004, but running CREATE TABLE IF NOT EXISTS is safe)

-- ==========================================
-- 5. Separate Publishers Table (from 005)
-- ==========================================
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  phone TEXT,
  region TEXT,
  language TEXT,
  avatar_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publishers_region ON publishers(region);

DROP TRIGGER IF EXISTS update_publishers_updated_at ON publishers;
CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing publisher profiles
INSERT INTO publishers (id, bio, phone, region, language, avatar_url, created_at, updated_at)
SELECT 
  id,
  profile->>'bio',
  profile->>'phone',
  profile->>'region',
  profile->>'language',
  profile->>'avatarUrl',
  created_at,
  updated_at
FROM users 
WHERE role = 'publisher'
ON CONFLICT (id) DO NOTHING;
- -   C r e a t e   d a i l y _ r e a d i n g s   t a b l e  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   d a i l y _ r e a d i n g s   (  
     i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
     d a t e   D A T E   N O T   N U L L   U N I Q U E ,  
      
     - -   G o s p e l  
     g o s p e l _ g e e z   T E X T ,  
     g o s p e l _ a m h a r i c   T E X T ,  
     g o s p e l _ a u d i o _ u r l   T E X T ,  
      
     - -   E p i s t l e  
     e p i s t l e _ g e e z   T E X T ,  
     e p i s t l e _ a m h a r i c   T E X T ,  
     e p i s t l e _ a u d i o _ u r l   T E X T ,  
      
     - -   P s a l m s  
     p s a l m _ g e e z   T E X T ,  
     p s a l m _ a m h a r i c   T E X T ,  
     p s a l m _ a u d i o _ u r l   T E X T ,  
      
     c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
     u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   C r e a t e   R L S   p o l i c i e s  
 A L T E R   T A B L E   d a i l y _ r e a d i n g s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   A l l o w   p u b l i c   r e a d   a c c e s s  
 C R E A T E   P O L I C Y   " P u b l i c   c a n   v i e w   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   S E L E C T    
     U S I N G   ( t r u e ) ;  
  
 - -   A l l o w   a d m i n s / p u b l i s h e r s   t o   i n s e r t / u p d a t e   ( A s s u m i n g   a u t h o r s   c a n   b e   m a n a g e d   v i a   s a m e   r o l e   p e r m i s s i o n s   o r   r e s t r i c t e d   t o   a d m i n s )  
 - -   F o r   n o w   a l l o w i n g   a u t h e n t i c a t e d   u s e r s   w i t h   a p p r o p r i a t e   r o l e s   ( a d m i n   g e n e r a l l y   f o r   g l o b a l   d a i l y   r e a d i n g s )  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   m a n a g e   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   A L L    
     U S I N G   ( a u t h . u i d ( )   I N   ( S E L E C T   i d   F R O M   u s e r s   W H E R E   r o l e   =   ' a d m i n ' ) ) ;  
 - -   D r o p   e x i s t i n g   t a b l e   t o   r e c r e a t e   w i t h   n e w   s t r u c t u r e  
 D R O P   T A B L E   I F   E X I S T S   d a i l y _ r e a d i n g s ;  
  
 C R E A T E   T A B L E   d a i l y _ r e a d i n g s   (  
     i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
     d a t e   D A T E   N O T   N U L L ,  
     t i m e _ o f _ d a y   T E X T   N O T   N U L L   C H E C K   ( t i m e _ o f _ d a y   I N   ( ' M o r n i n g ' ,   ' E v e n i n g ' ) ) ,  
      
     - -   G o s p e l   ( T e x t   +   A u d i o   +   R e f )  
     g o s p e l _ g e e z   T E X T ,  
     g o s p e l _ a m h a r i c   T E X T ,  
     g o s p e l _ a u d i o _ u r l   T E X T ,  
     g o s p e l _ r e f   T E X T ,   - -   B o o k   N a m e ,   C h a p t e r ,   V e r s e  
      
     - -   E p i s t l e   ( T e x t   +   R e f ,   N O   A u d i o )  
     e p i s t l e _ g e e z   T E X T ,  
     e p i s t l e _ a m h a r i c   T E X T ,  
     e p i s t l e _ r e f   T E X T ,  
      
     - -   P s a l m s   ( T e x t   +   A u d i o   +   R e f )  
     p s a l m _ g e e z   T E X T ,  
     p s a l m _ a m h a r i c   T E X T ,  
     p s a l m _ a u d i o _ u r l   T E X T ,  
     p s a l m _ r e f   T E X T ,  
      
     - -   A c t s   ( T e x t   +   R e f ,   A s s u m i n g   N o   A u d i o   f o r   n o w   a s   s i m p l e   t e x t   u p l o a d e r   r e q u e s t e d )  
     a c t s _ g e e z   T E X T ,  
     a c t s _ a m h a r i c   T E X T ,  
     a c t s _ r e f   T E X T ,  
      
     c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
     u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
      
     - -   E n s u r e   o n e   m o r n i n g   a n d   o n e   e v e n i n g   r e a d i n g   p e r   d a t e  
     U N I Q U E ( d a t e ,   t i m e _ o f _ d a y )  
 ) ;  
  
 - -   R e - a p p l y   R L S  
 A L T E R   T A B L E   d a i l y _ r e a d i n g s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 C R E A T E   P O L I C Y   " P u b l i c   c a n   v i e w   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   S E L E C T    
     U S I N G   ( t r u e ) ;  
  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   m a n a g e   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   A L L    
     U S I N G   ( a u t h . u i d ( )   I N   ( S E L E C T   i d   F R O M   u s e r s   W H E R E   r o l e   =   ' a d m i n ' ) ) ;  
 - -   D r o p   e x i s t i n g   t a b l e   t o   r e c r e a t e   w i t h   n e w   s t r u c t u r e  
 D R O P   T A B L E   I F   E X I S T S   d a i l y _ r e a d i n g s ;  
  
 C R E A T E   T A B L E   d a i l y _ r e a d i n g s   (  
     i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
     d a t e   D A T E   N O T   N U L L ,  
     t i m e _ o f _ d a y   T E X T   N O T   N U L L   C H E C K   ( t i m e _ o f _ d a y   I N   ( ' M o r n i n g ' ,   ' E v e n i n g ' ) ) ,  
      
     - -   G o s p e l   ( T e x t   +   A u d i o   +   R e f )  
     g o s p e l _ g e e z   T E X T ,  
     g o s p e l _ a m h a r i c   T E X T ,  
     g o s p e l _ a u d i o _ u r l   T E X T ,  
     g o s p e l _ r e f   T E X T ,   - -   B o o k   N a m e ,   C h a p t e r ,   V e r s e  
      
     - -   E p i s t l e   ( T e x t   +   R e f ,   N O   A u d i o )  
     e p i s t l e _ g e e z   T E X T ,  
     e p i s t l e _ a m h a r i c   T E X T ,  
     e p i s t l e _ r e f   T E X T ,  
      
     - -   P s a l m s   ( T e x t   +   A u d i o   +   R e f )  
     p s a l m _ g e e z   T E X T ,  
     p s a l m _ a m h a r i c   T E X T ,  
     p s a l m _ a u d i o _ u r l   T E X T ,  
     p s a l m _ r e f   T E X T ,  
      
     - -   A c t s   ( T e x t   +   R e f ,   A s s u m i n g   N o   A u d i o   f o r   n o w   a s   s i m p l e   t e x t   u p l o a d e r   r e q u e s t e d )  
     a c t s _ g e e z   T E X T ,  
     a c t s _ a m h a r i c   T E X T ,  
     a c t s _ r e f   T E X T ,  
      
     c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
     u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
      
     - -   E n s u r e   o n e   m o r n i n g   a n d   o n e   e v e n i n g   r e a d i n g   p e r   d a t e  
     U N I Q U E ( d a t e ,   t i m e _ o f _ d a y )  
 ) ;  
  
 - -   R e - a p p l y   R L S  
 A L T E R   T A B L E   d a i l y _ r e a d i n g s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 C R E A T E   P O L I C Y   " P u b l i c   c a n   v i e w   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   S E L E C T    
     U S I N G   ( t r u e ) ;  
  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   m a n a g e   d a i l y   r e a d i n g s "    
     O N   d a i l y _ r e a d i n g s   F O R   A L L    
     U S I N G   ( a u t h . u i d ( )   I N   ( S E L E C T   i d   F R O M   u s e r s   W H E R E   r o l e   =   ' a d m i n ' ) ) ;  
 - -   I n s e r t   M o c k   D a t a   f o r   T O D A Y   ( M o r n i n g   a n d   E v e n i n g )  
  
 - -   M o r n i n g   R e a d i n g  
 I N S E R T   I N T O   d a i l y _ r e a d i n g s   (  
         d a t e ,   t i m e _ o f _ d a y ,    
         g o s p e l _ g e e z ,   g o s p e l _ a m h a r i c ,   g o s p e l _ r e f ,  
         e p i s t l e _ g e e z ,   e p i s t l e _ a m h a r i c ,   e p i s t l e _ r e f ,  
         a c t s _ g e e z ,   a c t s _ a m h a r i c ,   a c t s _ r e f ,  
         p s a l m _ g e e z ,   p s a l m _ a m h a r i c ,   p s a l m _ r e f  
 )   V A L U E S   (  
         C U R R E N T _ D A T E ,    
         ' M o r n i n g ' ,  
         ' · 9 ∆· 9 ≠ · 0 § · ∆}· ∆"!  · `• · Rç · 9 a· `•   · `¢ · 9 ® · ∆± · ∆µ   · ∆∆· 9 ≠ · ∆Å · 9 ≥ · 9 ç · 9 ´ · `" . . .   ( G e e z   G o s p e l ) ' ,    
         ' J e s u s   s a i d   t o   t h e   J e w s . . .   ( A m h a r i c   G o s p e l ) ' ,    
         ' M a t t h e w   5 : 1 - 1 2 ' ,  
          
         ' · 9 ∆· `" · RR· ∆∆  · ∆: · ∆≠ · 0   · ∆µ . . .   ( G e e z   E p i s t l e ) ' ,    
         ' T h e   G o s p e l   o f   M a r k . . .   ( A m h a r i c   E p i s t l e ) ' ,    
         ' R o m a n s   1 : 1 - 7 ' ,  
          
         ' · Rç · 0 • · ∆®   · ∆ê · 9 9 · ∆≠ · 9 ´ · 0 µ . . .   ( G e e z   A c t s ) ' ,    
         ' A c t s   o f   t h e   A p o s t l e s . . .   ( A m h a r i c   A c t s ) ' ,    
         ' A c t s   2 : 1 - 4 ' ,  
          
         ' · ∆‹· 9 ù · ∆"!· ∆≠   · 9 ≥ · 9 `· 0 µ . . .   ( G e e z   P s a l m s ) ' ,    
         ' T h e   P s a l m s   o f   D a v i d . . .   ( A m h a r i c   P s a l m s ) ' ,    
         ' P s a l m s   2 3 '  
 )   O N   C O N F L I C T   ( d a t e ,   t i m e _ o f _ d a y )   D O   N O T H I N G ;  
  
 - -   E v e n i n g   R e a d i n g  
 I N S E R T   I N T O   d a i l y _ r e a d i n g s   (  
         d a t e ,   t i m e _ o f _ d a y ,    
         g o s p e l _ g e e z ,   g o s p e l _ a m h a r i c ,   g o s p e l _ r e f ,  
         e p i s t l e _ g e e z ,   e p i s t l e _ a m h a r i c ,   e p i s t l e _ r e f ,  
         a c t s _ g e e z ,   a c t s _ a m h a r i c ,   a c t s _ r e f ,  
         p s a l m _ g e e z ,   p s a l m _ a m h a r i c ,   p s a l m _ r e f  
 )   V A L U E S   (  
         C U R R E N T _ D A T E ,    
         ' E v e n i n g ' ,  
         ' · 9 ∆· 9 ≠ · 0 § · ∆}· ∆"!  · 0 † · RΩ · 0 £ · ∆" . . .   ( G e e z   E v e n i n g   G o s p e l ) ' ,    
         ' A n d   h e   s a i d   t o   t h e m   i n   t h e   m o r n i n g . . .   ( A m h a r i c   E v e n i n g   G o s p e l ) ' ,    
         ' L u k e   2 4 : 1 - 1 2 ' ,  
          
         ' · ∆‹· ∆ç · `• · `≠ · 0 ∞   · R≥ · 9 ç · ∆}· ∆µ . . .   ( G e e z   E v e n i n g   E p i s t l e ) ' ,    
         ' T h e   E p i s t l e   o f   P a u l . . .   ( A m h a r i c   E v e n i n g   E p i s t l e ) ' ,    
         ' 1   C o r i n t h i a n s   1 3 : 1 - 1 3 ' ,  
          
         ' · Rç · 0 • · ∆®   · ∆ê · 9 9 · ∆≠ · 9 ´ · 0 µ   · ∆ù · 9 " · ∆´ · ç ç . . .   ( G e e z   E v e n i n g   A c t s ) ' ,    
         ' A c t s   C h a p t e r . . .   ( A m h a r i c   E v e n i n g   A c t s ) ' ,    
         ' A c t s   9 : 1 - 1 9 ' ,  
          
         ' · ∆‹· 9 ù · ∆"!· ∆≠   · 9 ‹· `ê · Rç · ∆& . . .   ( G e e z   E v e n i n g   P s a l m s ) ' ,    
         ' M o r n i n g   P s a l m s . . .   ( A m h a r i c   E v e n i n g   P s a l m s ) ' ,    
         ' P s a l m s   9 1 '  
 )   O N   C O N F L I C T   ( d a t e ,   t i m e _ o f _ d a y )   D O   N O T H I N G ;  
 