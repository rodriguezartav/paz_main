-- Add nightly_rate column to residents table
ALTER TABLE residents ADD COLUMN IF NOT EXISTS nightly_rate DECIMAL(10, 2) DEFAULT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN residents.nightly_rate IS 'The agreed nightly rate for this resident, set when accepting their application';
