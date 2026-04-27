-- Add missing enum values for ingredients import

-- Add 'roots' to ingredient_type enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'roots' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ingredient_type')) THEN
    ALTER TYPE ingredient_type ADD VALUE 'roots';
  END IF;
END $$;

-- Add 'g' and 'l' to measurement enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'g' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'measurement')) THEN
    ALTER TYPE measurement ADD VALUE 'g';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'l' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'measurement')) THEN
    ALTER TYPE measurement ADD VALUE 'l';
  END IF;
END $$;
