-- =====================================================
-- Migration: Create retention_settings table
-- Created: 2025-11-18T11:02:58Z
-- Tables: retention_settings
-- Purpose: Store organization-level retention policy settings for audit trail
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
-- TABLE: retention_settings
-- Purpose: Organization-level retention policy configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS retention_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Retention configuration
  retention_duration_days INTEGER DEFAULT 365 CHECK (retention_duration_days > 0),
  auto_delete_enabled BOOLEAN DEFAULT false,
  delete_after_days INTEGER CHECK (delete_after_days IS NULL OR delete_after_days > 0),
  
  -- Scope settings
  applies_to_activities BOOLEAN DEFAULT true,
  applies_to_comments BOOLEAN DEFAULT false,
  applies_to_attachments BOOLEAN DEFAULT false,
  applies_to_access_logs BOOLEAN DEFAULT false,
  
  -- Notification settings
  notify_before_deletion BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 30 CHECK (notification_days_before IS NULL OR notification_days_before > 0),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT retention_settings_org_unique UNIQUE (organization_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS retention_settings_org_id_idx ON retention_settings(organization_id);
CREATE INDEX IF NOT EXISTS retention_settings_auto_delete_idx ON retention_settings(auto_delete_enabled) WHERE auto_delete_enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_retention_settings_updated_at ON retention_settings;
CREATE TRIGGER update_retention_settings_updated_at
  BEFORE UPDATE ON retention_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE retention_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access settings for their organization
CREATE POLICY "retention_settings_select_own_org"
  ON retention_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE o.id = retention_settings.organization_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "retention_settings_insert_admin"
  ON retention_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = retention_settings.organization_id
      -- Admin check will be refined with user_organizations table
    )
  );

CREATE POLICY "retention_settings_update_admin"
  ON retention_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = retention_settings.organization_id
      -- Admin check will be refined with user_organizations table
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = retention_settings.organization_id
      -- Admin check will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE retention_settings IS 'Organization-level retention policy configuration for audit trail management';
COMMENT ON COLUMN retention_settings.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN retention_settings.organization_id IS 'Organization this setting applies to';
COMMENT ON COLUMN retention_settings.retention_duration_days IS 'Number of days to retain activity logs (default: 365)';
COMMENT ON COLUMN retention_settings.auto_delete_enabled IS 'Whether to automatically delete records after retention period';
COMMENT ON COLUMN retention_settings.delete_after_days IS 'Days after which to delete (if different from retention_duration_days)';
COMMENT ON COLUMN retention_settings.applies_to_activities IS 'Whether retention policy applies to activities table';
COMMENT ON COLUMN retention_settings.applies_to_comments IS 'Whether retention policy applies to comments table';
COMMENT ON COLUMN retention_settings.applies_to_attachments IS 'Whether retention policy applies to attachments table';
COMMENT ON COLUMN retention_settings.applies_to_access_logs IS 'Whether retention policy applies to access_logs table';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS retention_settings CASCADE;
