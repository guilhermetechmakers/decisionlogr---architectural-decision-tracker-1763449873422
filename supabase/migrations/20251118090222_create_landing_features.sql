-- =====================================================
-- Migration: Create landing_features table
-- Created: 2025-11-18T09:02:22Z
-- Tables: landing_features
-- Purpose: Store feature highlights for landing page display
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
-- TABLE: landing_features
-- Purpose: Feature highlights displayed on landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT, -- Name of Lucide icon to use
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT landing_features_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT landing_features_description_not_empty CHECK (length(trim(description)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS landing_features_display_order_idx ON landing_features(display_order);
CREATE INDEX IF NOT EXISTS landing_features_is_active_idx ON landing_features(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS landing_features_created_at_idx ON landing_features(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_landing_features_updated_at ON landing_features;
CREATE TRIGGER update_landing_features_updated_at
  BEFORE UPDATE ON landing_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for active features
CREATE POLICY "landing_features_select_public"
  ON landing_features FOR SELECT
  USING (is_active = true);

-- Documentation
COMMENT ON TABLE landing_features IS 'Feature highlights displayed on the landing page';
COMMENT ON COLUMN landing_features.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN landing_features.icon_name IS 'Name of Lucide React icon component to display';
COMMENT ON COLUMN landing_features.display_order IS 'Order in which features should be displayed (lower numbers first)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS landing_features CASCADE;
