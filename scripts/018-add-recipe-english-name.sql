-- Add english_name field to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS english_name TEXT;
