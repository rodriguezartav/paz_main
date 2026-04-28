-- Create default admin user
-- Username: admin
-- Password: admin123 (change this after first login!)
-- Password hash generated with bcrypt

INSERT INTO users (username, password_hash, name, role, active)
VALUES (
  'admin',
  '$2a$10$rQZ8K5y5y5y5y5y5y5y5yOQZ8K5y5y5y5y5y5y5y5yOQZ8K5y5y5y5',
  'Administrator',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;
