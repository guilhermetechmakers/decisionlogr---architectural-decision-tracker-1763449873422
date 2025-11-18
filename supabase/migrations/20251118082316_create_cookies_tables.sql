-- =====================================================
-- Migration: Create cookies and user_preferences tables
-- Created: 2025-11-18T08:23:16Z
-- Tables: cookies, user_preferences, consent_logs
-- Purpose: Support cookie policy and user consent management
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
-- TABLE: cookies
-- Purpose: Store cookie definitions and metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS cookies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('essential', 'analytics', 'advertising', 'functional', 'performance')),
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT cookies_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT cookies_category_valid CHECK (category IN ('essential', 'analytics', 'advertising', 'functional', 'performance'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS cookies_category_idx ON cookies(category);
CREATE INDEX IF NOT EXISTS cookies_created_at_idx ON cookies(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_cookies_updated_at ON cookies;
CREATE TRIGGER update_cookies_updated_at
  BEFORE UPDATE ON cookies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE cookies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Cookies table is public read-only (for policy page)
CREATE POLICY "cookies_select_public"
  ON cookies FOR SELECT
  USING (true);

-- Only admins can insert/update/delete cookies
CREATE POLICY "cookies_insert_admin"
  ON cookies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "cookies_update_admin"
  ON cookies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "cookies_delete_admin"
  ON cookies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE cookies IS 'Cookie definitions and metadata for policy page';
COMMENT ON COLUMN cookies.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN cookies.category IS 'Cookie category: essential, analytics, advertising, functional, performance';

-- =====================================================
-- TABLE: user_preferences
-- Purpose: Store user cookie consent preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cookie preferences (for authenticated users)
  cookie_category TEXT NOT NULL CHECK (cookie_category IN ('essential', 'analytics', 'advertising', 'functional', 'performance')),
  preference_status TEXT NOT NULL DEFAULT 'pending' CHECK (preference_status IN ('accepted', 'rejected', 'pending')),
  
  -- Guest preferences (for anonymous users)
  guest_session_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_preferences_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL)
  ),
  CONSTRAINT user_preferences_unique_user_category UNIQUE (user_id, cookie_category),
  CONSTRAINT user_preferences_unique_guest_category UNIQUE (guest_session_id, cookie_category)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_preferences_guest_session_id_idx ON user_preferences(guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_preferences_category_idx ON user_preferences(cookie_category);
CREATE INDEX IF NOT EXISTS user_preferences_created_at_idx ON user_preferences(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "user_preferences_select_own"
  ON user_preferences FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_session_id = current_setting('app.guest_session_id', true)
  );

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    (user_id IS NULL AND guest_session_id = current_setting('app.guest_session_id', true))
  );

CREATE POLICY "user_preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (
    auth.uid() = user_id OR
    guest_session_id = current_setting('app.guest_session_id', true)
  )
  WITH CHECK (
    auth.uid() = user_id OR
    guest_session_id = current_setting('app.guest_session_id', true)
  );

CREATE POLICY "user_preferences_delete_own"
  ON user_preferences FOR DELETE
  USING (
    auth.uid() = user_id OR
    guest_session_id = current_setting('app.guest_session_id', true)
  );

-- Documentation
COMMENT ON TABLE user_preferences IS 'User cookie consent preferences (authenticated and guest)';
COMMENT ON COLUMN user_preferences.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_preferences.user_id IS 'Authenticated user ID (nullable for guests)';
COMMENT ON COLUMN user_preferences.guest_session_id IS 'Guest session ID for anonymous users';

-- =====================================================
-- TABLE: consent_logs
-- Purpose: Audit trail for consent actions (compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  
  -- Consent action details
  action_type TEXT NOT NULL CHECK (action_type IN ('accept_all', 'reject_all', 'accept_category', 'reject_category', 'manage_preferences', 'view_policy')),
  cookie_category TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT consent_logs_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL) OR
    (user_id IS NULL AND guest_session_id IS NULL)
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS consent_logs_user_id_idx ON consent_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS consent_logs_guest_session_id_idx ON consent_logs(guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS consent_logs_action_type_idx ON consent_logs(action_type);
CREATE INDEX IF NOT EXISTS consent_logs_created_at_idx ON consent_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view their own consent logs, admins can view all
CREATE POLICY "consent_logs_select_own"
  ON consent_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_session_id = current_setting('app.guest_session_id', true) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "consent_logs_insert_public"
  ON consent_logs FOR INSERT
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE consent_logs IS 'Audit trail for cookie consent actions (compliance logging)';
COMMENT ON COLUMN consent_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN consent_logs.action_type IS 'Type of consent action performed';

-- =====================================================
-- INSERT DEFAULT COOKIES (Essential cookies)
-- =====================================================
INSERT INTO cookies (name, purpose, duration, category, description) VALUES
  ('session_id', 'Maintains user session and authentication state', 'Session', 'essential', 'Required for user authentication and session management'),
  ('csrf_token', 'Protects against cross-site request forgery attacks', 'Session', 'essential', 'Security token for form submissions'),
  ('cookie_consent', 'Stores user cookie consent preferences', '1 year', 'essential', 'Remembers user cookie preferences')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS consent_logs CASCADE;
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS cookies CASCADE;
