-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resident_beds junction table (many-to-many: a resident can have multiple beds)
CREATE TABLE IF NOT EXISTS resident_beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bed_id, is_active) -- Only one active assignment per bed
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_resident_beds_resident_id ON resident_beds(resident_id);
CREATE INDEX IF NOT EXISTS idx_resident_beds_bed_id ON resident_beds(bed_id);
CREATE INDEX IF NOT EXISTS idx_resident_beds_is_active ON resident_beds(is_active);

-- Add triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beds_updated_at
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some sample rooms and beds
INSERT INTO rooms (name, description, is_private) VALUES
  ('Dorm A', 'Main dormitory with 4 beds', false),
  ('Dorm B', 'Secondary dormitory with 4 beds', false),
  ('Private 1', 'Private room with queen bed', true),
  ('Private 2', 'Private cabin with double bed', true);

-- Get room IDs for seeding beds
DO $$
DECLARE
  dorm_a_id UUID;
  dorm_b_id UUID;
  private_1_id UUID;
  private_2_id UUID;
BEGIN
  SELECT id INTO dorm_a_id FROM rooms WHERE name = 'Dorm A';
  SELECT id INTO dorm_b_id FROM rooms WHERE name = 'Dorm B';
  SELECT id INTO private_1_id FROM rooms WHERE name = 'Private 1';
  SELECT id INTO private_2_id FROM rooms WHERE name = 'Private 2';

  -- Dorm A beds
  INSERT INTO beds (room_id, name) VALUES
    (dorm_a_id, 'A1'),
    (dorm_a_id, 'A2'),
    (dorm_a_id, 'A3'),
    (dorm_a_id, 'A4');

  -- Dorm B beds
  INSERT INTO beds (room_id, name) VALUES
    (dorm_b_id, 'B1'),
    (dorm_b_id, 'B2'),
    (dorm_b_id, 'B3'),
    (dorm_b_id, 'B4');

  -- Private rooms
  INSERT INTO beds (room_id, name) VALUES
    (private_1_id, 'Queen'),
    (private_2_id, 'Double');
END $$;
