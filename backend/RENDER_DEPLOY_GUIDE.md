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
DATABASE_URL=<your_supabase_postgres_connection_string>
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

#### Supabase Storage
```
SUPABASE_URL=<your_supabase_project_url>
SUPABASE_BUCKET=uploads
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
```

#### Strapi Secrets (copy from your local .env file)
```
APP_KEYS=<comma_separated_app_keys>
API_TOKEN_SALT=<your_api_token_salt>
ADMIN_JWT_SECRET=<your_admin_jwt_secret>
TRANSFER_TOKEN_SALT=<your_transfer_token_salt>
ENCRYPTION_KEY=<your_encryption_key>
JWT_SECRET=<your_jwt_secret>
```

#### Server Config
```
HOST=0.0.0.0
PORT=10000
NODE_ENV=production
```

Additionally set the public URL so Strapi knows the external HTTPS address used by Render:
```
PUBLIC_URL=https://thaiparts-infinity-backend.onrender.com
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