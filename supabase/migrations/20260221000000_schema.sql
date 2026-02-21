-- Yojak: Privacy-as-a-Service Database Schema
-- Designed for Supabase (PostgreSQL) with Row-Level Security

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Organizations (Multi-tenant)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gstin TEXT UNIQUE,
  industry TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('micro', 'small', 'medium', 'large')),
  subscription_tier TEXT NOT NULL DEFAULT 'hook' CHECK (subscription_tier IN ('hook', 'core', 'scale')),
  dpo_name TEXT,
  dpo_email TEXT,
  grievance_officer_name TEXT,
  widget_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Organization Members (RBAC)
-- ============================================
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

-- ============================================
-- Consent Purposes
-- ============================================
CREATE TABLE consent_purposes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  retention_period_days INTEGER NOT NULL DEFAULT 365,
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, code)
);

-- ============================================
-- Consent Records (MeitY BRD compliant artifacts)
-- ============================================
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_principal_id TEXT NOT NULL,
  purpose_id UUID NOT NULL REFERENCES consent_purposes(id),
  purpose_description TEXT,
  consent_status TEXT NOT NULL DEFAULT 'active'
    CHECK (consent_status IN ('active', 'withdrawn', 'expired', 'pending')),
  consent_method TEXT NOT NULL
    CHECK (consent_method IN ('explicit_click', 'toggle', 'form_submission')),
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_org ON consent_records(org_id);
CREATE INDEX idx_consent_principal ON consent_records(data_principal_id);
CREATE INDEX idx_consent_status ON consent_records(consent_status);
CREATE INDEX idx_consent_purpose ON consent_records(purpose_id);

-- ============================================
-- Consent Audit Log (Immutable, 7-year retention)
-- ============================================
CREATE TABLE consent_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  consent_id UUID NOT NULL REFERENCES consent_records(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('granted', 'withdrawn', 'renewed', 'expired', 'modified')),
  data_principal_id TEXT NOT NULL,
  purpose_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_consent ON consent_audit_log(consent_id);
CREATE INDEX idx_audit_org ON consent_audit_log(org_id);
CREATE INDEX idx_audit_date ON consent_audit_log(created_at);

-- ============================================
-- Grievance Tickets (90-day SLA per DPDP Act)
-- ============================================
CREATE TABLE grievance_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL UNIQUE,
  data_principal_email TEXT NOT NULL,
  request_type TEXT NOT NULL
    CHECK (request_type IN ('access', 'correction', 'erasure', 'portability', 'objection')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'awaiting_info', 'resolved', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  ai_classification TEXT,
  ai_response TEXT,
  assigned_to UUID REFERENCES org_members(id),
  sla_deadline TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grievance_org ON grievance_tickets(org_id);
CREATE INDEX idx_grievance_status ON grievance_tickets(status);
CREATE INDEX idx_grievance_sla ON grievance_tickets(sla_deadline);

-- ============================================
-- Data Map Entries (PII Inventory)
-- ============================================
CREATE TABLE data_map_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL,
  table_or_collection TEXT NOT NULL,
  field_name TEXT NOT NULL,
  pii_type TEXT NOT NULL
    CHECK (pii_type IN ('name', 'email', 'phone', 'address', 'aadhaar', 'pan', 'dob', 'biometric', 'financial', 'health', 'other')),
  sensitivity TEXT NOT NULL
    CHECK (sensitivity IN ('low', 'medium', 'high', 'critical')),
  purpose_ids UUID[] DEFAULT '{}',
  retention_policy TEXT,
  encryption_status TEXT NOT NULL DEFAULT 'unencrypted'
    CHECK (encryption_status IN ('encrypted', 'unencrypted', 'partial')),
  last_scanned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_datamap_org ON data_map_entries(org_id);
CREATE INDEX idx_datamap_pii ON data_map_entries(pii_type);
CREATE INDEX idx_datamap_sensitivity ON data_map_entries(sensitivity);

-- ============================================
-- Row-Level Security Policies
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_map_entries ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read their own org
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Org Members: can view members of their org
CREATE POLICY "Users can view org members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Consent Purposes: org members can manage
CREATE POLICY "Org members can manage consent purposes"
  ON consent_purposes FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Consent Records: org members can manage
CREATE POLICY "Org members can manage consent records"
  ON consent_records FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Consent Audit Log: org members can read
CREATE POLICY "Org members can view audit log"
  ON consent_audit_log FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Grievance Tickets: org members can manage
CREATE POLICY "Org members can manage grievances"
  ON grievance_tickets FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Data Map Entries: org members can manage
CREATE POLICY "Org members can manage data map"
  ON data_map_entries FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- ============================================
-- Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_org_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_grievance_updated
  BEFORE UPDATE ON grievance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Auto-create audit log on consent changes
-- ============================================
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO consent_audit_log (org_id, consent_id, event_type, data_principal_id, purpose_id, ip_address, user_agent)
    VALUES (NEW.org_id, NEW.id, 'granted', NEW.data_principal_id, NEW.purpose_id, NEW.ip_address, NEW.user_agent);
  ELSIF TG_OP = 'UPDATE' AND OLD.consent_status != NEW.consent_status THEN
    INSERT INTO consent_audit_log (org_id, consent_id, event_type, data_principal_id, purpose_id, ip_address, user_agent)
    VALUES (NEW.org_id, NEW.id, NEW.consent_status, NEW.data_principal_id, NEW.purpose_id, NEW.ip_address, NEW.user_agent);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consent_audit
  AFTER INSERT OR UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION log_consent_change();
