-- Add dietary columns to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS suitable_for_vegetarian BOOLEAN DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS suitable_for_vegan BOOLEAN DEFAULT false;
