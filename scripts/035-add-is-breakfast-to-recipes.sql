-- Add is_breakfast column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS is_breakfast BOOLEAN DEFAULT FALSE;

-- Update any existing breakfast-related recipes if identifiable by name
UPDATE recipes 
SET is_breakfast = TRUE 
WHERE LOWER(name) LIKE '%desayuno%' 
   OR LOWER(name) LIKE '%breakfast%'
   OR LOWER(english_name) LIKE '%breakfast%';
