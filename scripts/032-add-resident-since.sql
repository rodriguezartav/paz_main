-- Add resident_since field to track when someone became a resident
ALTER TABLE residents ADD COLUMN IF NOT EXISTS resident_since DATE;

-- Set existing residents' resident_since to their created_at date
UPDATE residents SET resident_since = DATE(created_at) WHERE resident_since IS NULL;
