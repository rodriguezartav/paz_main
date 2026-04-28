-- Delete the old admin user and let the setup page create a fresh one
DELETE FROM users WHERE username = 'admin';
