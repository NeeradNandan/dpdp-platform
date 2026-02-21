-- Auto-provision organization and membership when a user signs up.
-- Run this ONCE in the Supabase SQL Editor after schema.sql.

-- Allow the trigger function to insert into organizations and org_members
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  meta JSONB;
BEGIN
  meta := NEW.raw_user_meta_data;

  INSERT INTO organizations (name, gstin, industry, size)
  VALUES (
    COALESCE(meta->>'organization_name', 'My Organization'),
    NULLIF(meta->>'gstin', ''),
    COALESCE(meta->>'industry', 'Other'),
    LOWER(COALESCE(meta->>'org_size', 'small'))
  )
  RETURNING id INTO new_org_id;

  INSERT INTO org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  -- Seed default consent purposes so the dashboard isn't empty
  INSERT INTO consent_purposes (org_id, code, title, description, legal_basis, retention_period_days, is_mandatory)
  VALUES
    (new_org_id, 'essential', 'Essential Services', 'Required for core service delivery', 'Contract', 365, TRUE),
    (new_org_id, 'analytics', 'Analytics', 'Usage analytics to improve our services', 'Legitimate Interest', 365, FALSE),
    (new_org_id, 'marketing', 'Marketing Communications', 'Promotional emails and offers', 'Consent', 180, FALSE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also add an INSERT policy for organizations (the trigger runs as SECURITY DEFINER
-- but the anon/authenticated user still needs SELECT access after creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role can insert organizations'
  ) THEN
    CREATE POLICY "Service role can insert organizations"
      ON organizations FOR INSERT
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Allow authenticated users to insert into consent_audit_log (for the trigger)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Org members can insert audit log'
  ) THEN
    CREATE POLICY "Org members can insert audit log"
      ON consent_audit_log FOR INSERT
      WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
  END IF;
END $$;
