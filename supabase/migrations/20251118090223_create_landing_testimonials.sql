-- =====================================================
-- Migration: Create landing_testimonials table
-- Created: 2025-11-18T09:02:23Z
-- Tables: landing_testimonials
-- Purpose: Store testimonials for social proof on landing page
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
-- TABLE: landing_testimonials
-- Purpose: Testimonials from users/firms for social proof
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  user_name TEXT NOT NULL,
  firm_name TEXT,
  feedback TEXT NOT NULL,
  user_pic_url TEXT, -- URL to user profile picture
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Optional metadata
  role TEXT, -- e.g., "Senior Architect", "Project Manager"
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional 1-5 star rating
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT landing_testimonials_user_name_not_empty CHECK (length(trim(user_name)) > 0),
  CONSTRAINT landing_testimonials_feedback_not_empty CHECK (length(trim(feedback)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS landing_testimonials_display_order_idx ON landing_testimonials(display_order);
CREATE INDEX IF NOT EXISTS landing_testimonials_is_featured_idx ON landing_testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS landing_testimonials_is_active_idx ON landing_testimonials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS landing_testimonials_created_at_idx ON landing_testimonials(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_landing_testimonials_updated_at ON landing_testimonials;
CREATE TRIGGER update_landing_testimonials_updated_at
  BEFORE UPDATE ON landing_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for active testimonials
CREATE POLICY "landing_testimonials_select_public"
  ON landing_testimonials FOR SELECT
  USING (is_active = true);

-- Documentation
COMMENT ON TABLE landing_testimonials IS 'Testimonials from users/firms displayed on landing page for social proof';
COMMENT ON COLUMN landing_testimonials.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN landing_testimonials.user_pic_url IS 'URL to user profile picture (optional)';
COMMENT ON COLUMN landing_testimonials.is_featured IS 'Whether this testimonial should be prominently displayed';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS landing_testimonials CASCADE;
