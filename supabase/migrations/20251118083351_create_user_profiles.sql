-- =====================================================
-- Migration: Create user_profiles table
-- Created: 2025-11-18T08:33:51Z
-- Tables: user_profiles
-- Purpose: Store additional user profile data beyond auth.users
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
-- TABLE: user_profiles
-- Purpose: Extended user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Core profile fields
  full_name TEXT NOT NULL,
  company TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  role TEXT CHECK (role IN ('architect', 'project_manager', 'designer', 'developer', 'other')),
  
  -- Account status
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_profiles_full_name_not_empty CHECK (length(trim(full_name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_company_idx ON user_profiles(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS user_profiles_email_verified_idx ON user_profiles(email_verified);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    company,
    company_size,
    role,
    email_verified,
    metadata
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'company_size',
    NEW.raw_user_meta_data->>'role',
    COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, false),
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to sync email_verified status
CREATE OR REPLACE FUNCTION public.sync_user_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET email_verified = NEW.email_confirmed_at IS NOT NULL
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync email verification status
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.sync_user_email_verified();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON COLUMN user_profiles.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) - one-to-one relationship';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name';
COMMENT ON COLUMN user_profiles.company IS 'User company name';
COMMENT ON COLUMN user_profiles.company_size IS 'Company size category';
COMMENT ON COLUMN user_profiles.role IS 'User role in the organization';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether user email is verified';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user completed onboarding';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.sync_user_email_verified();
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS user_profiles CASCADE;
