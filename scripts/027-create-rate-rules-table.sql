-- Create rate_rules table for base nightly rates
CREATE TABLE IF NOT EXISTS rate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('resident', 'volunteer', 'retreat')),
  room_type TEXT NOT NULL CHECK (room_type IN ('quad', 'double', 'private', 'any')),
  base_nightly_rate NUMERIC(10,2) NOT NULL CHECK (base_nightly_rate >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_rate_rules_application_type ON rate_rules(application_type);
CREATE INDEX IF NOT EXISTS idx_rate_rules_is_active ON rate_rules(is_active);
