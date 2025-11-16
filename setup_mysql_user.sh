#!/bin/bash

# MySQL User Setup Script
# This script will create the MySQL user and database for the application

echo "🔧 Setting up MySQL user and database..."
echo ""
echo "⚠️  You'll need MySQL root access to run this script."
echo ""

# Check if MySQL is running
if ! pgrep -x mysqld > /dev/null; then
    echo "❌ MySQL is not running. Starting MySQL..."
    brew services start mysql
    sleep 3
fi

echo "Please enter MySQL root password (press Enter if no password):"
read -s ROOT_PASSWORD

# Try to connect without password first
if [ -z "$ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root"
else
    MYSQL_CMD="mysql -u root -p$ROOT_PASSWORD"
fi

echo ""
echo "📝 Creating database and user..."

# Create the SQL script
SQL_FILE=$(mktemp)
cat > "$SQL_FILE" << 'SQL'
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
SELECT User, Host FROM mysql.user WHERE User = 'kabin_user';
SHOW DATABASES LIKE 'app';
SQL

# Execute SQL
if $MYSQL_CMD < "$SQL_FILE" 2>&1; then
    echo ""
    echo "✅ MySQL user and database setup complete!"
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: localhost"
    echo "   Port: 3306"
    echo "   Username: kabin_user"
    echo "   Password: kabin_pass_2024"
    echo "   Database: app"
    echo ""
    echo "🧪 Testing connection..."
    if mysql -u kabin_user -p'kabin_pass_2024' -e "SELECT 'Connection successful!' AS status;" 2>&1 | grep -q "successful"; then
        echo "✅ Connection test successful!"
    else
        echo "⚠️  Connection test failed. Please check the credentials."
    fi
else
    echo ""
    echo "❌ Failed to setup MySQL user."
    echo ""
    echo "💡 Alternative: Try running the SQL manually:"
    echo "   mysql -u root -p < setup_mysql.sql"
    echo ""
    echo "Or if you don't have root password:"
    echo "   mysql -u root < setup_mysql.sql"
fi

rm "$SQL_FILE"

