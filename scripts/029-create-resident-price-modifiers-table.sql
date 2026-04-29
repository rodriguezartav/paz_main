-- Create resident_price_modifiers table
CREATE TABLE IF NOT EXISTS resident_price_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_nights INTEGER NOT NULL,
  max_nights INTEGER,
  adjustment_type TEXT NOT NULL DEFAULT 'percentage' CHECK (adjustment_type IN ('percentage', 'fixed_amount')),
  adjustment_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_resident_price_modifiers_active ON resident_price_modifiers(is_active);
CREATE INDEX IF NOT EXISTS idx_resident_price_modifiers_nights ON resident_price_modifiers(min_nights, max_nights);
