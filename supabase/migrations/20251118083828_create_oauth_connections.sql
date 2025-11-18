-- =====================================================
-- Migration: Create oauth_connections table
-- Created: 2025-11-18T08:38:28Z
-- Tables: oauth_connections
-- Purpose: Store OAuth provider connections for users
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: oauth_connections
-- Purpose: OAuth provider connections for users
-- =====================================================
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider information
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'github', 'slack', 'other')),
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_name TEXT,
  
  -- Connection metadata
  access_token_encrypted TEXT, -- Encrypted access token (if needed)
  refresh_token_encrypted TEXT, -- Encrypted refresh token (if needed)
  scopes JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT oauth_connections_provider_user_unique UNIQUE (user_id, provider, provider_user_id),
  CONSTRAINT oauth_connections_provider_not_empty CHECK (length(trim(provider)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS oauth_connections_user_id_idx ON oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS oauth_connections_provider_idx ON oauth_connections(provider);
CREATE INDEX IF NOT EXISTS oauth_connections_active_idx ON oauth_connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS oauth_connections_connected_at_idx ON oauth_connections(connected_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_oauth_connections_updated_at ON oauth_connections;
CREATE TRIGGER update_oauth_connections_updated_at
  BEFORE UPDATE ON oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own OAuth connections
CREATE POLICY "oauth_connections_select_own"
  ON oauth_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "oauth_connections_insert_own"
  ON oauth_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "oauth_connections_update_own"
  ON oauth_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "oauth_connections_delete_own"
  ON oauth_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE oauth_connections IS 'OAuth provider connections for users';
COMMENT ON COLUMN oauth_connections.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN oauth_connections.user_id IS 'Owner of this connection (references auth.users)';
COMMENT ON COLUMN oauth_connections.provider IS 'OAuth provider name (google, microsoft, etc.)';
COMMENT ON COLUMN oauth_connections.provider_user_id IS 'User ID from the OAuth provider';
COMMENT ON COLUMN oauth_connections.is_active IS 'Whether the connection is currently active';
COMMENT ON COLUMN oauth_connections.connected_at IS 'When the connection was established';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS update_oauth_connections_updated_at ON oauth_connections;
-- DROP TABLE IF EXISTS oauth_connections CASCADE;
