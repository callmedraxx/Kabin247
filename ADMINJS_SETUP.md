# AdminJS Setup Guide

AdminJS is a **standalone web-based database admin panel** that runs separately from your AdonisJS application. It connects directly to your MySQL database - no AdonisJS integration needed!

## How It Works

- ✅ **Separate Express server** - Runs on port 3001 (or your choice)
- ✅ **Direct MySQL connection** - Uses your `.env` database credentials
- ✅ **No AdonisJS dependency** - Completely independent service
- ✅ **Modern React UI** - Beautiful, responsive interface

## Quick Setup

### Step 1: Install Dependencies

```bash
./setup_adminjs.sh
```

Or manually:
```bash
npm install adminjs @adminjs/express @adminjs/sequelize sequelize mysql2 dotenv express
npm install --save-dev tsx @types/express @types/node
```

### Step 2: Start AdminJS

```bash
npm run adminjs
```

### Step 3: Access AdminJS

Open your browser: **http://localhost:3001/admin**

## Running Both Services

You can run AdminJS alongside your AdonisJS app:

**Terminal 1** (AdonisJS):
```bash
npm run dev
```

**Terminal 2** (AdminJS):
```bash
npm run adminjs
```

## Configuration

AdminJS automatically reads from your `.env` file:
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port  
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_DATABASE` - Database name
- `ADMINJS_PORT` - AdminJS server port (default: 3001)

## Features

- 🎨 Modern React-based UI
- 📊 Browse all tables and data
- ✏️ Edit records inline
- 🔍 Search and filter
- 📈 View relationships
- 🔐 Optional authentication (currently disabled for local dev)

## Troubleshooting

### Port Already in Use
Change the port in `.env`:
```
ADMINJS_PORT=3002
```

### Database Connection Failed
Check your `.env` file has correct MySQL credentials:
```bash
./show_db_credentials.sh
```

### AdminJS Not Starting
Make sure all dependencies are installed:
```bash
npm install
```

## Security Note

⚠️ **For local development only** - AdminJS currently has no authentication. For production, add authentication middleware.

