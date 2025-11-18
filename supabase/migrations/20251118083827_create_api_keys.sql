-- =====================================================
-- Migration: Create api_keys table
-- Created: 2025-11-18T08:38:27Z
-- Tables: api_keys
-- Purpose: Store user API keys for integrations
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: api_keys
-- Purpose: User API keys for external integrations
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Key information
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Hashed API key (never store plain text)
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "sk_live_...")
  
  -- Permissions and metadata
  permissions JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT api_keys_name_not_empty CHECK (length(trim(key_name)) > 0),
  CONSTRAINT api_keys_hash_not_empty CHECK (length(trim(key_hash)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_hash_idx ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx ON api_keys(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS api_keys_created_at_idx ON api_keys(created_at DESC);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own API keys
CREATE POLICY "api_keys_select_own"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "api_keys_insert_own"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_update_own"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_delete_own"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE api_keys IS 'User API keys for external integrations';
COMMENT ON COLUMN api_keys.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN api_keys.user_id IS 'Owner of this API key (references auth.users)';
COMMENT ON COLUMN api_keys.key_name IS 'User-friendly name for the API key';
COMMENT ON COLUMN api_keys.key_hash IS 'Hashed API key (never store plain text)';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters for display purposes';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the key is currently active';
COMMENT ON COLUMN api_keys.last_used_at IS 'Last time the key was used';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS api_keys CASCADE;
