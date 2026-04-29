-- Seed default resident price modifiers
INSERT INTO resident_price_modifiers (name, min_nights, max_nights, adjustment_type, adjustment_value, is_active, notes)
VALUES 
  ('Resident 8 to 14 Nights', 8, 14, 'percentage', -5, true, 'Resident stays from 8 to 14 nights receive a 5% discount from the base rate.'),
  ('Resident 15 to 20 Nights', 15, 20, 'percentage', -10, true, 'Resident stays from 15 to 20 nights receive a 10% discount from the base rate.'),
  ('Resident 21 to 30 Nights', 21, 30, 'percentage', -15, true, 'Resident stays from 21 to 30 nights receive a 15% discount from the base rate.')
ON CONFLICT DO NOTHING;
