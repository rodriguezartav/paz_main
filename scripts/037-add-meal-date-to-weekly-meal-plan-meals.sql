-- Add meal_date field to weekly_meal_plan_meals
ALTER TABLE weekly_meal_plan_meals 
ADD COLUMN IF NOT EXISTS meal_date DATE;

-- Populate existing records based on week_start_date + day_of_week
UPDATE weekly_meal_plan_meals m
SET meal_date = (
  SELECT wmp.week_start_date + 
    CASE m.day_of_week
      WHEN 'monday' THEN 0
      WHEN 'tuesday' THEN 1
      WHEN 'wednesday' THEN 2
      WHEN 'thursday' THEN 3
      WHEN 'friday' THEN 4
      WHEN 'saturday' THEN 5
      WHEN 'sunday' THEN 6
    END
  FROM weekly_meal_plans wmp
  WHERE wmp.id = m.weekly_meal_plan_id
)
WHERE m.meal_date IS NULL;

-- Create index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plan_meals_meal_date 
ON weekly_meal_plan_meals(meal_date);
