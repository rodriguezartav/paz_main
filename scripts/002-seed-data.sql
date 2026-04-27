-- Seed Ingredients
INSERT INTO ingredients (id, name, type, measurement) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Rice', 'staple', 'kg'),
  ('a2222222-2222-2222-2222-222222222222', 'Beans', 'staple', 'kg'),
  ('a3333333-3333-3333-3333-333333333333', 'Lentils', 'staple', 'kg'),
  ('a4444444-4444-4444-4444-444444444444', 'Eggs', 'protein', 'unit'),
  ('a5555555-5555-5555-5555-555555555555', 'Chicken', 'protein', 'kg'),
  ('a6666666-6666-6666-6666-666666666666', 'Fish', 'protein', 'kg'),
  ('a7777777-7777-7777-7777-777777777777', 'Cabbage', 'vegetable', 'unit'),
  ('a8888888-8888-8888-8888-888888888888', 'Carrots', 'vegetable', 'kg'),
  ('a9999999-9999-9999-9999-999999999999', 'Tomato', 'vegetable', 'kg'),
  ('b1111111-1111-1111-1111-111111111111', 'Onion', 'vegetable', 'unit'),
  ('b2222222-2222-2222-2222-222222222222', 'Cucumber', 'vegetable', 'unit'),
  ('b3333333-3333-3333-3333-333333333333', 'Plantain', 'fruit', 'unit'),
  ('b4444444-4444-4444-4444-444444444444', 'Yucca', 'staple', 'kg'),
  ('b5555555-5555-5555-5555-555555555555', 'Papaya', 'fruit', 'unit'),
  ('b6666666-6666-6666-6666-666666666666', 'Banana', 'fruit', 'unit'),
  ('b7777777-7777-7777-7777-777777777777', 'Coffee', 'staple', 'kg'),
  ('b8888888-8888-8888-8888-888888888888', 'Oil', 'condiment', 'ml'),
  ('b9999999-9999-9999-9999-999999999999', 'Salt', 'condiment', 'kg'),
  ('c1111111-1111-1111-1111-111111111111', 'Garlic', 'condiment', 'tbsp'),
  ('c2222222-2222-2222-2222-222222222222', 'Garbage bags', 'cleaning', 'unit'),
  ('c3333333-3333-3333-3333-333333333333', 'Dish soap', 'cleaning', 'ml');

