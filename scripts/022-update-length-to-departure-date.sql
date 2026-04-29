-- Update "Preferred length of stay" question to "Preferred departure date"
UPDATE application_questions
SET 
  question_text = 'Preferred departure date',
  question_type = 'date',
  options = '[]',
  required = true
WHERE question_text = 'Preferred length of stay';
