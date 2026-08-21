/*
# Revoke anon table grants on stamps

The owner-scoped RLS policies already block anon (no anon policies exist), but
the table-level GRANT still gives anon SELECT/INSERT/UPDATE/DELETE. Revoke
those grants so anon has no access at any layer.
*/

REVOKE SELECT, INSERT, UPDATE, DELETE ON stamps FROM anon;
