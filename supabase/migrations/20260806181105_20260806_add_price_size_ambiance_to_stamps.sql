/*
# Add price perception, size, and ambiance columns to stamps

1. New Columns
- `price_perception` (text, NOT NULL, default 'Fair Price') — single-select
  value: 'Great Value', 'Fair Price', or 'Overpriced'.
- `size` (text, NOT NULL, default 'Regular') — drink size: 'Small',
  'Regular', or 'Large'.
- `ambiance` (text[], NOT NULL, default '{}') — array of cafe ambiance
  tags (e.g. 'Cozy', 'Study-Friendly', 'Minimalist', 'Grab & Go',
  'Aesthetic'). Supports freeform user-created tags.

2. Security
- No RLS policy changes — existing owner-scoped policies already cover
  the new columns automatically.
*/

ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS price_perception text NOT NULL DEFAULT 'Fair Price',
  ADD COLUMN IF NOT EXISTS size text NOT NULL DEFAULT 'Regular',
  ADD COLUMN IF NOT EXISTS ambiance text[] NOT NULL DEFAULT '{}';
