-- =====================================================
-- Migration: Create landing_forms tables
-- Created: 2025-11-18T09:02:25Z
-- Tables: demo_requests, contact_submissions
-- Purpose: Store demo requests and contact form submissions
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
-- TABLE: demo_requests
-- Purpose: Demo environment requests from landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  
  -- Request details
  preferred_date TIMESTAMPTZ, -- Preferred demo date/time
  message TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT demo_requests_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT demo_requests_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS demo_requests_email_idx ON demo_requests(email);
CREATE INDEX IF NOT EXISTS demo_requests_status_idx ON demo_requests(status);
CREATE INDEX IF NOT EXISTS demo_requests_created_at_idx ON demo_requests(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_demo_requests_updated_at ON demo_requests;
CREATE TRIGGER update_demo_requests_updated_at
  BEFORE UPDATE ON demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated admins can view, anyone can insert
CREATE POLICY "demo_requests_insert_public"
  ON demo_requests FOR INSERT
  WITH CHECK (true);

-- Note: Admin policies should be added separately based on your admin role setup
-- For now, we allow public inserts for demo requests

-- Documentation
COMMENT ON TABLE demo_requests IS 'Demo environment requests from landing page';
COMMENT ON COLUMN demo_requests.id IS 'Primary key (UUID v4)';

-- =====================================================
-- TABLE: contact_submissions
-- Purpose: Contact form submissions from landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  
  -- Message
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Category
  category TEXT CHECK (category IN ('support', 'sales', 'partnership', 'other')),
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT contact_submissions_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT contact_submissions_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT contact_submissions_message_not_empty CHECK (length(trim(message)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS contact_submissions_category_idx ON contact_submissions(category);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated admins can view, anyone can insert
CREATE POLICY "contact_submissions_insert_public"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE contact_submissions IS 'Contact form submissions from landing page';
COMMENT ON COLUMN contact_submissions.id IS 'Primary key (UUID v4)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS contact_submissions CASCADE;
-- DROP TABLE IF EXISTS demo_requests CASCADE;
