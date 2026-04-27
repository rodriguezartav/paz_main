-- Add visit type question to basic info section
-- Insert at the beginning of basic_info section

-- First update order_index for existing basic_info questions to make room
UPDATE application_questions 
SET order_index = order_index + 1 
WHERE section_key = 'basic_info';

-- Now insert the visit type question at position 0
INSERT INTO application_questions (
  section_key, section_title, section_intro, question_text, question_description,
  question_type, options, required, order_index, active
) VALUES (
  'basic_info',
  'Basic Information',
  NULL,
  'Type of Visit',
  'Please select the type of stay you are applying for',
  'single_choice',
  '["Volunteer (work exchange for accommodation)", "Resident (long-term community member)", "Short-term Retreat (1-4 weeks personal retreat)"]'::jsonb,
  true,
  0,
  true
);
