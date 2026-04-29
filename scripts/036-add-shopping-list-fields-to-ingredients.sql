-- Add shopping list and inventory fields to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS add_to_shopping_list_per_person DECIMAL(10, 3) DEFAULT NULL;

ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS add_to_shopping_list_per_week DECIMAL(10, 3) DEFAULT NULL;

ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS items_in_stock DECIMAL(10, 3) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN ingredients.add_to_shopping_list_per_person IS 'Amount required per person per day of this item';
COMMENT ON COLUMN ingredients.add_to_shopping_list_per_week IS 'Amount needed per week regardless of headcount';
COMMENT ON COLUMN ingredients.items_in_stock IS 'Current inventory count';
