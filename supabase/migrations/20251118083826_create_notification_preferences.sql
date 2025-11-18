-- =====================================================
-- Migration: Create notification_preferences table
-- Created: 2025-11-18T08:38:26Z
-- Tables: notification_preferences
-- Purpose: Store user email notification preferences
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: notification_preferences
-- Purpose: User email notification preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Email notification preferences
  decision_created BOOLEAN DEFAULT true,
  decision_updated BOOLEAN DEFAULT true,
  client_comment BOOLEAN DEFAULT true,
  client_confirmation BOOLEAN DEFAULT true,
  decision_reminder BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT false,
  monthly_report BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON notification_preferences(user_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences on user signup
DROP TRIGGER IF EXISTS on_user_create_notification_preferences ON auth.users;
CREATE TRIGGER on_user_create_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "notification_preferences_select_own"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_own"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_delete_own"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE notification_preferences IS 'User email notification preferences';
COMMENT ON COLUMN notification_preferences.user_id IS 'Owner of these preferences (references auth.users)';
COMMENT ON COLUMN notification_preferences.decision_created IS 'Notify when decision is created';
COMMENT ON COLUMN notification_preferences.decision_updated IS 'Notify when decision is updated';
COMMENT ON COLUMN notification_preferences.client_comment IS 'Notify when client comments';
COMMENT ON COLUMN notification_preferences.client_confirmation IS 'Notify when client confirms choice';
COMMENT ON COLUMN notification_preferences.decision_reminder IS 'Notify for decision reminders';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS on_user_create_notification_preferences ON auth.users;
-- DROP FUNCTION IF EXISTS create_default_notification_preferences();
-- DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
-- DROP TABLE IF EXISTS notification_preferences CASCADE;
