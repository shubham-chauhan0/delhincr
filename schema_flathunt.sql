-- ════════════════════════════════════════════════════════════════════════════
-- NCR REALTY — Flat Hunt Schema
-- Run in Supabase SQL Editor AFTER schema_fix.sql
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flat_hunt_pins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('seeker','owner')),
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  area_name     TEXT,
  bhk           TEXT NOT NULL DEFAULT 'Any',
  budget        INTEGER NOT NULL CHECK (budget > 0),
  timeline      TEXT DEFAULT 'Flexible',
  gender_pref   TEXT DEFAULT 'Any',
  smoking_pref  TEXT DEFAULT 'No preference',
  food_pref     TEXT DEFAULT 'Any',
  email         TEXT NOT NULL,
  phone         TEXT,
  note          TEXT,
  is_active     BOOLEAN DEFAULT true,
  matched       BOOLEAN DEFAULT false,
  submitter_ip  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS flat_hunt_matches (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id   UUID REFERENCES flat_hunt_pins(id) ON DELETE CASCADE,
  owner_id    UUID REFERENCES flat_hunt_pins(id) ON DELETE CASCADE,
  distance_m  INTEGER,
  email_sent  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seeker_id, owner_id)
);

ALTER TABLE flat_hunt_pins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE flat_hunt_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert flat_hunt_pins"    ON flat_hunt_pins;
DROP POLICY IF EXISTS "Public read flat_hunt_pins"      ON flat_hunt_pins;
DROP POLICY IF EXISTS "Public insert flat_hunt_matches" ON flat_hunt_matches;

CREATE POLICY "Public insert flat_hunt_pins" ON flat_hunt_pins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read flat_hunt_pins" ON flat_hunt_pins
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public insert flat_hunt_matches" ON flat_hunt_matches
  FOR INSERT WITH CHECK (true);

-- Auto-expire pins older than 30 days (run as scheduled job)
CREATE INDEX IF NOT EXISTS idx_fhp_role     ON flat_hunt_pins(role);
CREATE INDEX IF NOT EXISTS idx_fhp_active   ON flat_hunt_pins(is_active);
CREATE INDEX IF NOT EXISTS idx_fhp_lat_lng  ON flat_hunt_pins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_fhp_expires  ON flat_hunt_pins(expires_at);

SELECT 'flat_hunt_pins and flat_hunt_matches tables created.' AS status;
