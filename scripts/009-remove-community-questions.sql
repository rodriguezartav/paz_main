-- Remove first 2 questions from Community Life and Contribution section
-- These are typically the first two by order_index in that section

DELETE FROM application_questions 
WHERE section_key = 'community_life' 
AND order_index IN (
  SELECT order_index 
  FROM application_questions 
  WHERE section_key = 'community_life' 
  ORDER BY order_index 
  LIMIT 2
);

-- Reorder remaining questions to start from 1
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) as new_order
  FROM application_questions
  WHERE section_key = 'community_life'
)
UPDATE application_questions 
SET order_index = numbered.new_order
FROM numbered
WHERE application_questions.id = numbered.id;
