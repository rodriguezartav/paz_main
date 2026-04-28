-- Add recipe_type enum
CREATE TYPE recipe_type AS ENUM ('salad', 'sauce', 'soup', 'main', 'side', 'dessert');

-- Add type column to recipes table
ALTER TABLE recipes ADD COLUMN type recipe_type;
