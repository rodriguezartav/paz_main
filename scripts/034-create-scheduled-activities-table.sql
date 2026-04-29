-- Create scheduled_activities table for managing activities at Paz
CREATE TABLE IF NOT EXISTS scheduled_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'other',
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  facilitator_user_id UUID REFERENCES users(id),
  facilitator_name TEXT,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT,
  -- Guest display fields
  is_public BOOLEAN DEFAULT false,
  guest_description TEXT,
  what_to_bring TEXT,
  safety_note TEXT,
  signup_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_date ON scheduled_activities(date);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_is_public ON scheduled_activities(is_public);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_status ON scheduled_activities(status);

-- Add some sample activities for testing
INSERT INTO scheduled_activities (title, activity_type, date, start_time, end_time, location, facilitator_name, capacity, status, is_public, guest_description, what_to_bring, safety_note) VALUES
('Morning Surf Session', 'surf', CURRENT_DATE, '06:30', '09:00', 'Pan Dulce Beach', 'Roberto', 6, 'confirmed', true, 'Start the day with the morning glass. All levels welcome.', 'Reef-safe sunscreen, water', 'Check conditions before entering. Respect the ocean.'),
('Sauna & Cold Plunge', 'sauna', CURRENT_DATE, '16:00', '18:00', 'Wellness Area', NULL, 8, 'planned', true, 'Traditional wood-fired sauna followed by cold water immersion.', 'Towel, water bottle', 'Listen to your body. Exit if you feel dizzy.'),
('Jungle Walk', 'nature_walk', CURRENT_DATE + 1, '07:00', '10:00', 'Main Trail', 'Local Guide', 10, 'confirmed', true, 'Explore the rainforest canopy and look for wildlife.', 'Closed-toe shoes, bug spray, camera', 'Stay on marked trails. Do not touch wildlife.'),
('Community Dinner Prep', 'community', CURRENT_DATE + 1, '15:00', '17:00', 'Kitchen', NULL, 5, 'planned', true, 'Help prepare dinner for the community. Learn local recipes.', 'Apron optional', NULL),
('Sunset Guitar Circle', 'music', CURRENT_DATE + 2, '17:30', '19:00', 'Main Deck', NULL, NULL, 'planned', true, 'Bring your instrument or just your voice. All welcome.', 'Instrument if you have one', NULL);
