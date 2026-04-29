-- Seed initial base rates
INSERT INTO rate_rules (name, application_type, room_type, base_nightly_rate, currency, is_active) VALUES
  ('Resident Quad', 'resident', 'quad', 65.00, 'USD', true),
  ('Resident Double', 'resident', 'double', 89.00, 'USD', true),
  ('Resident Private', 'resident', 'private', 149.00, 'USD', true),
  ('Volunteer Flat Rate', 'volunteer', 'any', 30.00, 'USD', true),
  ('Retreat Quad', 'retreat', 'quad', 95.00, 'USD', true),
  ('Retreat Double', 'retreat', 'double', 125.00, 'USD', true),
  ('Retreat Private', 'retreat', 'private', 175.00, 'USD', true)
ON CONFLICT DO NOTHING;
