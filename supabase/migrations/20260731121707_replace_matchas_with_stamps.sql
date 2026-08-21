/*
# Replace matchas table with stamps table (cup-logging model)

This migration supports the new "Matcha Passport" feature set: logging
individual cafe cups/drinks rather than tins of matcha powder.

1. Drop old table
- `matchas` is dropped (prototype data only; safe to remove). The new
  schema is incompatible (different columns), and the old table held
  no user data worth preserving in this prototype.

2. New Tables
- `stamps` — one row per logged cup of matcha/hojicha
  - `id` (uuid, primary key)
  - `brand` (text, not null) — brand or cafe name
  - `drink` (text, not null) — drink name
  - `type` (text, not null, default 'Matcha') — base: 'Matcha' or 'Hojicha'
  - `milk` (text, not null, default 'Dairy') — 'Dairy','Oat','Coconut','None'
  - `store_type` (text, not null, default 'Cafe') — 'Cafe','Kiosk','Matcha Slow Bar','Big Brand','Restaurant'
  - `amount` (numeric, not null, default 0) — price paid
  - `currency` (text, not null, default 'USD') — ISO currency code
  - `location` (text, not null, default 'Unspecified')
  - `rating` (numeric, not null) — 1 to 5, allows 0.5 increments
  - `tier` (text, not null, default 'worth') — 'worth','mid','never'
  - `created_at` (timestamptz, default now()) — timestamp used for ordering

3. Security
- Enable RLS on `stamps`.
- Single-tenant no-auth app: anon + authenticated CRUD (data intentionally shared).
*/

DROP TABLE IF EXISTS matchas;

CREATE TABLE IF NOT EXISTS stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  drink text NOT NULL,
  type text NOT NULL DEFAULT 'Matcha',
  milk text NOT NULL DEFAULT 'Dairy',
  store_type text NOT NULL DEFAULT 'Cafe',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  location text NOT NULL DEFAULT 'Unspecified',
  rating numeric NOT NULL DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  tier text NOT NULL DEFAULT 'worth' CHECK (tier IN ('worth','mid','never')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stamps" ON stamps;
CREATE POLICY "anon_select_stamps" ON stamps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stamps" ON stamps;
CREATE POLICY "anon_insert_stamps" ON stamps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stamps" ON stamps;
CREATE POLICY "anon_update_stamps" ON stamps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stamps" ON stamps;
CREATE POLICY "anon_delete_stamps" ON stamps FOR DELETE
  TO anon, authenticated USING (true);
