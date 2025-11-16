-- Create database
CREATE DATABASE IF NOT EXISTS app;

-- Create user with password
CREATE USER IF NOT EXISTS 'kabin_user'@'localhost' IDENTIFIED BY 'kabin_pass_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON app.* TO 'kabin_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Confirm
SELECT 'Database and user created successfully!' AS status;