-- Seed Residents
INSERT INTO residents (id, name, email, whatsapp, emergency_contact, nationality, gender, age, diet, arrival_date, departure_date, room, bed, status, check_in_completed, release_accepted, health_insurance_confirmed, media_release_accepted, orientation_completed, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sofia Martinez', 'sofia@email.com', '+506 8888-1111', 'Maria Martinez +506 8888-2222', 'Costa Rica', 'female', 28, 'vegetarian', '2026-04-20', '2026-04-30', 'Ceiba', 'A', 'staying', true, true, true, true, true, 'Yoga teacher, early riser'),
  ('22222222-2222-2222-2222-222222222222', 'Marcus Thompson', 'marcus@email.com', '+1 555-0123', 'Jane Thompson +1 555-0124', 'United States', 'male', 35, 'eats_all', '2026-04-25', '2026-05-05', 'Almendro', 'B', 'checked_in', true, true, true, true, false, 'Photographer, interested in wildlife'),
  ('33333333-3333-3333-3333-333333333333', 'Emma Lindqvist', 'emma@email.com', '+46 70-123-4567', 'Lars Lindqvist +46 70-987-6543', 'Sweden', 'female', 42, 'vegan', '2026-04-28', '2026-05-10', 'Guapinol', 'A', 'upcoming', false, false, false, false, false, 'Arriving by boat from Drake Bay'),
  ('44444444-4444-4444-4444-444444444444', 'Carlos Mendoza', 'carlos@email.com', '+52 55-1234-5678', 'Ana Mendoza +52 55-8765-4321', 'Mexico', 'male', 31, 'eats_all', '2026-04-15', '2026-04-27', 'Ceiba', 'B', 'checking_out_today', true, true, true, true, true, 'Marine biologist, helped with reef survey'),
  ('55555555-5555-5555-5555-555555555555', 'Yuki Tanaka', 'yuki@email.com', '+81 90-1234-5678', 'Kenji Tanaka +81 90-8765-4321', 'Japan', 'female', 26, 'vegetarian', '2026-05-01', '2026-05-15', 'Almendro', 'A', 'upcoming', false, false, false, false, false, 'Artist, wants quiet space for painting'),
  ('66666666-6666-6666-6666-666666666666', 'Hans Mueller', 'hans@email.com', '+49 170-1234567', 'Greta Mueller +49 170-7654321', 'Germany', 'male', 55, 'eats_all', '2026-04-10', '2026-04-20', 'Guapinol', 'B', 'checked_out', true, true, true, true, true, 'Returned guest, third visit');

-- Seed Payments
INSERT INTO payments (id, resident_id, total_amount, price_per_night, deposit_amount, amount_paid, balance_due, currency, status, method, payment_date, notes) VALUES
  ('01111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 500, 50, 150, 500, 0, 'USD', 'paid', 'paypal', '2026-04-18', 'Full payment received before arrival'),
  ('02222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 550, 50, 150, 150, 400, 'USD', 'deposit_paid', 'stripe', '2026-04-20', 'Will pay remainder in cash on site'),
  ('03333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 600, 50, 180, 0, 600, 'USD', 'unpaid', 'bank_transfer', NULL, 'Awaiting bank transfer confirmation'),
  ('04444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 295000, 25000, 75000, 295000, 0, 'CRC', 'paid', 'sinpe', '2026-04-14', 'Paid in colones via SINPE'),
  ('05555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 700, 50, 210, 350, 350, 'USD', 'partially_paid', 'paypal', '2026-04-25', 'Half paid, rest on arrival'),
  ('06666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 500, 50, 150, 500, 0, 'USD', 'paid', 'cash', '2026-04-10', 'Returning guest discount applied');

-- Seed Recipes
INSERT INTO recipes (id, name, description, notes) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Rice and Beans', 'Classic Costa Rican gallo pinto style rice and beans', 'Cook beans the night before for best results'),
  ('e2222222-2222-2222-2222-222222222222', 'Chicken with Vegetables', 'Hearty chicken stew with garden vegetables', 'Can substitute tofu for vegetarian option'),
  ('e3333333-3333-3333-3333-333333333333', 'Lentil Stew', 'Nutritious vegan lentil stew', 'Great protein source for vegan residents'),
  ('e4444444-4444-4444-4444-444444444444', 'Cabbage Cucumber Salad', 'Fresh and crunchy garden salad', 'Add lime juice for extra freshness'),
  ('e5555555-5555-5555-5555-555555555555', 'Vegetable Soup', 'Warm and comforting root vegetable soup', 'Serve with fresh bread if available'),
  ('e6666666-6666-6666-6666-666666666666', 'Eggs and Plantains', 'Traditional breakfast with fried plantains and eggs', 'Use ripe plantains for sweeter flavor'),
  ('e7777777-7777-7777-7777-777777777777', 'Fruit Plate', 'Fresh tropical fruit selection', 'Best served at breakfast'),
  ('e8888888-8888-8888-8888-888888888888', 'Fish with Rice', 'Fresh catch served over seasoned rice', 'Depends on daily catch availability');

-- Seed Recipe Ingredients
-- Rice and Beans
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 1, 'kg'),
  ('e1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 0.7, 'kg'),
  ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 2, 'unit'),
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 2, 'tbsp'),
  ('e1111111-1111-1111-1111-111111111111', 'b8888888-8888-8888-8888-888888888888', 100, 'ml'),
  ('e1111111-1111-1111-1111-111111111111', 'b9999999-9999-9999-9999-999999999999', 2, 'tbsp');

-- Chicken with Vegetables
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 2, 'kg'),
  ('e2222222-2222-2222-2222-222222222222', 'a8888888-8888-8888-8888-888888888888', 1, 'kg'),
  ('e2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 2, 'unit'),
  ('e2222222-2222-2222-2222-222222222222', 'a9999999-9999-9999-9999-999999999999', 1, 'kg'),
  ('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 2, 'tbsp'),
  ('e2222222-2222-2222-2222-222222222222', 'b8888888-8888-8888-8888-888888888888', 100, 'ml'),
  ('e2222222-2222-2222-2222-222222222222', 'b9999999-9999-9999-9999-999999999999', 2, 'tbsp');

-- Lentil Stew
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 1, 'kg'),
  ('e3333333-3333-3333-3333-333333333333', 'a8888888-8888-8888-8888-888888888888', 1, 'kg'),
  ('e3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 2, 'unit'),
  ('e3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 2, 'tbsp'),
  ('e3333333-3333-3333-3333-333333333333', 'a9999999-9999-9999-9999-999999999999', 1, 'kg'),
  ('e3333333-3333-3333-3333-333333333333', 'b8888888-8888-8888-8888-888888888888', 80, 'ml'),
  ('e3333333-3333-3333-3333-333333333333', 'b9999999-9999-9999-9999-999999999999', 2, 'tbsp');

-- Cabbage Cucumber Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'a7777777-7777-7777-7777-777777777777', 1, 'unit'),
  ('e4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 2, 'unit'),
  ('e4444444-4444-4444-4444-444444444444', 'b9999999-9999-9999-9999-999999999999', 1, 'tbsp'),
  ('e4444444-4444-4444-4444-444444444444', 'b8888888-8888-8888-8888-888888888888', 50, 'ml');

-- Vegetable Soup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 1, 'kg'),
  ('e5555555-5555-5555-5555-555555555555', 'a8888888-8888-8888-8888-888888888888', 1, 'kg'),
  ('e5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 2, 'unit'),
  ('e5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 1, 'tbsp'),
  ('e5555555-5555-5555-5555-555555555555', 'b9999999-9999-9999-9999-999999999999', 2, 'tbsp');

-- Eggs and Plantains
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e6666666-6666-6666-6666-666666666666', 'a4444444-4444-4444-4444-444444444444', 12, 'unit'),
  ('e6666666-6666-6666-6666-666666666666', 'b3333333-3333-3333-3333-333333333333', 8, 'unit'),
  ('e6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-888888888888', 50, 'ml'),
  ('e6666666-6666-6666-6666-666666666666', 'b9999999-9999-9999-9999-999999999999', 1, 'tbsp');

-- Fruit Plate
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e7777777-7777-7777-7777-777777777777', 'b5555555-5555-5555-5555-555555555555', 2, 'unit'),
  ('e7777777-7777-7777-7777-777777777777', 'b6666666-6666-6666-6666-666666666666', 12, 'unit');

-- Fish with Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, measurement) VALUES
  ('e8888888-8888-8888-8888-888888888888', 'a6666666-6666-6666-6666-666666666666', 2, 'kg'),
  ('e8888888-8888-8888-8888-888888888888', 'a1111111-1111-1111-1111-111111111111', 1, 'kg'),
  ('e8888888-8888-8888-8888-888888888888', 'c1111111-1111-1111-1111-111111111111', 2, 'tbsp'),
  ('e8888888-8888-8888-8888-888888888888', 'b8888888-8888-8888-8888-888888888888', 80, 'ml'),
  ('e8888888-8888-8888-8888-888888888888', 'b9999999-9999-9999-9999-999999999999', 2, 'tbsp');
