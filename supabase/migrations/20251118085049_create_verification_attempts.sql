-- =====================================================
-- Migration: Create verification_attempts table
-- Created: 2025-11-18T08:50:49Z
-- Tables: verification_attempts
-- Purpose: Track email verification attempts for security and audit purposes
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: verification_attempts
-- Purpose: Track email verification attempts with cooldown support
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('verify', 'resend')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  
  -- Token and verification details
  token_hash TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT verification_attempts_email_not_empty CHECK (length(trim(email)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS verification_attempts_user_id_idx ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS verification_attempts_email_idx ON verification_attempts(email);
CREATE INDEX IF NOT EXISTS verification_attempts_created_at_idx ON verification_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS verification_attempts_status_idx ON verification_attempts(status);
CREATE INDEX IF NOT EXISTS verification_attempts_type_idx ON verification_attempts(attempt_type);

-- Composite index for cooldown queries
CREATE INDEX IF NOT EXISTS verification_attempts_user_email_type_created_idx 
  ON verification_attempts(user_id, email, attempt_type, created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_verification_attempts_updated_at ON verification_attempts;
CREATE TRIGGER update_verification_attempts_updated_at
  BEFORE UPDATE ON verification_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own verification attempts
CREATE POLICY "verification_attempts_select_own"
  ON verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "verification_attempts_insert_own"
  ON verification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Users should not be able to update or delete their own attempts
-- Only system/admin can update status

-- Documentation
COMMENT ON TABLE verification_attempts IS 'Tracks email verification attempts for security and cooldown enforcement';
COMMENT ON COLUMN verification_attempts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN verification_attempts.user_id IS 'User who made the attempt (references auth.users)';
COMMENT ON COLUMN verification_attempts.attempt_type IS 'Type of attempt: verify (token verification) or resend (request new token)';
COMMENT ON COLUMN verification_attempts.status IS 'Status: pending, success, failed, or expired';
COMMENT ON COLUMN verification_attempts.token_hash IS 'Hashed verification token (for security)';
COMMENT ON COLUMN verification_attempts.expires_at IS 'When the verification token expires';
COMMENT ON COLUMN verification_attempts.ip_address IS 'IP address of the attempt (for security)';
COMMENT ON COLUMN verification_attempts.user_agent IS 'User agent string (for security)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS verification_attempts CASCADE;
