-- =====================================================
-- Migration: Create share_tokens table
-- Created: 2025-11-18T09:11:57Z
-- Tables: share_tokens
-- Purpose: Store secure shareable links for client access
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: share_tokens
-- Purpose: Secure shareable links for client access (no-login)
-- =====================================================
CREATE TABLE IF NOT EXISTS share_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE, -- Cryptographically random token
  expires_at TIMESTAMPTZ,
  passcode_hash TEXT, -- Optional bcrypt hash
  allowed_actions JSONB DEFAULT '["view", "comment", "confirm"]'::jsonb, -- Permissions
  revoked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT share_tokens_token_not_empty CHECK (length(trim(token)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS share_tokens_decision_id_idx ON share_tokens(decision_id);
CREATE INDEX IF NOT EXISTS share_tokens_token_idx ON share_tokens(token);
CREATE INDEX IF NOT EXISTS share_tokens_expires_at_idx ON share_tokens(expires_at);
CREATE INDEX IF NOT EXISTS share_tokens_revoked_idx ON share_tokens(revoked) WHERE revoked = false;

-- Enable Row Level Security
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from decisions
CREATE POLICY "share_tokens_select_own"
  ON share_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = share_tokens.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "share_tokens_insert_own"
  ON share_tokens FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = share_tokens.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "share_tokens_update_own"
  ON share_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = share_tokens.decision_id
      -- Will be refined with user_organizations table
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = share_tokens.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "share_tokens_delete_own"
  ON share_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = share_tokens.decision_id
      -- Will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE share_tokens IS 'Secure shareable links for client access without login';
COMMENT ON COLUMN share_tokens.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN share_tokens.decision_id IS 'Decision this token provides access to';
COMMENT ON COLUMN share_tokens.token IS 'Cryptographically random token for URL';
COMMENT ON COLUMN share_tokens.passcode_hash IS 'Optional bcrypt hash for passcode protection';
COMMENT ON COLUMN share_tokens.allowed_actions IS 'Array of allowed actions: view, comment, confirm (JSON)';
COMMENT ON COLUMN share_tokens.revoked IS 'Whether this token has been revoked';
