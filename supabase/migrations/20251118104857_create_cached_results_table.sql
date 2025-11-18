-- =====================================================
-- Migration: Create cached_results table
-- Created: 2025-11-18T10:48:57Z
-- Tables: cached_results
-- Purpose: Maintain a log of cached query results with timestamps and expiry settings
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
-- TABLE: cached_results
-- Purpose: Maintain a log of cached query results with timestamps and expiry settings
-- =====================================================
CREATE TABLE IF NOT EXISTS cached_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  search_query_id UUID REFERENCES search_queries(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL UNIQUE, -- Unique cache key (hash of query + filters)
  result_data JSONB NOT NULL, -- Cached search results
  hit_count INTEGER DEFAULT 0, -- Number of times this cache was hit
  expires_at TIMESTAMPTZ NOT NULL, -- When this cache entry expires
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT cached_results_cache_key_not_empty CHECK (length(trim(cache_key)) > 0),
  CONSTRAINT cached_results_expires_at_future CHECK (expires_at > created_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS cached_results_search_query_id_idx ON cached_results(search_query_id);
CREATE INDEX IF NOT EXISTS cached_results_cache_key_idx ON cached_results(cache_key);
CREATE INDEX IF NOT EXISTS cached_results_expires_at_idx ON cached_results(expires_at);
CREATE INDEX IF NOT EXISTS cached_results_created_at_idx ON cached_results(created_at DESC);

-- Index for finding expired cache entries
CREATE INDEX IF NOT EXISTS cached_results_expired_idx ON cached_results(expires_at) WHERE expires_at < NOW();

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_cached_results_updated_at ON cached_results;
CREATE TRIGGER update_cached_results_updated_at
  BEFORE UPDATE ON cached_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically delete expired cache entries (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cached_results WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE cached_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access cached results for their own queries
CREATE POLICY "cached_results_select_own"
  ON cached_results FOR SELECT
  USING (
    search_query_id IS NULL OR
    EXISTS (
      SELECT 1 FROM search_queries sq
      WHERE sq.id = cached_results.search_query_id
      AND (sq.user_id = auth.uid() OR sq.user_id IS NULL)
    )
  );

CREATE POLICY "cached_results_insert_own"
  ON cached_results FOR INSERT
  WITH CHECK (
    search_query_id IS NULL OR
    EXISTS (
      SELECT 1 FROM search_queries sq
      WHERE sq.id = cached_results.search_query_id
      AND (sq.user_id = auth.uid() OR sq.user_id IS NULL)
    )
  );

CREATE POLICY "cached_results_update_own"
  ON cached_results FOR UPDATE
  USING (
    search_query_id IS NULL OR
    EXISTS (
      SELECT 1 FROM search_queries sq
      WHERE sq.id = cached_results.search_query_id
      AND (sq.user_id = auth.uid() OR sq.user_id IS NULL)
    )
  )
  WITH CHECK (
    search_query_id IS NULL OR
    EXISTS (
      SELECT 1 FROM search_queries sq
      WHERE sq.id = cached_results.search_query_id
      AND (sq.user_id = auth.uid() OR sq.user_id IS NULL)
    )
  );

CREATE POLICY "cached_results_delete_own"
  ON cached_results FOR DELETE
  USING (
    search_query_id IS NULL OR
    EXISTS (
      SELECT 1 FROM search_queries sq
      WHERE sq.id = cached_results.search_query_id
      AND (sq.user_id = auth.uid() OR sq.user_id IS NULL)
    )
  );

-- Admin policy: Allow admins to manage all cache entries
CREATE POLICY "cached_results_admin_all"
  ON cached_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE cached_results IS 'Maintains a log of cached query results with timestamps and expiry settings';
COMMENT ON COLUMN cached_results.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN cached_results.search_query_id IS 'Reference to the search query that generated this cache entry';
COMMENT ON COLUMN cached_results.cache_key IS 'Unique cache key (hash of query + filters)';
COMMENT ON COLUMN cached_results.result_data IS 'Cached search results (JSON)';
COMMENT ON COLUMN cached_results.hit_count IS 'Number of times this cache was hit';
COMMENT ON COLUMN cached_results.expires_at IS 'When this cache entry expires';
