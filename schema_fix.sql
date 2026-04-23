-- ════════════════════════════════════════════════════════════════════════════
-- NCR REALTY — Schema Fix
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════════════════

-- Add missing columns to pins table
ALTER TABLE pins ADD COLUMN IF NOT EXISTS pin_lat        DOUBLE PRECISION;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS pin_lng        DOUBLE PRECISION;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS prop_type      TEXT;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS is_available   BOOLEAN DEFAULT false;
ALTER TABLE pins ADD COLUMN IF NOT EXISTS contact_email  TEXT;

-- Fix sqft constraint (allow from 50)
ALTER TABLE pins DROP CONSTRAINT IF EXISTS pins_sqft_check;
ALTER TABLE pins ADD CONSTRAINT pins_sqft_check
  CHECK (sqft IS NULL OR sqft BETWEEN 50 AND 50000);

-- Fix society constraint (allow short names)
ALTER TABLE pins DROP CONSTRAINT IF EXISTS pins_society_check;
ALTER TABLE pins ADD CONSTRAINT pins_society_check
  CHECK (char_length(society) BETWEEN 1 AND 200);

-- Fix tenant_type (add 'Any')
ALTER TABLE pins DROP CONSTRAINT IF EXISTS pins_tenant_type_check;
ALTER TABLE pins ADD CONSTRAINT pins_tenant_type_check
  CHECK (tenant_type IS NULL OR tenant_type IN (
    'Bachelor Male','Bachelor Female','Family','Working Professional','Any'
  ));

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id       UUID REFERENCES pins(id) ON DELETE CASCADE,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  author_label TEXT DEFAULT 'Anonymous',
  commenter_ip TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_comments_pin ON comments(pin_id);

-- Comments policies (drop first to avoid duplicate error)
DROP POLICY IF EXISTS "Public read comments"   ON comments;
DROP POLICY IF EXISTS "Public insert comments" ON comments;
CREATE POLICY "Public read comments"   ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id      UUID REFERENCES pins(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  reporter_ip TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pin_id, reporter_ip)
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
DROP POLICY IF EXISTS "Public insert reports" ON reports;
CREATE POLICY "Public insert reports" ON reports FOR INSERT WITH CHECK (true);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pins'
ORDER BY ordinal_position;
