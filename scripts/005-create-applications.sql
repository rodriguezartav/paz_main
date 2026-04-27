-- Create application questions table
CREATE TABLE IF NOT EXISTS application_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_intro TEXT,
  question_text TEXT NOT NULL,
  question_description TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'date', 'number', 'email', 'phone', 'checkbox', 'agreement')),
  options JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'waitlist', 'needs_more_info')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  internal_score INTEGER CHECK (internal_score IS NULL OR (internal_score >= 1 AND internal_score <= 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create application answers table with snapshots
CREATE TABLE IF NOT EXISTS application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES application_questions(id) ON DELETE RESTRICT,
  answer_value JSONB NOT NULL DEFAULT '""'::jsonb,
  question_text_snapshot TEXT NOT NULL,
  section_title_snapshot TEXT NOT NULL,
  question_type_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_application_questions_section ON application_questions(section_key);
CREATE INDEX IF NOT EXISTS idx_application_questions_active ON application_questions(active);
CREATE INDEX IF NOT EXISTS idx_application_questions_order ON application_questions(section_key, order_index);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_application_answers_application ON application_answers(application_id);
CREATE INDEX IF NOT EXISTS idx_application_answers_question ON application_answers(question_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_application_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_application_questions_timestamp ON application_questions;
CREATE TRIGGER update_application_questions_timestamp
  BEFORE UPDATE ON application_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_application_questions_updated_at();

CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_applications_timestamp ON applications;
CREATE TRIGGER update_applications_timestamp
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

CREATE OR REPLACE FUNCTION update_application_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_application_answers_timestamp ON application_answers;
CREATE TRIGGER update_application_answers_timestamp
  BEFORE UPDATE ON application_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_application_answers_updated_at();
