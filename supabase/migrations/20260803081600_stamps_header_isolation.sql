/*
# Switch stamps to header-based per-browser isolation (no auth required)

Anonymous sign-in is not enabled on this Supabase project, so the previous
auth-based RLS left the app stuck on a loading spinner. This migration
switches to a header-based isolation scheme that requires no Supabase auth
configuration:

1. The frontend generates a random "passport ID" (uuid) per browser, stored
   in localStorage, and sends it as the `x-passport-id` header on every
   database request.
2. A BEFORE INSERT trigger on `stamps` copies that header into the `user_id`
   column, so inserts that omit `user_id` (the normal frontend pattern) still
   get the correct owner.
3. RLS policies on SELECT/INSERT/UPDATE/DELETE compare `user_id` to the value
   in the `x-passport-id` header, so each browser can only see and touch its
   own rows.
4. The `anon` role is granted CRUD (the frontend uses the anon key — there
   is no sign-in), and the old auth-users FK constraint is dropped since
   these passport IDs are not in auth.users.

This keeps each passport private to its browser without any login screen.
*/

-- Drop the FK to auth.users (passport IDs are not real auth users)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stamps_user_id_fkey'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT stamps_user_id_fkey;
  END IF;
END $$;

-- Trigger function: default user_id from the x-passport-id header on insert
CREATE OR REPLACE FUNCTION stamps_set_user_id_from_header()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_passport text;
BEGIN
  IF NEW.user_id IS NULL THEN
    v_passport := current_setting('request.header.x-passport-id', true);
    IF v_passport IS NOT NULL AND v_passport ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      NEW.user_id := v_passport::uuid;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamps_set_user_id_on_insert ON stamps;
CREATE TRIGGER stamps_set_user_id_on_insert
  BEFORE INSERT ON stamps
  FOR EACH ROW EXECUTE FUNCTION stamps_set_user_id_from_header();

-- Drop the old owner-scoped policies
DROP POLICY IF EXISTS "select_own_stamps" ON stamps;
DROP POLICY IF EXISTS "insert_own_stamps" ON stamps;
DROP POLICY IF EXISTS "update_own_stamps" ON stamps;
DROP POLICY IF EXISTS "delete_own_stamps" ON stamps;

-- New header-based policies (anon + authenticated, since there's no sign-in)
CREATE POLICY "select_own_stamps" ON stamps FOR SELECT
  TO anon, authenticated
  USING (user_id = current_setting('request.header.x-passport-id', true)::uuid);

CREATE POLICY "insert_own_stamps" ON stamps FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id = current_setting('request.header.x-passport-id', true)::uuid);

CREATE POLICY "update_own_stamps" ON stamps FOR UPDATE
  TO anon, authenticated
  USING (user_id = current_setting('request.header.x-passport-id', true)::uuid)
  WITH CHECK (user_id = current_setting('request.header.x-passport-id', true)::uuid);

CREATE POLICY "delete_own_stamps" ON stamps FOR DELETE
  TO anon, authenticated
  USING (user_id = current_setting('request.header.x-passport-id', true)::uuid);

-- Grant CRUD to anon (frontend uses the anon key, no sign-in)
GRANT SELECT, INSERT, UPDATE, DELETE ON stamps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON stamps TO authenticated;
