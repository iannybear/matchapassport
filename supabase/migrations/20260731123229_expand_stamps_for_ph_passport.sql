/*
# Expand stamps table for PH-based matcha passport

Adds columns to support: Philippines defaults (PHP currency, PH cities),
optional matcha-powder details, multi-select flavor profiles, sweetness &
bitterness percentages, a color scale, a purchase date, an optional branch,
a "treat" flag that deducts from expenses, revised verdicts, and revised
store types.

1. New columns on `stamps`
- `purchase_date` (date) — when the cup was bought; shown at top of the form
- `branch` (text) — optional specific branch/area within a city
- `powder_brand` (text) — optional: matcha powder brand used
- `powder_name` (text) — optional: powder product name
- `powder_grade` (text) — optional: ceremonial / premium / culinary / latte
- `powder_origin` (text) — optional: powder origin (Uji, Yame, Nishio…)
- `flavor_profiles` (text[]) — multi-select: umami, nutty, balanced, etc.
- `sweetness` (int 0–100) — sweetness level in percent
- `bitterness` (int 0–100) — bitterness / astringency in percent
- `color` (text) — color scale: brownish, olive, dull-green, bright-green, vibrant-jade
- `is_treat` (boolean, default false) — a free/treat cup, deducted from expense totals

2. Modified columns
- `currency` default → 'PHP'
- `location` default → 'Quezon City'
- `store_type` default → 'Specialty Cafe'
- `tier` CHECK constraint replaced: new values 'must-try','repeat','maybe','pass'

3. Security
- No RLS changes (existing anon+authenticated CRUD policies still apply).
*/

-- New columns
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS purchase_date date;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS powder_brand text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS powder_name text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS powder_grade text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS powder_origin text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS flavor_profiles text[] DEFAULT '{}';
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS sweetness int DEFAULT 0;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS bitterness int DEFAULT 0;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS is_treat boolean DEFAULT false;

-- Constraints for sweetness / bitterness range
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stamps_sweetness_check'
  ) THEN
    ALTER TABLE stamps ADD CONSTRAINT stamps_sweetness_check
      CHECK (sweetness >= 0 AND sweetness <= 100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stamps_bitterness_check'
  ) THEN
    ALTER TABLE stamps ADD CONSTRAINT stamps_bitterness_check
      CHECK (bitterness >= 0 AND bitterness <= 100);
  END IF;
END $$;

-- Replace tier CHECK constraint with new verdict values
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'stamps'::regclass AND conname = 'stamps_tier_check'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT stamps_tier_check;
  END IF;
END $$;
ALTER TABLE stamps ADD CONSTRAINT stamps_tier_check
  CHECK (tier IN ('must-try','repeat','maybe','pass'));

-- Update defaults for Philippines
ALTER TABLE stamps ALTER COLUMN currency SET DEFAULT 'PHP';
ALTER TABLE stamps ALTER COLUMN location SET DEFAULT 'Quezon City';
ALTER TABLE stamps ALTER COLUMN store_type SET DEFAULT 'Specialty Cafe';
