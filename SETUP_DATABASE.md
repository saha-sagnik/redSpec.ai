# Database Setup Guide - Neon PostgreSQL

## 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up/Login
3. Create a new project
4. Copy your connection string (it will look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

## 2. Set Environment Variable

Add to your `.env` file:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

## 3. Run Database Migration

Connect to your Neon database and run the SQL schema:

```bash
# Option 1: Using Neon Console SQL Editor
# Copy and paste the contents of lib/db/schema.sql into the SQL editor

# Option 2: Using psql
psql "your_connection_string" < lib/db/schema.sql
```

## 4. Verify Setup

The database will have two tables:
- `prds` - Stores PRD documents
- `conversations` - Stores chat history (optional, for future use)

## 5. Test Connection

The API routes will automatically use the database once `DATABASE_URL` is set.

## Notes

- Neon provides serverless PostgreSQL, perfect for Next.js
- No connection pooling needed - Neon handles it
- Free tier includes 0.5GB storage and 1 project
- Auto-scales based on usage

