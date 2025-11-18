-- =====================================================
-- Migration: Extend user_profiles table
-- Created: 2025-11-18T08:38:24Z
-- Tables: user_profiles
-- Purpose: Add title and phone fields to user profiles
-- =====================================================

-- Add title and phone columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'title'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add index for phone if it doesn't exist
CREATE INDEX IF NOT EXISTS user_profiles_phone_idx ON user_profiles(phone) WHERE phone IS NOT NULL;

-- Documentation
COMMENT ON COLUMN user_profiles.title IS 'User job title or position';
COMMENT ON COLUMN user_profiles.phone IS 'User phone number';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS title;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS phone;
-- DROP INDEX IF EXISTS user_profiles_phone_idx;
