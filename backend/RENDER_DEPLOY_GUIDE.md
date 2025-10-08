# Render Deployment Guide

## Setup Instructions for Render

### 1. Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Sprouting-Tech/thaiparts-infinity`
4. Configure service:
   - **Name:** `thaiparts-infinity-backend`
   - **Branch:** `feat/frontend` (or your current branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 2. Environment Variables (Required)
Set these in Render Dashboard → Environment Variables:

#### Database (Supabase Postgres)
```
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:Thaiparts2025@db.fnkrdsxktnoldfyueenn.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

#### Supabase Storage
```
SUPABASE_URL=https://fnkrdsxktnoldfyueenn.supabase.co
SUPABASE_BUCKET=uploads
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua3Jkc3hrdG5vbGRmeXVlZW5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkxNjE1NSwiZXhwIjoyMDc1NDkyMTU1fQ.5k-tsYmaA9LVe5TTgZkPSOdDUENbEvoF5vzkcqEp6cw
```

#### Strapi Secrets (copy from your .env)
```
APP_KEYS=3yzvF6+EU1VihaIAKsRdQA==,e143vte4yE8pcREBCVtBAA==,TJoMyHTOtLwsAxXcHb77Hg==,GyZ2/HEJY5fPND2i0SkRFA==
API_TOKEN_SALT=130j7ENxwveZwSNTqxtGqA==
ADMIN_JWT_SECRET=0yXRTj2/6Kan7xukiEkGQA==
TRANSFER_TOKEN_SALT=gYhNAvg7Jas5yGQ6elgrgg==
ENCRYPTION_KEY=hcq817m5JkgXJtZ1tYK9OA==
JWT_SECRET=6xy0R4a9Ck6jxPPIqhKtCw==
```

#### Server Config
```
HOST=0.0.0.0
PORT=10000
NODE_ENV=production
```

### 3. Additional Settings
- **Instance Type:** Starter (512MB RAM) - sufficient for prototype
- **Auto-Deploy:** Yes (deploy on git push)

### 4. After Deploy
- URL will be: `https://thaiparts-infinity-backend.onrender.com`
- Admin panel: `https://thaiparts-infinity-backend.onrender.com/admin`
- API: `https://thaiparts-infinity-backend.onrender.com/api`

### 5. Database Status
✅ **Already Migrated:** SQLite → Postgres (Supabase)  
✅ **Content:** 3 posts, 5 products, 3 services (deduplicated)  
✅ **Media:** 108 files on Supabase Storage  
✅ **Relations:** All working correctly  

### 6. Post-Deploy Verification
Test these endpoints:
- `GET /api/posts` - Should return 3 posts
- `GET /api/products` - Should return 5 products  
- `GET /api/services` - Should return 3 services
- `GET /api/global` - Should return global settings
- Admin login should work at `/admin`

## Local Development
Local `.env` file remains unchanged for continued development.