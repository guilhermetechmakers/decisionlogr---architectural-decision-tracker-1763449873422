-- =====================================================
-- Migration: Create organizations table
-- Created: 2025-11-18T09:11:51Z
-- Tables: organizations
-- Purpose: Support multi-tenant organization structure
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
-- TABLE: organizations
-- Purpose: Store organization/company information
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  billing_plan TEXT DEFAULT 'free' CHECK (billing_plan IN ('free', 'pro', 'enterprise')),
  retention_policy JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT organizations_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS organizations_created_at_idx ON organizations(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access organizations they belong to
-- Note: This will be extended when user_organizations junction table is created
CREATE POLICY "organizations_select_own"
  ON organizations FOR SELECT
  USING (true); -- Will be refined with user_organizations table

CREATE POLICY "organizations_insert_own"
  ON organizations FOR INSERT
  WITH CHECK (true); -- Will be refined with user_organizations table

CREATE POLICY "organizations_update_own"
  ON organizations FOR UPDATE
  USING (true) -- Will be refined with user_organizations table
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE organizations IS 'Organizations/companies that own projects and decisions';
COMMENT ON COLUMN organizations.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN organizations.billing_plan IS 'Current billing plan for the organization';
COMMENT ON COLUMN organizations.retention_policy IS 'Data retention policy settings (JSON)';
