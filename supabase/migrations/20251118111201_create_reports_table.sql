-- =====================================================
-- Migration: Create reports table
-- Created: 2025-11-18T11:12:01Z
-- Tables: reports
-- Purpose: Store generated report records for admin metrics
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
-- TABLE: reports
-- Purpose: Store generated report records
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Report configuration
  metric_type TEXT NOT NULL CHECK (metric_type IN ('aggregate_counts', 'overdue_decisions', 'time_to_decision', 'custom')),
  report_name TEXT, -- User-friendly name for the report
  
  -- Report data (JSON structure)
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Filter parameters used to generate report
  filters JSONB DEFAULT '{}'::jsonb, -- { projectId, dateRange, status, etc. }
  
  -- Export configuration (if report was exported)
  export_format TEXT CHECK (export_format IN ('pdf', 'csv', 'json')),
  export_url TEXT, -- Signed URL if exported
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS reports_metric_type_idx ON reports(metric_type);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_generated_at_idx ON reports(generated_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own reports
-- Note: In production, you may want to add admin-only access policies
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_update_own"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_delete_own"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE reports IS 'Generated report records for admin metrics';
COMMENT ON COLUMN reports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN reports.user_id IS 'User who generated the report';
COMMENT ON COLUMN reports.metric_type IS 'Type of metric: aggregate_counts, overdue_decisions, time_to_decision, custom';
COMMENT ON COLUMN reports.data IS 'Report data in JSON format';
COMMENT ON COLUMN reports.filters IS 'Filter parameters used to generate the report';
