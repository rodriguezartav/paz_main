-- Create enums for type safety
CREATE TYPE gender AS ENUM ('female', 'male');
CREATE TYPE diet AS ENUM ('eats_all', 'vegetarian', 'vegan');
CREATE TYPE resident_status AS ENUM ('upcoming', 'checked_in', 'staying', 'checking_out_today', 'checked_out', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'deposit_paid', 'partially_paid', 'paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'sinpe', 'bank_transfer', 'paypal', 'stripe', 'other');
CREATE TYPE ingredient_type AS ENUM ('staple', 'protein', 'vegetable', 'fruit', 'condiment', 'dairy', 'cleaning', 'other');
CREATE TYPE measurement AS ENUM ('kg', 'unit', 'ml', 'tbsp');

-- Residents table
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  emergency_contact TEXT,
  nationality TEXT,
  gender gender NOT NULL,
  age INTEGER,
  diet diet NOT NULL DEFAULT 'eats_all',
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  room TEXT,
  bed TEXT,
  status resident_status NOT NULL DEFAULT 'upcoming',
  check_in_completed BOOLEAN NOT NULL DEFAULT false,
  release_accepted BOOLEAN NOT NULL DEFAULT false,
  health_insurance_confirmed BOOLEAN NOT NULL DEFAULT false,
  media_release_accepted BOOLEAN NOT NULL DEFAULT false,
  orientation_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  total_amount NUMERIC(12, 2) NOT NULL,
  price_per_night NUMERIC(12, 2) NOT NULL,
  deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'unpaid',
  method payment_method,
  payment_date DATE,
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type ingredient_type NOT NULL,
  measurement measurement NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recipe ingredients junction table
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  measurement measurement NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Create indexes for performance
CREATE INDEX idx_residents_status ON residents(status);
CREATE INDEX idx_residents_arrival_date ON residents(arrival_date);
CREATE INDEX idx_payments_resident_id ON payments(resident_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_ingredients_type ON ingredients(type);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
