-- Add meal_type column to recipes table
-- Meal types: brunch, dinner

-- Add the meal_type column
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS meal_type text DEFAULT 'dinner';

-- Update existing recipes with a mix of meal types for variety
UPDATE recipes SET meal_type = 'brunch' WHERE name ILIKE '%pancake%' OR name ILIKE '%egg%' OR name ILIKE '%breakfast%' OR name ILIKE '%fruit%';
UPDATE recipes SET meal_type = 'brunch' WHERE name ILIKE '%smoothie%' OR name ILIKE '%granola%' OR name ILIKE '%oatmeal%';

-- Add a constraint to ensure valid meal types
ALTER TABLE recipes 
ADD CONSTRAINT recipes_meal_type_check 
CHECK (meal_type IN ('brunch', 'dinner'));
