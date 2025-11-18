-- =====================================================
-- Migration: Create help/FAQ tables
-- Created: 2025-11-18T09:50:31Z
-- Tables: faqs, contact_forms, changelog_entries
-- Purpose: Support Help/About page with FAQs, contact form submissions, and changelog
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
-- TABLE: faqs
-- Purpose: Frequently asked questions for Help page
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT, -- Optional category for grouping (e.g., 'getting-started', 'billing', 'technical')
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT faqs_question_not_empty CHECK (length(trim(question)) > 0),
  CONSTRAINT faqs_answer_not_empty CHECK (length(trim(answer)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON faqs(display_order);
CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON faqs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS faqs_category_idx ON faqs(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS faqs_created_at_idx ON faqs(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: FAQs are public (read-only for all, admin-only for write)
-- Public read access
CREATE POLICY "faqs_select_public"
  ON faqs FOR SELECT
  USING (is_active = true);

-- Admin-only write access (will be managed by service role in production)
-- For now, allow authenticated users to insert/update (can be restricted later)
CREATE POLICY "faqs_insert_admin"
  ON faqs FOR INSERT
  WITH CHECK (true); -- In production, check for admin role

CREATE POLICY "faqs_update_admin"
  ON faqs FOR UPDATE
  USING (true) -- In production, check for admin role
  WITH CHECK (true);

CREATE POLICY "faqs_delete_admin"
  ON faqs FOR DELETE
  USING (true); -- In production, check for admin role

-- Documentation
COMMENT ON TABLE faqs IS 'Frequently asked questions displayed on Help page';
COMMENT ON COLUMN faqs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN faqs.category IS 'Optional category for grouping FAQs';
COMMENT ON COLUMN faqs.display_order IS 'Order in which FAQs are displayed';

-- =====================================================
-- TABLE: contact_forms
-- Purpose: Support contact form submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- User information (nullable for anonymous submissions)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT, -- For anonymous submissions
  
  -- Form fields
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT, -- URL to uploaded file in storage
  attachment_name TEXT, -- Original filename
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (IP, user agent, etc.)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT contact_forms_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT contact_forms_description_not_empty CHECK (length(trim(description)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS contact_forms_user_id_idx ON contact_forms(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS contact_forms_guest_session_id_idx ON contact_forms(guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS contact_forms_status_idx ON contact_forms(status);
CREATE INDEX IF NOT EXISTS contact_forms_created_at_idx ON contact_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_forms_priority_idx ON contact_forms(priority);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_contact_forms_updated_at ON contact_forms;
CREATE TRIGGER update_contact_forms_updated_at
  BEFORE UPDATE ON contact_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own submissions, admins can see all
CREATE POLICY "contact_forms_select_own"
  ON contact_forms FOR SELECT
  USING (
    auth.uid() = user_id 
    OR guest_session_id = current_setting('app.guest_session_id', true)
  );

CREATE POLICY "contact_forms_insert_own"
  ON contact_forms FOR INSERT
  WITH CHECK (true); -- Anyone can submit contact forms

CREATE POLICY "contact_forms_update_admin"
  ON contact_forms FOR UPDATE
  USING (true) -- In production, check for admin role
  WITH CHECK (true);

CREATE POLICY "contact_forms_delete_admin"
  ON contact_forms FOR DELETE
  USING (true); -- In production, check for admin role

-- Documentation
COMMENT ON TABLE contact_forms IS 'Support contact form submissions';
COMMENT ON COLUMN contact_forms.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN contact_forms.user_id IS 'User who submitted (nullable for anonymous)';
COMMENT ON COLUMN contact_forms.guest_session_id IS 'Guest session ID for anonymous submissions';
COMMENT ON COLUMN contact_forms.status IS 'Status of the support request';

-- =====================================================
-- TABLE: changelog_entries
-- Purpose: Application changelog and release notes
-- =====================================================
CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  version_number TEXT NOT NULL UNIQUE, -- e.g., '1.2.3'
  release_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- Markdown supported
  release_type TEXT DEFAULT 'minor' CHECK (release_type IN ('major', 'minor', 'patch', 'hotfix')),
  
  -- Optional fields
  highlights JSONB DEFAULT '[]'::jsonb, -- Array of highlight strings
  breaking_changes TEXT, -- Optional breaking changes notice
  migration_notes TEXT, -- Optional migration/upgrade instructions
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT changelog_entries_version_not_empty CHECK (length(trim(version_number)) > 0),
  CONSTRAINT changelog_entries_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT changelog_entries_description_not_empty CHECK (length(trim(description)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS changelog_entries_release_date_idx ON changelog_entries(release_date DESC);
CREATE INDEX IF NOT EXISTS changelog_entries_is_published_idx ON changelog_entries(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS changelog_entries_release_type_idx ON changelog_entries(release_type);
CREATE INDEX IF NOT EXISTS changelog_entries_created_at_idx ON changelog_entries(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_changelog_entries_updated_at ON changelog_entries;
CREATE TRIGGER update_changelog_entries_updated_at
  BEFORE UPDATE ON changelog_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Changelog is public read, admin-only write
CREATE POLICY "changelog_entries_select_public"
  ON changelog_entries FOR SELECT
  USING (is_published = true);

-- Admin-only write access
CREATE POLICY "changelog_entries_insert_admin"
  ON changelog_entries FOR INSERT
  WITH CHECK (true); -- In production, check for admin role

CREATE POLICY "changelog_entries_update_admin"
  ON changelog_entries FOR UPDATE
  USING (true) -- In production, check for admin role
  WITH CHECK (true);

CREATE POLICY "changelog_entries_delete_admin"
  ON changelog_entries FOR DELETE
  USING (true); -- In production, check for admin role

-- Documentation
COMMENT ON TABLE changelog_entries IS 'Application changelog and release notes';
COMMENT ON COLUMN changelog_entries.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN changelog_entries.version_number IS 'Semantic version number (e.g., 1.2.3)';
COMMENT ON COLUMN changelog_entries.release_type IS 'Type of release: major, minor, patch, or hotfix';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS changelog_entries CASCADE;
-- DROP TABLE IF EXISTS contact_forms CASCADE;
-- DROP TABLE IF EXISTS faqs CASCADE;
