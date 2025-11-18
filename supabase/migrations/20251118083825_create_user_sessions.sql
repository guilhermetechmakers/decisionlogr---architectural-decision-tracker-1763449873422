-- =====================================================
-- Migration: Create user_sessions table
-- Created: 2025-11-18T08:38:25Z
-- Tables: user_sessions
-- Purpose: Track active user sessions for security management
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track active user sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session information
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_sessions_token_not_empty CHECK (length(trim(session_token)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity_at DESC);

-- Auto-update last_activity trigger
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_sessions_activity ON user_sessions;
CREATE TRIGGER update_user_sessions_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active OR OLD.last_activity_at IS DISTINCT FROM NEW.last_activity_at)
  EXECUTE FUNCTION update_session_activity();

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions
CREATE POLICY "user_sessions_select_own"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_own"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE user_sessions IS 'Track active user sessions for security management';
COMMENT ON COLUMN user_sessions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_sessions.user_id IS 'Owner of this session (references auth.users)';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier';
COMMENT ON COLUMN user_sessions.device_info IS 'Device metadata (browser, OS, etc.)';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether session is currently active';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS update_user_sessions_activity ON user_sessions;
-- DROP FUNCTION IF EXISTS update_session_activity();
-- DROP TABLE IF EXISTS user_sessions CASCADE;
