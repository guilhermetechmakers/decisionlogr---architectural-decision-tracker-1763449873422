-- =====================================================
-- Migration: Create decisions table
-- Created: 2025-11-18T09:11:53Z
-- Tables: decisions
-- Purpose: Store architectural decision records
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
-- TABLE: decisions
-- Purpose: Store architectural decision records
-- =====================================================
CREATE TABLE IF NOT EXISTS decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  area TEXT, -- e.g., "Backend Architecture"
  description TEXT,
  required_by DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waiting_for_client', 'decided', 'overdue', 'archived')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility_settings JSONB DEFAULT '{}'::jsonb, -- { linkExpiry, passcodeRequired, allowComments }
  archived BOOLEAN DEFAULT false,
  final_choice_option_id UUID, -- Will reference options table
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT decisions_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT decisions_required_by_future CHECK (required_by >= CURRENT_DATE)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS decisions_project_id_idx ON decisions(project_id);
CREATE INDEX IF NOT EXISTS decisions_status_idx ON decisions(status);
CREATE INDEX IF NOT EXISTS decisions_required_by_idx ON decisions(required_by);
CREATE INDEX IF NOT EXISTS decisions_assignee_id_idx ON decisions(assignee_id);
CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS decisions_archived_idx ON decisions(archived) WHERE archived = false;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_decisions_updated_at ON decisions;
CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access decisions in their organization's projects
CREATE POLICY "decisions_select_own"
  ON decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organizations o ON o.id = p.org_id
      WHERE p.id = decisions.project_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "decisions_insert_own"
  ON decisions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organizations o ON o.id = p.org_id
      WHERE p.id = decisions.project_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "decisions_update_own"
  ON decisions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organizations o ON o.id = p.org_id
      WHERE p.id = decisions.project_id
      -- Will be refined with user_organizations table
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organizations o ON o.id = p.org_id
      WHERE p.id = decisions.project_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "decisions_delete_own"
  ON decisions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organizations o ON o.id = p.org_id
      WHERE p.id = decisions.project_id
      -- Will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE decisions IS 'Architectural decision records with options and client interaction';
COMMENT ON COLUMN decisions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN decisions.project_id IS 'Project this decision belongs to';
COMMENT ON COLUMN decisions.status IS 'Current status: pending, waiting_for_client, decided, overdue, archived';
COMMENT ON COLUMN decisions.visibility_settings IS 'Share link settings (JSON): linkExpiry, passcodeRequired, allowComments';
COMMENT ON COLUMN decisions.final_choice_option_id IS 'Option ID that was chosen (set when status = decided)';
