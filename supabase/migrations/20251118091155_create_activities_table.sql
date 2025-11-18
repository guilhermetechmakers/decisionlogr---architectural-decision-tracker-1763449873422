-- =====================================================
-- Migration: Create activities table
-- Created: 2025-11-18T09:11:55Z
-- Tables: activities
-- Purpose: Store append-only activity history and audit trail
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: activities
-- Purpose: Append-only activity log for decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest actions
  actor_meta JSONB DEFAULT '{}'::jsonb, -- { email, linkTokenId, name } for guests
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created', 'updated', 'archived', 'shared', 'commented', 
    'client_question', 'client_change_request', 'client_confirmed',
    'exported', 'reminder_sent', 'link_regenerated'
  )),
  payload JSONB DEFAULT '{}'::jsonb, -- Action-specific data
  hash_signature TEXT, -- Optional tamper-evidence hash
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS activities_decision_id_idx ON activities(decision_id);
CREATE INDEX IF NOT EXISTS activities_actor_id_idx ON activities(actor_id);
CREATE INDEX IF NOT EXISTS activities_action_type_idx ON activities(action_type);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from decisions (read-only for most users)
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = activities.decision_id
      -- Will be refined with user_organizations table
    )
  );

-- Only system can insert activities (via triggers or server-side)
CREATE POLICY "activities_insert_system"
  ON activities FOR INSERT
  WITH CHECK (true); -- Will be restricted via server-side logic

-- Activities are append-only, no updates/deletes
-- No update or delete policies needed

-- Documentation
COMMENT ON TABLE activities IS 'Append-only activity log for decision audit trail';
COMMENT ON COLUMN activities.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN activities.actor_id IS 'User who performed action (null for guest actions)';
COMMENT ON COLUMN activities.actor_meta IS 'Guest actor metadata (email, linkTokenId, name)';
COMMENT ON COLUMN activities.action_type IS 'Type of action performed';
COMMENT ON COLUMN activities.payload IS 'Action-specific data (JSON)';
COMMENT ON COLUMN activities.hash_signature IS 'Optional hash for tamper-evidence';
