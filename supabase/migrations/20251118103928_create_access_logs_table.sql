-- =====================================================
-- Migration: Create access_logs table
-- Created: 2025-11-18T10:39:28Z
-- Tables: access_logs
-- Purpose: Track access attempts and actions for shareable links
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: access_logs
-- Purpose: Audit trail for share token access and client actions
-- =====================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  share_token_id UUID REFERENCES share_tokens(id) ON DELETE CASCADE NOT NULL,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  
  -- Access information
  ip_address INET,
  user_agent TEXT,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('view', 'comment', 'confirm', 'request_change', 'ask_question', 'download_pdf', 'passcode_attempt', 'passcode_success', 'passcode_failed')),
  
  -- Client metadata (for anonymous actions)
  client_name TEXT,
  client_email TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  access_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT access_logs_action_not_empty CHECK (length(trim(action_taken)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS access_logs_share_token_id_idx ON access_logs(share_token_id);
CREATE INDEX IF NOT EXISTS access_logs_decision_id_idx ON access_logs(decision_id);
CREATE INDEX IF NOT EXISTS access_logs_access_time_idx ON access_logs(access_time DESC);
CREATE INDEX IF NOT EXISTS access_logs_action_taken_idx ON access_logs(action_taken);
CREATE INDEX IF NOT EXISTS access_logs_ip_address_idx ON access_logs(ip_address);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS access_logs_token_action_time_idx ON access_logs(share_token_id, action_taken, access_time DESC);

-- Enable Row Level Security
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view logs for their own share tokens
CREATE POLICY "access_logs_select_own"
  ON access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM share_tokens st
      JOIN decisions d ON d.id = st.decision_id
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE st.id = access_logs.share_token_id
      -- Will be refined with user_organizations table
    )
  );

-- Allow anonymous inserts for client actions (via service role or function)
-- Note: In production, this should be handled via a database function
-- that validates the share token and inserts the log
CREATE POLICY "access_logs_insert_anonymous"
  ON access_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM share_tokens st
      WHERE st.id = access_logs.share_token_id
      AND st.revoked = false
      AND (st.expires_at IS NULL OR st.expires_at > NOW())
    )
  );

-- Documentation
COMMENT ON TABLE access_logs IS 'Audit trail for share token access and client actions';
COMMENT ON COLUMN access_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN access_logs.share_token_id IS 'Share token that was accessed';
COMMENT ON COLUMN access_logs.decision_id IS 'Decision that was accessed';
COMMENT ON COLUMN access_logs.ip_address IS 'IP address of the access attempt';
COMMENT ON COLUMN access_logs.user_agent IS 'User agent string from the access';
COMMENT ON COLUMN access_logs.action_taken IS 'Type of action: view, comment, confirm, etc.';
COMMENT ON COLUMN access_logs.client_name IS 'Optional client name for anonymous actions';
COMMENT ON COLUMN access_logs.client_email IS 'Optional client email for anonymous actions';
COMMENT ON COLUMN access_logs.metadata IS 'Additional metadata about the access (JSON)';
COMMENT ON COLUMN access_logs.access_time IS 'Timestamp of the access';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS access_logs CASCADE;
