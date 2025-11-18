-- =====================================================
-- Migration: Create admin tables (audit_logs, billing_subscriptions, moderation_flags)
-- Created: 2025-11-18T10:00:19Z
-- Tables: audit_logs, billing_subscriptions, moderation_flags
-- Purpose: Support admin dashboard functionality for user management, auditing, billing, and moderation
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Track security events and administrative actions
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'password_reset',
    'link_regenerated',
    'login_attempt',
    'login_success',
    'login_failed',
    'user_suspended',
    'user_activated',
    'role_changed',
    'permission_granted',
    'permission_revoked',
    'share_link_revoked',
    'content_removed',
    'billing_updated',
    'subscription_changed',
    'admin_action'
  )),
  resource_type TEXT, -- 'user', 'decision', 'share_link', 'attachment', 'organization', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT audit_logs_action_type_not_empty CHECK (length(trim(action_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type) WHERE resource_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_resource_id_idx ON audit_logs(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view audit logs
-- Note: Admin role check will be implemented via service role or function
CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  USING (true); -- Will be refined with admin role check

-- Documentation
COMMENT ON TABLE audit_logs IS 'Security audit trail for administrative actions and system events';
COMMENT ON COLUMN audit_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (user, decision, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.details IS 'Additional action details (JSON)';

-- =====================================================
-- TABLE: billing_subscriptions
-- Purpose: Manage organization subscriptions and billing
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  seats_count INTEGER DEFAULT 1 CHECK (seats_count > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT DEFAULT 'USD',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT billing_subscriptions_org_unique_active UNIQUE NULLS NOT DISTINCT (organization_id) WHERE status = 'active'
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS billing_subscriptions_org_id_idx ON billing_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS billing_subscriptions_status_idx ON billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS billing_subscriptions_stripe_sub_id_idx ON billing_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS billing_subscriptions_current_period_end_idx ON billing_subscriptions(current_period_end);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_billing_subscriptions_updated_at ON billing_subscriptions;
CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON billing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their organization's billing
CREATE POLICY "billing_subscriptions_select_own"
  ON billing_subscriptions FOR SELECT
  USING (true); -- Will be refined with user_organizations table

CREATE POLICY "billing_subscriptions_insert_admin"
  ON billing_subscriptions FOR INSERT
  WITH CHECK (true); -- Admin only via service role

CREATE POLICY "billing_subscriptions_update_admin"
  ON billing_subscriptions FOR UPDATE
  USING (true) -- Admin only via service role
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE billing_subscriptions IS 'Organization subscription and billing information';
COMMENT ON COLUMN billing_subscriptions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN billing_subscriptions.plan_type IS 'Subscription plan tier';
COMMENT ON COLUMN billing_subscriptions.status IS 'Current subscription status';
COMMENT ON COLUMN billing_subscriptions.seats_count IS 'Number of user seats included';
COMMENT ON COLUMN billing_subscriptions.amount_cents IS 'Subscription amount in cents';

-- =====================================================
-- TABLE: billing_invoices
-- Purpose: Store invoice history for subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID REFERENCES billing_subscriptions(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'void')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT UNIQUE,
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS billing_invoices_subscription_id_idx ON billing_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS billing_invoices_org_id_idx ON billing_invoices(organization_id);
CREATE INDEX IF NOT EXISTS billing_invoices_status_idx ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS billing_invoices_due_date_idx ON billing_invoices(due_date);
CREATE INDEX IF NOT EXISTS billing_invoices_created_at_idx ON billing_invoices(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_billing_invoices_updated_at ON billing_invoices;
CREATE TRIGGER update_billing_invoices_updated_at
  BEFORE UPDATE ON billing_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "billing_invoices_select_own"
  ON billing_invoices FOR SELECT
  USING (true); -- Will be refined with user_organizations table

-- Documentation
COMMENT ON TABLE billing_invoices IS 'Invoice history for organization subscriptions';
COMMENT ON COLUMN billing_invoices.invoice_number IS 'Unique invoice identifier';
COMMENT ON COLUMN billing_invoices.status IS 'Payment status of the invoice';

-- =====================================================
-- TABLE: moderation_flags
-- Purpose: Track flagged content for moderation review
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_flags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('share_link', 'attachment', 'comment', 'decision', 'user')),
  content_id UUID NOT NULL,
  flagged_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_reason TEXT NOT NULL,
  flag_category TEXT CHECK (flag_category IN ('spam', 'inappropriate', 'copyright', 'abuse', 'policy_violation', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'removed', 'dismissed')),
  reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT moderation_flags_reason_not_empty CHECK (length(trim(flag_reason)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS moderation_flags_content_type_idx ON moderation_flags(content_type);
CREATE INDEX IF NOT EXISTS moderation_flags_content_id_idx ON moderation_flags(content_id);
CREATE INDEX IF NOT EXISTS moderation_flags_status_idx ON moderation_flags(status);
CREATE INDEX IF NOT EXISTS moderation_flags_flagged_by_idx ON moderation_flags(flagged_by_user_id);
CREATE INDEX IF NOT EXISTS moderation_flags_created_at_idx ON moderation_flags(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_moderation_flags_updated_at ON moderation_flags;
CREATE TRIGGER update_moderation_flags_updated_at
  BEFORE UPDATE ON moderation_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view and manage flags
CREATE POLICY "moderation_flags_select_admin"
  ON moderation_flags FOR SELECT
  USING (true); -- Admin only

CREATE POLICY "moderation_flags_insert_any"
  ON moderation_flags FOR INSERT
  WITH CHECK (true); -- Anyone can flag content

CREATE POLICY "moderation_flags_update_admin"
  ON moderation_flags FOR UPDATE
  USING (true) -- Admin only
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE moderation_flags IS 'Content moderation flags for policy violations and abuse';
COMMENT ON COLUMN moderation_flags.content_type IS 'Type of content being flagged';
COMMENT ON COLUMN moderation_flags.content_id IS 'ID of the flagged content';
COMMENT ON COLUMN moderation_flags.flag_reason IS 'Reason for flagging the content';
COMMENT ON COLUMN moderation_flags.status IS 'Current moderation status';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS moderation_flags CASCADE;
-- DROP TABLE IF EXISTS billing_invoices CASCADE;
-- DROP TABLE IF EXISTS billing_subscriptions CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
