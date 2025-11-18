-- =====================================================
-- Migration: Create search_indices table
-- Created: 2025-11-18T10:48:58Z
-- Tables: search_indices
-- Purpose: Contains metadata for database indices used in search optimization
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
-- TABLE: search_indices
-- Purpose: Contains metadata for database indices used in search optimization
-- =====================================================
CREATE TABLE IF NOT EXISTS search_indices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  index_name TEXT NOT NULL UNIQUE, -- Name of the database index
  table_name TEXT NOT NULL, -- Table this index is on
  column_names TEXT[] NOT NULL, -- Array of column names in the index
  index_type TEXT NOT NULL DEFAULT 'btree' CHECK (index_type IN ('btree', 'gin', 'gist', 'hash', 'brin')),
  is_unique BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true, -- Whether this index is currently active
  last_analyzed TIMESTAMPTZ, -- When this index was last analyzed
  size_bytes BIGINT, -- Size of the index in bytes
  usage_count INTEGER DEFAULT 0, -- Number of times this index has been used
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata about the index
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT search_indices_index_name_not_empty CHECK (length(trim(index_name)) > 0),
  CONSTRAINT search_indices_table_name_not_empty CHECK (length(trim(table_name)) > 0),
  CONSTRAINT search_indices_columns_not_empty CHECK (array_length(column_names, 1) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS search_indices_table_name_idx ON search_indices(table_name);
CREATE INDEX IF NOT EXISTS search_indices_is_active_idx ON search_indices(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS search_indices_last_analyzed_idx ON search_indices(last_analyzed DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_search_indices_updated_at ON search_indices;
CREATE TRIGGER update_search_indices_updated_at
  BEFORE UPDATE ON search_indices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE search_indices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage search indices
CREATE POLICY "search_indices_select_all"
  ON search_indices FOR SELECT
  USING (true); -- Everyone can read index metadata

CREATE POLICY "search_indices_insert_admin"
  ON search_indices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "search_indices_update_admin"
  ON search_indices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "search_indices_delete_admin"
  ON search_indices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE search_indices IS 'Contains metadata for database indices used in search optimization';
COMMENT ON COLUMN search_indices.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN search_indices.index_name IS 'Name of the database index';
COMMENT ON COLUMN search_indices.table_name IS 'Table this index is on';
COMMENT ON COLUMN search_indices.column_names IS 'Array of column names in the index';
COMMENT ON COLUMN search_indices.index_type IS 'Type of index (btree, gin, gist, hash, brin)';
COMMENT ON COLUMN search_indices.is_unique IS 'Whether this is a unique index';
COMMENT ON COLUMN search_indices.is_active IS 'Whether this index is currently active';
COMMENT ON COLUMN search_indices.last_analyzed IS 'When this index was last analyzed';
COMMENT ON COLUMN search_indices.size_bytes IS 'Size of the index in bytes';
COMMENT ON COLUMN search_indices.usage_count IS 'Number of times this index has been used';
