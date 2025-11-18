-- =====================================================
-- Migration: Create exports table
-- Created: 2025-11-18T11:12:00Z
-- Tables: exports
-- Purpose: Store export job records for decisions and projects
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
-- TABLE: exports
-- Purpose: Store export job records
-- =====================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Export target (either decision_id or project_id, not both)
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Export configuration
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'csv')),
  include_images BOOLEAN DEFAULT true,
  include_audit_trail BOOLEAN DEFAULT true,
  
  -- Export status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- File storage
  file_url TEXT, -- Signed URL to the exported file
  file_size BIGINT, -- Size in bytes
  file_name TEXT, -- Original filename
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional export metadata
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT exports_target_check CHECK (
    (decision_id IS NOT NULL AND project_id IS NULL) OR
    (decision_id IS NULL AND project_id IS NOT NULL)
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS exports_user_id_idx ON exports(user_id);
CREATE INDEX IF NOT EXISTS exports_decision_id_idx ON exports(decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS exports_project_id_idx ON exports(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS exports_status_idx ON exports(status);
CREATE INDEX IF NOT EXISTS exports_created_at_idx ON exports(created_at DESC);
CREATE INDEX IF NOT EXISTS exports_export_type_idx ON exports(export_type);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_exports_updated_at ON exports;
CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own exports
CREATE POLICY "exports_select_own"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "exports_insert_own"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_update_own"
  ON exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_delete_own"
  ON exports FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE exports IS 'Export job records for decisions and projects';
COMMENT ON COLUMN exports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN exports.user_id IS 'User who initiated the export';
COMMENT ON COLUMN exports.decision_id IS 'Decision being exported (mutually exclusive with project_id)';
COMMENT ON COLUMN exports.project_id IS 'Project being exported (mutually exclusive with decision_id)';
COMMENT ON COLUMN exports.export_type IS 'Export format: pdf or csv';
COMMENT ON COLUMN exports.status IS 'Export job status: pending, processing, completed, failed';
COMMENT ON COLUMN exports.file_url IS 'Signed URL to the exported file (when status = completed)';
