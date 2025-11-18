-- =====================================================
-- Migration: Create landing_pricing_tiers table
-- Created: 2025-11-18T09:02:24Z
-- Tables: landing_pricing_tiers
-- Purpose: Store pricing tier information for landing page
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
-- TABLE: landing_pricing_tiers
-- Purpose: Pricing tier information displayed on landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_pricing_tiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  tier_name TEXT NOT NULL,
  price_monthly DECIMAL(10, 2), -- Monthly price in USD
  price_yearly DECIMAL(10, 2), -- Yearly price in USD (optional)
  currency TEXT DEFAULT 'USD',
  
  -- Features included (stored as JSON array)
  features_included JSONB DEFAULT '[]'::jsonb,
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false, -- Highlight as "Popular" tier
  is_active BOOLEAN DEFAULT true,
  
  -- Optional metadata
  description TEXT,
  cta_text TEXT DEFAULT 'Get Started', -- Call-to-action button text
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT landing_pricing_tiers_tier_name_not_empty CHECK (length(trim(tier_name)) > 0),
  CONSTRAINT landing_pricing_tiers_price_positive CHECK (price_monthly IS NULL OR price_monthly >= 0),
  CONSTRAINT landing_pricing_tiers_price_yearly_positive CHECK (price_yearly IS NULL OR price_yearly >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS landing_pricing_tiers_display_order_idx ON landing_pricing_tiers(display_order);
CREATE INDEX IF NOT EXISTS landing_pricing_tiers_is_popular_idx ON landing_pricing_tiers(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS landing_pricing_tiers_is_active_idx ON landing_pricing_tiers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS landing_pricing_tiers_created_at_idx ON landing_pricing_tiers(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_landing_pricing_tiers_updated_at ON landing_pricing_tiers;
CREATE TRIGGER update_landing_pricing_tiers_updated_at
  BEFORE UPDATE ON landing_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for active pricing tiers
CREATE POLICY "landing_pricing_tiers_select_public"
  ON landing_pricing_tiers FOR SELECT
  USING (is_active = true);

-- Documentation
COMMENT ON TABLE landing_pricing_tiers IS 'Pricing tier information displayed on landing page';
COMMENT ON COLUMN landing_pricing_tiers.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN landing_pricing_tiers.features_included IS 'JSON array of feature strings included in this tier';
COMMENT ON COLUMN landing_pricing_tiers.is_popular IS 'Whether this tier should be highlighted as "Popular"';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS landing_pricing_tiers CASCADE;
