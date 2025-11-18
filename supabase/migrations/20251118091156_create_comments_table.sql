-- =====================================================
-- Migration: Create comments table
-- Created: 2025-11-18T09:11:56Z
-- Tables: comments
-- Purpose: Store threaded comments and Q&A for decisions
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
-- TABLE: comments
-- Purpose: Threaded comments and Q&A for decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest comments
  author_meta JSONB DEFAULT '{}'::jsonb, -- { email, name, linkTokenId } for guests
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of attachment URLs/storage keys
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threading
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT comments_body_not_empty CHECK (length(trim(body)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS comments_decision_id_idx ON comments(decision_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments(author_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from decisions
CREATE POLICY "comments_select_own"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = comments.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = comments.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  USING (
    (auth.uid() = author_id OR author_id IS NULL) AND -- Guests can edit their own comments
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = comments.decision_id
      -- Will be refined with user_organizations table
    )
  )
  WITH CHECK (
    (auth.uid() = author_id OR author_id IS NULL) AND
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = comments.decision_id
      -- Will be refined with user_organizations table
    )
  );

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (
    (auth.uid() = author_id OR author_id IS NULL) AND
    EXISTS (
      SELECT 1 FROM decisions d
      JOIN projects p ON p.id = d.project_id
      JOIN organizations o ON o.id = p.org_id
      WHERE d.id = comments.decision_id
      -- Will be refined with user_organizations table
    )
  );

-- Documentation
COMMENT ON TABLE comments IS 'Threaded comments and Q&A for decisions';
COMMENT ON COLUMN comments.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN comments.decision_id IS 'Decision this comment belongs to';
COMMENT ON COLUMN comments.author_id IS 'User who wrote comment (null for guest comments)';
COMMENT ON COLUMN comments.author_meta IS 'Guest author metadata (email, name, linkTokenId)';
COMMENT ON COLUMN comments.parent_comment_id IS 'Parent comment for threading (null for top-level)';
COMMENT ON COLUMN comments.attachments IS 'Array of attachment URLs/storage keys (JSON)';
