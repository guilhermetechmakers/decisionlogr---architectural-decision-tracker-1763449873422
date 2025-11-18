-- =====================================================
-- Migration: Create reminder_templates table
-- Created: 2025-11-18T11:23:51Z
-- Tables: reminder_templates
-- Purpose: Store customizable email templates for reminders
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
-- TABLE: reminder_templates
-- Purpose: Store customizable email templates for reminders
-- =====================================================
CREATE TABLE IF NOT EXISTS reminder_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT reminder_templates_name_not_empty CHECK (length(trim(template_name)) > 0),
  CONSTRAINT reminder_templates_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT reminder_templates_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS reminder_templates_user_id_idx ON reminder_templates(user_id);
CREATE INDEX IF NOT EXISTS reminder_templates_created_at_idx ON reminder_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS reminder_templates_is_default_idx ON reminder_templates(is_default) WHERE is_default = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_reminder_templates_updated_at ON reminder_templates;
CREATE TRIGGER update_reminder_templates_updated_at
  BEFORE UPDATE ON reminder_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own templates
CREATE POLICY "reminder_templates_select_own"
  ON reminder_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reminder_templates_insert_own"
  ON reminder_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminder_templates_update_own"
  ON reminder_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminder_templates_delete_own"
  ON reminder_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE reminder_templates IS 'Customizable email templates for reminder notifications';
COMMENT ON COLUMN reminder_templates.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN reminder_templates.user_id IS 'Owner of this template (references auth.users)';
COMMENT ON COLUMN reminder_templates.template_name IS 'User-friendly name for the template';
COMMENT ON COLUMN reminder_templates.subject IS 'Email subject line (supports variables like {{decision_title}}, {{required_by}})';
COMMENT ON COLUMN reminder_templates.content IS 'Email body content (supports variables like {{decision_title}}, {{required_by}}, {{project_name}})';
COMMENT ON COLUMN reminder_templates.is_default IS 'Whether this is the default template for the user';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS reminder_templates CASCADE;
