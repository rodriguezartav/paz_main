-- Weekly Meal Plans - Actual calendar week assignments
-- This tracks real weeks with headcounts and recipe assignments

-- Create weekly_meal_plans table (represents an actual week)
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL UNIQUE, -- Always a Monday
  template_id UUID REFERENCES weekly_menu_templates(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weekly_meal_plan_meals table (each meal slot for the week)
CREATE TABLE IF NOT EXISTS weekly_meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_meal_plan_id UUID NOT NULL REFERENCES weekly_meal_plans(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  meal_type meal_type_enum NOT NULL,
  -- Headcounts by diet
  headcount_eats_all INTEGER NOT NULL DEFAULT 0,
  headcount_vegetarian INTEGER NOT NULL DEFAULT 0,
  headcount_vegan INTEGER NOT NULL DEFAULT 0,
  -- Prep info
  prep_day_offset INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(weekly_meal_plan_id, day_of_week, meal_type)
);

-- Create weekly_meal_plan_recipes table (recipes assigned to each meal)
CREATE TABLE IF NOT EXISTS weekly_meal_plan_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_meal_id UUID NOT NULL REFERENCES weekly_meal_plan_meals(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_role recipe_role NOT NULL DEFAULT 'main',
  serving_target serving_target NOT NULL DEFAULT 'everyone',
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_week ON weekly_meal_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plan_meals_plan ON weekly_meal_plan_meals(weekly_meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plan_recipes_meal ON weekly_meal_plan_recipes(meal_plan_meal_id);

-- Triggers
DROP TRIGGER IF EXISTS update_weekly_meal_plans_updated_at ON weekly_meal_plans;
CREATE TRIGGER update_weekly_meal_plans_updated_at 
  BEFORE UPDATE ON weekly_meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_meal_plan_meals_updated_at ON weekly_meal_plan_meals;
CREATE TRIGGER update_weekly_meal_plan_meals_updated_at 
  BEFORE UPDATE ON weekly_meal_plan_meals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_meal_plan_recipes_updated_at ON weekly_meal_plan_recipes;
CREATE TRIGGER update_weekly_meal_plan_recipes_updated_at 
  BEFORE UPDATE ON weekly_meal_plan_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
