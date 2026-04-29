-- Add resident_type column to residents table
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS resident_type TEXT 
CHECK (resident_type IN ('volunteer', 'resident', 'retreat'))
DEFAULT 'resident';
