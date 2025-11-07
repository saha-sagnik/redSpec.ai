# PostgreSQL Database Setup with Neon

## ✅ What's Been Set Up

1. **Database Schema** (`lib/db/schema.sql`)
   - `prds` table - Stores PRD documents
   - `conversations` table - Stores chat history (for future use)
   - Indexes for performance
   - Auto-update timestamps

2. **API Routes**
   - `GET /api/prds` - List all PRDs (with filters)
   - `POST /api/prds` - Create new PRD
   - `GET /api/prds/[id]` - Get specific PRD
   - `PUT /api/prds/[id]` - Update PRD
   - `DELETE /api/prds/[id]` - Delete PRD

3. **Documents Dashboard** (`/app/documents/page.tsx`)
   - View all PRDs
   - Filter by status (draft, in_review, approved)
   - Search functionality
   - Delete PRDs

4. **Frontend Integration**
   - Chat page now saves to database instead of localStorage
   - Auto-save functionality
   - Load PRDs from database

## 🚀 Setup Steps

### 1. Create Neon Database

1. Go to https://console.neon.tech/
2. Sign up/Login
3. Create a new project
4. Copy your connection string

### 2. Add Environment Variable

Add to `.env`:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### 3. Run Database Migration

In Neon Console SQL Editor, run:

```sql
-- Copy contents from lib/db/schema.sql
```

Or use psql:

```bash
psql "your_connection_string" < lib/db/schema.sql
```

### 4. Test

1. Start dev server: `npm run dev`
2. Create a PRD in chat
3. Check `/documents` page to see saved PRDs

## 📊 Database Schema

### PRDs Table
- `id` (UUID) - Primary key
- `title` (VARCHAR) - PRD title
- `content` (TEXT) - Full PRD content
- `sections` (JSONB) - PRD sections as JSON
- `status` (VARCHAR) - draft, in_review, approved
- `template` (VARCHAR) - standard, mvp, enhancement, integration
- `github_repo` (VARCHAR) - Optional GitHub repo URL
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `created_by` (VARCHAR) - User identifier
- `metadata` (JSONB) - Additional data (story points, validation score, etc.)

### Conversations Table (Future Use)
- Stores chat history linked to PRDs
- For conversation replay and context

## 🔄 Migration from localStorage

The app now uses PostgreSQL instead of localStorage:
- ✅ All PRDs saved to database
- ✅ Persistent across sessions
- ✅ Can be shared across devices
- ✅ Full CRUD operations
- ✅ Search and filter capabilities

## 🎯 Next Steps

1. Add user authentication (optional)
2. Add sharing/collaboration features
3. Add version history
4. Add export functionality
5. Add analytics dashboard

