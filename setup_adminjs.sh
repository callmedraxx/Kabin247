#!/bin/bash

# AdminJS Setup Script
# Modern web-based database admin panel

echo "🎨 Setting up AdminJS (Modern Web-Based Database Admin)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install AdminJS dependencies
echo ""
echo "📦 Installing AdminJS dependencies..."
npm install adminjs @adminjs/express @adminjs/sequelize sequelize mysql2 dotenv express
npm install --save-dev tsx @types/express @types/node

echo ""
echo "✅ AdminJS setup complete!"
echo ""
echo "📋 Important: AdminJS runs as a SEPARATE standalone server"
echo "   It connects directly to your MySQL database - no AdonisJS needed!"
echo ""
echo "🚀 To start AdminJS:"
echo "   npm run adminjs"
echo ""
echo "🌐 Then open: http://localhost:3001/admin"
echo ""
echo "💡 You can run AdminJS alongside your AdonisJS app:"
echo "   Terminal 1: npm run dev (AdonisJS)"
echo "   Terminal 2: npm run adminjs (AdminJS)"
echo ""
echo "📊 AdminJS will automatically use your .env database credentials"

