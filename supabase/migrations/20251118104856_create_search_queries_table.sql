-- =====================================================
-- Migration: Create search_queries table
-- Created: 2025-11-18T10:48:56Z
-- Tables: search_queries
-- Purpose: Store user search terms, timestamps, and user IDs for search analytics
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
-- TABLE: search_queries
-- Purpose: Store user search terms, timestamps, and user IDs
-- =====================================================
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb, -- { status, projectId, assigneeId, dateRange }
  result_count INTEGER DEFAULT 0,
  response_time_ms INTEGER, -- Query response time in milliseconds
  cache_hit BOOLEAN DEFAULT false, -- Whether result came from cache
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT search_queries_query_text_not_empty CHECK (length(trim(query_text)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS search_queries_user_id_idx ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS search_queries_created_at_idx ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS search_queries_query_text_idx ON search_queries(query_text);
CREATE INDEX IF NOT EXISTS search_queries_cache_hit_idx ON search_queries(cache_hit);

-- Full-text search index for query text
CREATE INDEX IF NOT EXISTS search_queries_query_text_fts_idx ON search_queries USING gin(to_tsvector('english', query_text));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_search_queries_updated_at ON search_queries;
CREATE TRIGGER update_search_queries_updated_at
  BEFORE UPDATE ON search_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own search queries
CREATE POLICY "search_queries_select_own"
  ON search_queries FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "search_queries_insert_own"
  ON search_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "search_queries_update_own"
  ON search_queries FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "search_queries_delete_own"
  ON search_queries FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Documentation
COMMENT ON TABLE search_queries IS 'Stores user search terms, timestamps, and user IDs for search analytics and performance tracking';
COMMENT ON COLUMN search_queries.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN search_queries.user_id IS 'User who performed the search (nullable for anonymous searches)';
COMMENT ON COLUMN search_queries.query_text IS 'The search query text entered by the user';
COMMENT ON COLUMN search_queries.filters IS 'JSON object containing search filters (status, projectId, assigneeId, dateRange)';
COMMENT ON COLUMN search_queries.result_count IS 'Number of results returned for this query';
COMMENT ON COLUMN search_queries.response_time_ms IS 'Query response time in milliseconds';
COMMENT ON COLUMN search_queries.cache_hit IS 'Whether the result came from cache';
