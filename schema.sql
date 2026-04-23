-- ════════════════════════════════════════════════════════════════════════════
-- NCR REALTY — Complete Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PINS TABLE ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pins (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Location
  area_id         TEXT NOT NULL,
  area_name       TEXT NOT NULL,
  city            TEXT NOT NULL,
  society         TEXT NOT NULL CHECK (char_length(society) BETWEEN 3 AND 120),

  -- Property details
  mode            TEXT NOT NULL CHECK (mode IN ('rent', 'buy')),
  bhk             TEXT NOT NULL CHECK (bhk IN ('1RK','1BHK','2BHK','3BHK','4BHK','4BHK+')),
  sqft            INTEGER CHECK (sqft BETWEEN 100 AND 50000),
  floor           INTEGER CHECK (floor BETWEEN 0 AND 200),

  -- Rent fields (nullable when mode = 'buy')
  rent            INTEGER CHECK (rent IS NULL OR rent BETWEEN 1000 AND 5000000),
  tenant_type     TEXT CHECK (tenant_type IN ('Bachelor Male','Bachelor Female','Family','Working Professional')),
  furnishing      TEXT CHECK (furnishing IN ('Unfurnished','Semi-Furnished','Fully Furnished')),

  -- Buy fields (nullable when mode = 'rent')
  price           BIGINT CHECK (price IS NULL OR price BETWEEN 100000 AND 1000000000),
  price_per_sqft  INTEGER,
  possession      TEXT CHECK (possession IN ('Ready to Move','Under Construction','Resale')),
  builder         TEXT,
  facing          TEXT CHECK (facing IN ('East','West','North','South','Corner')),

  -- Meta
  note            TEXT CHECK (note IS NULL OR char_length(note) <= 300),
  upvotes         INTEGER DEFAULT 0,
  flag_count      INTEGER DEFAULT 0,
  is_flagged      BOOLEAN DEFAULT false,
  submitter_ip    TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VOTES TABLE (prevents double voting) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id            UUID REFERENCES pins(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pin_id, voter_fingerprint)
);

-- ─── FLAGS TABLE (tracks individual flag reports) ────────────────────────────
CREATE TABLE IF NOT EXISTS flags (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id            UUID REFERENCES pins(id) ON DELETE CASCADE,
  flagger_ip        TEXT NOT NULL,
  reason            TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pin_id, flagger_ip)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pins_area_id   ON pins(area_id);
CREATE INDEX IF NOT EXISTS idx_pins_city      ON pins(city);
CREATE INDEX IF NOT EXISTS idx_pins_mode      ON pins(mode);
CREATE INDEX IF NOT EXISTS idx_pins_bhk       ON pins(bhk);
CREATE INDEX IF NOT EXISTS idx_pins_created   ON pins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pins_flagged   ON pins(is_flagged);
CREATE INDEX IF NOT EXISTS idx_pins_ip        ON pins(submitter_ip);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE pins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Public can read non-flagged pins
CREATE POLICY "Public read pins"
  ON pins FOR SELECT
  USING (is_flagged = false);

-- API inserts via service role bypass RLS — no insert policy needed for anon

-- Votes: anyone can insert (fingerprint uniqueness enforced by UNIQUE constraint)
CREATE POLICY "Public insert votes"
  ON votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read votes"
  ON votes FOR SELECT USING (true);

-- Flags: anyone can flag
CREATE POLICY "Public insert flags"
  ON flags FOR INSERT WITH CHECK (true);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

-- Increment upvotes atomically
CREATE OR REPLACE FUNCTION increment_upvotes(p_pin_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE pins SET upvotes = upvotes + 1, updated_at = NOW() WHERE id = p_pin_id;
$$;

-- Auto-flag pins with 5+ reports
CREATE OR REPLACE FUNCTION check_auto_flag()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE pins
    SET is_flagged = true, updated_at = NOW()
  WHERE id = NEW.pin_id
    AND (SELECT COUNT(*) FROM flags WHERE pin_id = NEW.pin_id) >= 5;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_flag
  AFTER INSERT ON flags
  FOR EACH ROW EXECUTE FUNCTION check_auto_flag();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON pins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── AREA STATS VIEW ─────────────────────────────────────────────────────────
-- Fast aggregated stats per area — used by /api/stats
CREATE OR REPLACE VIEW area_stats AS
SELECT
  area_id,
  area_name,
  city,
  COUNT(*)                                              AS total_pins,
  COUNT(*) FILTER (WHERE mode = 'rent')                AS rent_count,
  COUNT(*) FILTER (WHERE mode = 'buy')                 AS buy_count,
  ROUND(AVG(rent) FILTER (WHERE mode = 'rent'))        AS avg_rent,
  MIN(rent) FILTER (WHERE mode = 'rent')               AS min_rent,
  MAX(rent) FILTER (WHERE mode = 'rent')               AS max_rent,
  ROUND(AVG(price) FILTER (WHERE mode = 'buy'))        AS avg_price,
  ROUND(AVG(price_per_sqft) FILTER (WHERE mode = 'buy')) AS avg_price_per_sqft,
  MAX(created_at)                                      AS last_pin_at
FROM pins
WHERE is_flagged = false
GROUP BY area_id, area_name, city;

-- No seed data. Site starts empty — all pins are real user submissions.
