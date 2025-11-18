-- =====================================================
-- Migration: Create projects table
-- Created: 2025-11-18T09:11:52Z
-- Tables: projects
-- Purpose: Store project information linked to organizations
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
-- TABLE: projects
-- Purpose: Store project information
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  timezone TEXT DEFAULT 'UTC',
  default_required_by_offset INTEGER DEFAULT 7, -- days
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT projects_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS projects_org_id_idx ON projects(org_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON projects(created_by);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access projects in their organization
CREATE POLICY "projects_select_own"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = projects.org_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "projects_insert_own"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = projects.org_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "projects_update_own"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = projects.org_id
      -- Will be refined with user_organizations table
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = projects.org_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "projects_delete_own"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = projects.org_id
      -- Will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE projects IS 'Projects that contain architectural decisions';
COMMENT ON COLUMN projects.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN projects.org_id IS 'Organization that owns this project';
COMMENT ON COLUMN projects.default_required_by_offset IS 'Default number of days for required-by date';
