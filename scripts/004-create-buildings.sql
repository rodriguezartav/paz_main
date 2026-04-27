-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add building_id to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES buildings(id) ON DELETE CASCADE;

-- Create index for building_id
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_buildings_updated_at ON buildings;
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed sample buildings
INSERT INTO buildings (id, name, description) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Main Lodge', 'The primary building with common areas and dorm rooms'),
  ('b0000002-0000-0000-0000-000000000002', 'Garden Cabins', 'Private cabins near the garden area'),
  ('b0000003-0000-0000-0000-000000000003', 'Treehouse', 'Elevated structures in the forest')
ON CONFLICT (id) DO NOTHING;

-- Update existing rooms to belong to buildings
UPDATE rooms SET building_id = 'b0000001-0000-0000-0000-000000000001' WHERE name LIKE 'Dorm%';
UPDATE rooms SET building_id = 'b0000002-0000-0000-0000-000000000002' WHERE name LIKE 'Private%';
