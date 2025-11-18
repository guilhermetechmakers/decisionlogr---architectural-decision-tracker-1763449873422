-- =====================================================
-- Migration: Create reminders table
-- Created: 2025-11-18T11:23:52Z
-- Tables: reminders
-- Purpose: Store scheduled reminders for decisions
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
-- TABLE: reminders
-- Purpose: Store scheduled reminders for decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES reminder_templates(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  custom_interval_days INTEGER, -- For custom frequency
  next_reminder_date DATE NOT NULL,
  last_sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  notification_channels JSONB DEFAULT '["email"]'::jsonb, -- ["email", "sms", "app"]
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT reminders_next_reminder_date_future CHECK (next_reminder_date >= CURRENT_DATE),
  CONSTRAINT reminders_custom_interval_positive CHECK (custom_interval_days IS NULL OR custom_interval_days > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_decision_id_idx ON reminders(decision_id);
CREATE INDEX IF NOT EXISTS reminders_template_id_idx ON reminders(template_id);
CREATE INDEX IF NOT EXISTS reminders_next_reminder_date_idx ON reminders(next_reminder_date);
CREATE INDEX IF NOT EXISTS reminders_status_idx ON reminders(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS reminders_created_at_idx ON reminders(created_at DESC);

-- Composite index for scheduler queries
CREATE INDEX IF NOT EXISTS reminders_active_next_date_idx ON reminders(next_reminder_date, status) WHERE status = 'active';

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own reminders
CREATE POLICY "reminders_select_own"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_own"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_own"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_delete_own"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE reminders IS 'Scheduled reminders for decisions with configurable cadence';
COMMENT ON COLUMN reminders.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN reminders.user_id IS 'Owner of this reminder (references auth.users)';
COMMENT ON COLUMN reminders.decision_id IS 'Decision this reminder is for (references decisions)';
COMMENT ON COLUMN reminders.template_id IS 'Template to use for this reminder (references reminder_templates, nullable)';
COMMENT ON COLUMN reminders.frequency IS 'Reminder frequency: daily, weekly, or custom';
COMMENT ON COLUMN reminders.custom_interval_days IS 'Days between reminders for custom frequency';
COMMENT ON COLUMN reminders.next_reminder_date IS 'Next date when reminder should be sent';
COMMENT ON COLUMN reminders.last_sent_at IS 'Timestamp of last reminder sent';
COMMENT ON COLUMN reminders.status IS 'Current status: active, paused, completed, cancelled';
COMMENT ON COLUMN reminders.notification_channels IS 'Channels to send notifications: ["email", "sms", "app"]';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS reminders CASCADE;
