-- =====================================================
-- Migration: Create terms of service tables
-- Created: 2025-11-18T09:39:47Z
-- Tables: terms_of_service, user_acceptance
-- Purpose: Support ToS versioning and user acceptance tracking
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
-- TABLE: terms_of_service
-- Purpose: Store Terms of Service versions
-- =====================================================
CREATE TABLE IF NOT EXISTS terms_of_service (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version_number TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT terms_of_service_version_not_empty CHECK (length(trim(version_number)) > 0),
  CONSTRAINT terms_of_service_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS terms_of_service_effective_date_idx ON terms_of_service(effective_date DESC);
CREATE INDEX IF NOT EXISTS terms_of_service_is_active_idx ON terms_of_service(is_active) WHERE is_active = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_terms_of_service_updated_at ON terms_of_service;
CREATE TRIGGER update_terms_of_service_updated_at
  BEFORE UPDATE ON terms_of_service
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE terms_of_service ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read active ToS, only admins can manage
-- For now, allow all authenticated users to read (will be refined with admin roles)
CREATE POLICY "terms_of_service_select_active"
  ON terms_of_service FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "terms_of_service_insert_admin"
  ON terms_of_service FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL); -- Will be refined with admin role check

CREATE POLICY "terms_of_service_update_admin"
  ON terms_of_service FOR UPDATE
  USING (auth.uid() IS NOT NULL) -- Will be refined with admin role check
  WITH CHECK (auth.uid() IS NOT NULL);

-- Documentation
COMMENT ON TABLE terms_of_service IS 'Terms of Service versions with content and effective dates';
COMMENT ON COLUMN terms_of_service.version_number IS 'Version identifier (e.g., "1.0", "2.0")';
COMMENT ON COLUMN terms_of_service.content IS 'Full ToS content (HTML or markdown)';
COMMENT ON COLUMN terms_of_service.effective_date IS 'Date when this version becomes effective';
COMMENT ON COLUMN terms_of_service.is_active IS 'Whether this is the currently active version';

-- =====================================================
-- TABLE: user_acceptance
-- Purpose: Track user acceptance of Terms of Service
-- =====================================================
CREATE TABLE IF NOT EXISTS user_acceptance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tos_version_accepted TEXT NOT NULL,
  acceptance_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  method_of_acceptance TEXT NOT NULL CHECK (method_of_acceptance IN ('signup', 'post-update', 'manual')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_acceptance_version_not_empty CHECK (length(trim(tos_version_accepted)) > 0),
  -- Ensure one acceptance record per user per version
  CONSTRAINT user_acceptance_unique_user_version UNIQUE (user_id, tos_version_accepted)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_acceptance_user_id_idx ON user_acceptance(user_id);
CREATE INDEX IF NOT EXISTS user_acceptance_version_idx ON user_acceptance(tos_version_accepted);
CREATE INDEX IF NOT EXISTS user_acceptance_acceptance_date_idx ON user_acceptance(acceptance_date DESC);

-- Enable Row Level Security
ALTER TABLE user_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own acceptance records
CREATE POLICY "user_acceptance_select_own"
  ON user_acceptance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_acceptance_insert_own"
  ON user_acceptance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE user_acceptance IS 'Tracks user acceptance of Terms of Service versions';
COMMENT ON COLUMN user_acceptance.user_id IS 'User who accepted the ToS';
COMMENT ON COLUMN user_acceptance.tos_version_accepted IS 'Version number of ToS that was accepted';
COMMENT ON COLUMN user_acceptance.acceptance_date IS 'Timestamp when user accepted';
COMMENT ON COLUMN user_acceptance.method_of_acceptance IS 'How the user accepted (signup, post-update, manual)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS user_acceptance CASCADE;
-- DROP TABLE IF EXISTS terms_of_service CASCADE;
