CREATE DATABASE IF NOT EXISTS app;
CREATE USER IF NOT EXISTS 'kabin247'@'localhost' IDENTIFIED BY 'kabin247';
GRANT ALL PRIVILEGES ON app.* TO 'kabin247'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully!' AS status;

