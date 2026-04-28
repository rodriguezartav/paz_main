-- Add application_id to residents table to link residents with their applications
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES applications(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_residents_application_id ON residents(application_id);
