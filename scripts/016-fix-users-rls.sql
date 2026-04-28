-- Fix RLS on users table to allow the app to read/write
-- Disable RLS temporarily for this table since we're managing our own auth

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all for users" ON users;

-- Insert default admin user if not exists
-- Password: admin123 (bcrypt hash with 12 rounds)
INSERT INTO users (username, password_hash, name, role, active)
VALUES (
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.XrvFJGPwNxZe.S',
  'Administrator',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;
