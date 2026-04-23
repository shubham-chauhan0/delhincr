-- Run these in Supabase SQL Editor to add new features

-- Add available listing + comments fields to pins
ALTER TABLE pins ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS available_from TEXT;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id UUID REFERENCES pins(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 2 AND 500),
  author_label TEXT DEFAULT 'Anonymous',
  commenter_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_comments_pin ON comments(pin_id);

-- Reports table (for flagging)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id UUID REFERENCES pins(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pin_id, reporter_ip)
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert reports" ON reports FOR INSERT WITH CHECK (true);
