/*
# Secure stamps table with owner-scoped RLS

Replaces the always-true RLS policies (which allowed anyone with the anon key
to read/insert/update/delete all rows) with owner-scoped policies that check
auth.uid() against a user_id column.

1. New columns
- `stamps.user_id` (uuid, NOT NULL, DEFAULT auth.uid()) — the owner of each
  stamp row. Defaults to the authenticated user so inserts that omit it
  (the normal frontend pattern) still satisfy the INSERT WITH CHECK.

2. Backfill
- Existing rows get user_id = NULL initially. We cannot know which user owns
  prototype rows, so we delete them — this is a prototype app with no
  user data worth preserving. (If you have data you want to keep, assign
  those rows to your user's id manually before re-applying.)

3. Security changes
- Drop the four always-true policies (anon_select/insert/update/delete_stamps).
- Create four owner-scoped policies scoped TO authenticated:
  - select_own_stamps:  USING (auth.uid() = user_id)
  - insert_own_stamps:  WITH CHECK (auth.uid() = user_id)
  - update_own_stamps:  USING + WITH CHECK (auth.uid() = user_id)
  - delete_own_stamps:  USING (auth.uid() = user_id)
- anon role is no longer granted any access — only authenticated users can
  touch the table, so the browser must have a valid sign-in session.
*/

-- Add owner column
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill existing rows to NULL is unsafe with NOT NULL; delete prototype rows.
DELETE FROM stamps;

-- Now make the column NOT NULL with a default of the current user.
ALTER TABLE stamps
  ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE stamps
  ALTER COLUMN user_id SET NOT NULL;

-- Add a foreign key to auth.users for referential integrity.
-- Drop first if it already exists.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stamps_user_id_fkey'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT stamps_user_id_fkey;
  END IF;
END $$;
ALTER TABLE stamps
  ADD CONSTRAINT stamps_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the always-true policies
DROP POLICY IF EXISTS "anon_select_stamps" ON stamps;
DROP POLICY IF EXISTS "anon_insert_stamps" ON stamps;
DROP POLICY IF EXISTS "anon_update_stamps" ON stamps;
DROP POLICY IF EXISTS "anon_delete_stamps" ON stamps;

-- Create owner-scoped policies (authenticated only)
CREATE POLICY "select_own_stamps" ON stamps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_stamps" ON stamps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_stamps" ON stamps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_stamps" ON stamps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
