-- Drop existing table to recreate with new structure
DROP TABLE IF EXISTS daily_readings;

CREATE TABLE daily_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('Morning', 'Evening')),
  
  -- Gospel (Text + Audio + Ref)
  gospel_geez TEXT,
  gospel_amharic TEXT,
  gospel_audio_url TEXT,
  gospel_ref TEXT, -- Book Name, Chapter, Verse
  
  -- Epistle (Text + Ref, NO Audio)
  epistle_geez TEXT,
  epistle_amharic TEXT,
  epistle_ref TEXT,
  
  -- Psalms (Text + Audio + Ref)
  psalm_geez TEXT,
  psalm_amharic TEXT,
  psalm_audio_url TEXT,
  psalm_ref TEXT,
  
  -- Acts (Text + Ref, Assuming No Audio for now as simple text uploader requested)
  acts_geez TEXT,
  acts_amharic TEXT,
  acts_ref TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one morning and one evening reading per date
  UNIQUE(date, time_of_day)
);

-- Re-apply RLS
ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view daily readings" 
  ON daily_readings FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage daily readings" 
  ON daily_readings FOR ALL 
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
