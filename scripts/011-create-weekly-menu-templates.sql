-- Weekly Menu Templates Schema
-- This creates the tables for reusable week menu templates

-- Meal type enum (brunch/dinner)
DO $$ BEGIN
  CREATE TYPE meal_type_enum AS ENUM ('brunch', 'dinner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Day of week enum type
DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Recipe role enum type
DO $$ BEGIN
  CREATE TYPE recipe_role AS ENUM ('main', 'side', 'salad', 'sauce', 'protein', 'base', 'vegetarian_alternative', 'vegan_alternative', 'extra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Serving target enum type
DO $$ BEGIN
  CREATE TYPE serving_target AS ENUM ('everyone', 'eats_all', 'vegetarian', 'vegan', 'vegetarian_and_vegan', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Weekly Menu Templates table
CREATE TABLE IF NOT EXISTS weekly_menu_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Menu Template Meals table
CREATE TABLE IF NOT EXISTS weekly_menu_template_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_template_id UUID NOT NULL REFERENCES weekly_menu_templates(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  meal_type meal_type_enum NOT NULL,
  prep_day_offset INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekly_menu_template_id, day_of_week, meal_type)
);

-- Weekly Menu Template Meal Recipes table
CREATE TABLE IF NOT EXISTS weekly_menu_template_meal_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_meal_id UUID NOT NULL REFERENCES weekly_menu_template_meals(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_role recipe_role NOT NULL DEFAULT 'main',
  serving_target serving_target NOT NULL DEFAULT 'everyone',
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_meals_template_id ON weekly_menu_template_meals(weekly_menu_template_id);
CREATE INDEX IF NOT EXISTS idx_template_meal_recipes_meal_id ON weekly_menu_template_meal_recipes(template_meal_id);
CREATE INDEX IF NOT EXISTS idx_template_meal_recipes_recipe_id ON weekly_menu_template_meal_recipes(recipe_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_weekly_menu_templates_updated_at ON weekly_menu_templates;
CREATE TRIGGER update_weekly_menu_templates_updated_at
  BEFORE UPDATE ON weekly_menu_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_menu_template_meals_updated_at ON weekly_menu_template_meals;
CREATE TRIGGER update_weekly_menu_template_meals_updated_at
  BEFORE UPDATE ON weekly_menu_template_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_menu_template_meal_recipes_updated_at ON weekly_menu_template_meal_recipes;
CREATE TRIGGER update_weekly_menu_template_meal_recipes_updated_at
  BEFORE UPDATE ON weekly_menu_template_meal_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
