-- =====================================================
-- Migration: Create attachments table
-- Created: 2025-11-18T09:11:58Z
-- Tables: attachments
-- Purpose: Store file attachments for decisions and comments
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: attachments
-- Purpose: File attachments for decisions and comments
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- Storage URL
  mime TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size BIGINT NOT NULL, -- File size in bytes
  storage_key TEXT NOT NULL, -- Storage bucket key
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT attachments_decision_or_comment CHECK (
    (decision_id IS NOT NULL AND comment_id IS NULL) OR
    (decision_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT attachments_url_not_empty CHECK (length(trim(url)) > 0),
  CONSTRAINT attachments_storage_key_not_empty CHECK (length(trim(storage_key)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS attachments_decision_id_idx ON attachments(decision_id);
CREATE INDEX IF NOT EXISTS attachments_comment_id_idx ON attachments(comment_id);
CREATE INDEX IF NOT EXISTS attachments_created_at_idx ON attachments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from decisions or comments
CREATE POLICY "attachments_select_own"
  ON attachments FOR SELECT
  USING (
    (decision_id IS NULL OR EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = attachments.decision_id
    )) AND
    (comment_id IS NULL OR EXISTS (
      SELECT 1 FROM comments c
      JOIN decisions d ON d.id = c.decision_id
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE c.id = attachments.comment_id
    ))
  );

CREATE POLICY "attachments_insert_own"
  ON attachments FOR INSERT
  WITH CHECK (
    (decision_id IS NULL OR EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = attachments.decision_id
    )) AND
    (comment_id IS NULL OR EXISTS (
      SELECT 1 FROM comments c
      JOIN decisions d ON d.id = c.decision_id
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE c.id = attachments.comment_id
    ))
  );

CREATE POLICY "attachments_delete_own"
  ON attachments FOR DELETE
  USING (
    (decision_id IS NULL OR EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = attachments.decision_id
    )) AND
    (comment_id IS NULL OR EXISTS (
      SELECT 1 FROM comments c
      JOIN decisions d ON d.id = c.decision_id
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE c.id = attachments.comment_id
    ))
  );

-- Documentation
COMMENT ON TABLE attachments IS 'File attachments for decisions and comments';
COMMENT ON COLUMN attachments.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN attachments.decision_id IS 'Decision this attachment belongs to (mutually exclusive with comment_id)';
COMMENT ON COLUMN attachments.comment_id IS 'Comment this attachment belongs to (mutually exclusive with decision_id)';
COMMENT ON COLUMN attachments.storage_key IS 'Storage bucket key for the file';
