-- =====================================================
-- Migration: Create options table
-- Created: 2025-11-18T09:11:54Z
-- Tables: options
-- Purpose: Store decision options (1-3 per decision)
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
-- TABLE: options
-- Purpose: Store decision options with specs, cost, images
-- =====================================================
CREATE TABLE IF NOT EXISTS options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  specs JSONB DEFAULT '{}'::jsonb, -- Technical specifications
  cost_delta_numeric NUMERIC(12, 2), -- Cost impact (can be negative)
  image_refs JSONB DEFAULT '[]'::jsonb, -- Array of image URLs/storage keys
  pros_cons_text TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT options_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS options_decision_id_idx ON options(decision_id);
CREATE INDEX IF NOT EXISTS options_created_at_idx ON options(created_at DESC);

-- Constraint: Maximum 3 options per decision
CREATE OR REPLACE FUNCTION check_max_options()
RETURNS TRIGGER AS $$
DECLARE
  option_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO option_count
  FROM options
  WHERE decision_id = NEW.decision_id;
  
  IF option_count > 3 THEN
    RAISE EXCEPTION 'A decision cannot have more than 3 options';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_max_options_trigger ON options;
CREATE TRIGGER check_max_options_trigger
  BEFORE INSERT ON options
  FOR EACH ROW
  EXECUTE FUNCTION check_max_options();

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_options_updated_at ON options;
CREATE TRIGGER update_options_updated_at
  BEFORE UPDATE ON options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from decisions
CREATE POLICY "options_select_own"
  ON options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = options.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "options_insert_own"
  ON options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = options.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "options_update_own"
  ON options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = options.decision_id
      -- Will be refined with user_organizations table
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = options.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "options_delete_own"
  ON options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = options.decision_id
      -- Will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE options IS 'Decision options (1-3 per decision) with specs, cost, images';
COMMENT ON COLUMN options.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN options.decision_id IS 'Decision this option belongs to';
COMMENT ON COLUMN options.specs IS 'Technical specifications (JSON)';
COMMENT ON COLUMN options.cost_delta_numeric IS 'Cost impact (positive or negative)';
COMMENT ON COLUMN options.image_refs IS 'Array of image URLs/storage keys (JSON)';
