/*
# Create matchas table (single-tenant, no auth)

1. New Tables
- `matchas` — each row is one matcha entry in the passport (a review + expense record)
  - `id` (uuid, primary key)
  - `brand` (text, not null) — the matcha brand/producer
  - `name` (text, not null) — the product name
  - `grade` (text) — ceremonial, premium, culinary, latte
  - `origin` (text) — region/prefecture of origin (e.g. Uji, Yame)
  - `price` (numeric, not null) — price paid in the purchase currency
  - `currency` (text, default 'USD') — ISO currency code
  - `amount_grams` (numeric) — package size in grams
  - `purchase_date` (date) — when it was bought
  - `rating` (int, 1–5) — overall rating
  - `color_score` (int, 1–5) — vibrancy of the green
  - `tasting_notes` (text) — free-form flavor notes
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `matchas`.
- Single-tenant no-auth app: anon + authenticated CRUD allowed (data intentionally shared/public).
*/

CREATE TABLE IF NOT EXISTS matchas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  name text NOT NULL,
  grade text,
  origin text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  amount_grams numeric,
  purchase_date date,
  rating int CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  color_score int CHECK (color_score IS NULL OR (color_score >= 1 AND color_score <= 5)),
  tasting_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matchas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_matchas" ON matchas;
CREATE POLICY "anon_select_matchas" ON matchas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_matchas" ON matchas;
CREATE POLICY "anon_insert_matchas" ON matchas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_matchas" ON matchas;
CREATE POLICY "anon_update_matchas" ON matchas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_matchas" ON matchas;
CREATE POLICY "anon_delete_matchas" ON matchas FOR DELETE
  TO anon, authenticated USING (true);
