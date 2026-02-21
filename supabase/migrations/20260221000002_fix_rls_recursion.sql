-- Fix infinite recursion in org_members RLS policy.
-- The original policy queries org_members to check org_members access,
-- causing a recursive loop. Use a SECURITY DEFINER function instead.

CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$;

-- Drop and recreate the org_members SELECT policy
DROP POLICY IF EXISTS "Users can view org members" ON org_members;
CREATE POLICY "Users can view org members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Fix all other policies that reference org_members subquery
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Owners can update organization" ON organizations;
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

DROP POLICY IF EXISTS "Org members can manage consent purposes" ON consent_purposes;
CREATE POLICY "Org members can manage consent purposes"
  ON consent_purposes FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Org members can manage consent records" ON consent_records;
CREATE POLICY "Org members can manage consent records"
  ON consent_records FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Org members can view audit log" ON consent_audit_log;
CREATE POLICY "Org members can view audit log"
  ON consent_audit_log FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Org members can insert audit log" ON consent_audit_log;
CREATE POLICY "Org members can insert audit log"
  ON consent_audit_log FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Org members can manage grievances" ON grievance_tickets;
CREATE POLICY "Org members can manage grievances"
  ON grievance_tickets FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Org members can manage data map" ON data_map_entries;
CREATE POLICY "Org members can manage data map"
  ON data_map_entries FOR ALL
  USING (org_id IN (SELECT get_user_org_ids()));
