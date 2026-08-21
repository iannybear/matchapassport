/*
# Drop leftover public-access policy on stamps

A "Allow public full access" FOR ALL policy (USING true, WITH CHECK true)
was still present on stamps, bypassing the new header-based policies.
Drop it so only the owner-scoped header policies remain.
*/

DROP POLICY IF EXISTS "Allow public full access" ON stamps;
