# Deployment Guide: Render, Netlify & Neon

This guide covers deploying the Ultimate College ERP system across three platforms:
- **Backend**: Render (FastAPI Python application)
- **Frontend**: Netlify (React + Vite SPA)
- **Database**: Neon (PostgreSQL managed service)

---

## Table of Contents
1. [Database Setup (Neon)](#database-setup-neon)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Database Setup (Neon)

### Step 1: Create Neon Account & Project

1. Go to [https://neon.tech/](https://neon.tech/) and sign up
2. Create a new project (name it `ultimate-college-erp`)
3. Choose PostgreSQL version 15 or higher
4. Select a region closest to your users

### Step 2: Create Database & User

1. In the Neon dashboard, go to **SQL Editor**
2. Execute the schema:
   ```bash
   # Copy the contents of database/schema.sql
   # Paste into Neon SQL Editor and run
   ```
3. Execute the seed data:
   ```bash
   # Copy the contents of database/seed.sql
   # Paste into Neon SQL Editor and run
   ```

### Step 3: Get Connection String

1. In Neon dashboard, click **Connection string**
2. Copy the **Connection string** (looks like: `postgresql://user:password@host:5432/dbname`)
3. Replace `[user]` and `[password]` with your actual credentials if they contain special characters
4. **Save this somewhere secure** - you'll need it for Render

### Example Connection String Format
```
postgresql://neon_user:a1b2c3d4e5f6@ep-blue-lake-12345.us-west-2.neon.tech:5432/ultimate_college_erp
```

---

## Backend Deployment (Render)

### Step 1: Prepare Repository

1. Ensure your Git repository is pushed to GitHub/GitLab/Gitea

2. Create a production `.env.example` in the `backend/` directory:
   ```bash
   cd backend
   cat > .env.example << 'EOF'
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   JWT_SECRET=your-super-secret-key-change-in-production
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=60
   UPLOAD_DIR=./uploads
   MAX_UPLOAD_MB=10
   CORS_ORIGINS=https://your-netlify-domain.netlify.app,https://yourdomain.com
   EOF
   ```

3. Create `Procfile` in the `backend/` directory:
   ```
   web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
   ```

4. Create `render.yaml` in the project root (for infrastructure as code):
   ```yaml
   services:
     - type: web
       name: ultimate-college-backend
       env: python
       plan: free
       region: ohio
       buildCommand: pip install -r backend/requirements.txt
       startCommand: cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: DATABASE_URL
           scope: build
           sync: false
         - key: JWT_SECRET
           scope: build
           sync: false
         - key: CORS_ORIGINS
           scope: build
           sync: false
   ```

### Step 2: Deploy to Render

1. Go to [https://render.com/](https://render.com/) and sign in with GitHub
2. Click **New +** → **Web Service**
3. Select your repository containing the ERP code
4. Fill in the configuration:
   - **Name**: `ultimate-college-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Starter (free tier) or higher as needed

5. Click **Advanced** and add **Environment Variables**:
   - `DATABASE_URL`: (paste your Neon connection string)
   - `JWT_SECRET`: (generate a strong random secret: `openssl rand -hex 32`)
   - `CORS_ORIGINS`: (your frontend domain, initially `http://localhost:3000` for testing)
   - `UPLOAD_DIR`: `/tmp/uploads` (use /tmp for temporary uploads since Render's filesystem is ephemeral)

### Step 3: Configure Important Settings

**Disable Auto-Deploy if Needed**: If you want to control deployments, go to the service settings → **Auto-Deploy** and toggle off.

**Monitor Logs**: Click **Logs** tab to verify the application starts successfully.

**Get Backend URL**: Once deployed, you'll see a URL like:
```
https://ultimate-college-backend.onrender.com
```

---

## Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. Update API endpoint in frontend configuration.

2. Create/update `frontend/.env.production`:
   ```
   VITE_API_URL=https://ultimate-college-backend.onrender.com/api
   ```

3. Update `frontend/src/services/api.js` to use the environment variable:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
   ```

4. Ensure `frontend/vite.config.js` is configured correctly:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'http://localhost:8000',
           changeOrigin: true,
         }
       }
     }
   })
   ```

5. Build the frontend locally to test:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Step 2: Connect to Netlify

1. Go to [https://netlify.com/](https://netlify.com/) and sign up/log in
2. Click **Add new site** → **Import an existing project**
3. Select your Git provider and repository
4. Choose the `ultimate-college-erp` repository

### Step 3: Configure Build Settings

1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `frontend/dist`

### Step 4: Add Environment Variables

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the following environment variables:
   - `VITE_API_URL`: `https://ultimate-college-backend.onrender.com/api`
   - `CI`: `false` (if you get build warnings preventing deployment)

### Step 5: Deploy

1. Click **Deploy site**
2. Wait for the build to complete (typically 2-5 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://ultimate-college-erp.netlify.app
   ```

### Step 6: Update Backend CORS Settings

1. Go back to Render dashboard
2. Edit the backend service
3. Update `CORS_ORIGINS` environment variable to include your Netlify domain:
   ```
   https://ultimate-college-erp.netlify.app,https://yourdomain.com
   ```
4. Redeploy the backend

---

## Post-Deployment Configuration

### Step 1: Update Database Connection (Optional)

If you want to use a custom domain or update any settings on Neon:

1. Go to Neon dashboard
2. Verify **Connection string** matches what's in Render
3. Monitor **Database metrics** to ensure no connection issues

### Step 2: Test API Endpoints

1. Open your Netlify frontend URL
2. Try logging in - should make requests to Render backend
3. Check browser **Developer Tools** → **Network** tab to verify API calls

4. Test API directly:
   ```bash
   curl https://ultimate-college-backend.onrender.com/docs
   ```

### Step 3: Setup Custom Domain (Optional)

**For Netlify Frontend:**
1. Go to **Domain settings**
2. Add a custom domain (e.g., `erp.yourschool.com`)
3. Update DNS records as instructed by Netlify

**For Render Backend:**
1. Go to **Settings** → **Custom Domain**
2. Add a custom domain (e.g., `api.yourschool.com`)
3. Update DNS records

**Important**: After changing domains, update `CORS_ORIGINS` in Render to match.

### Step 4: Enable HTTPS

Both Netlify and Render automatically provide HTTPS with Let's Encrypt. ✓

---

## Environment Variables Summary

### Render (Backend) - Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key (min 32 chars)
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
UPLOAD_DIR=/tmp/uploads
MAX_UPLOAD_MB=10
CORS_ORIGINS=https://ultimate-college-erp.netlify.app
```

### Netlify (Frontend) - Environment Variables
```
VITE_API_URL=https://ultimate-college-backend.onrender.com/api
CI=false
```

### Neon (Database)
- Connection string stored securely with Neon account
- Used in `DATABASE_URL` on Render

---

## File Uploads Handling

Since Render's filesystem is ephemeral (files deleted on restart), implement one of these:

### Option 1: Use Neon for File Metadata (Recommended)
- Store file references in PostgreSQL
- Use Neon's blob storage or integrate with S3

### Option 2: Integrate with AWS S3
1. Create AWS S3 bucket
2. Add AWS credentials to Render environment:
   ```
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_S3_BUCKET=your-bucket-name
   ```
3. Update backend `uploads/routes.py` to use S3 instead of local filesystem

### Option 3: Use Cloudinary (Easier for Images)
1. Create Cloudinary account at [https://cloudinary.com/](https://cloudinary.com/)
2. Add to Render environment:
   ```
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```

---

## Monitoring & Maintenance

### Neon Monitoring
- Check **Database metrics** in Neon dashboard for query performance
- Monitor **Rows ratio** to ensure database isn't bloating
- Set up **Backups** (Neon includes daily automated backups on paid plans)

### Render Monitoring
- Monitor **CPU**, **Memory** usage in Render dashboard
- Check **Logs** for errors
- Set up **Health checks** if needed (Render does this automatically)

### Netlify Monitoring
- Monitor **Build performance** in Netlify analytics
- Check **Function logs** if using Netlify Functions
- Review **Deployment history**

---

## Scaling Considerations

| Component | Free Tier | Paid Tier |
|-----------|-----------|-----------|
| **Neon** | 5GB storage, no auto-scaling | 100GB+, auto-scaling |
| **Render** | 750 hrs/month web | Pay-per-use, multiple instances |
| **Netlify** | 100GB/month bandwidth | Additional bandwidth available |

---

## Troubleshooting

### Backend Won't Start
```
Error: DATABASE_URL not set
```
**Solution**: Verify `DATABASE_URL` environment variable is set in Render dashboard.

### CORS Errors in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Update `CORS_ORIGINS` in Render to include your Netlify domain exactly as it appears in browser URL.

### Database Connection Timeout
```
psycopg2.OperationalError: could not connect to server
```
**Solution**: 
1. Verify Neon connection string is correct
2. Ensure Neon project is active (not paused)
3. Check Neon's network settings for IP allowlisting

### Files Not Persisting
**Solution**: Files uploaded via backend disappear after restart because Render filesystem is ephemeral. Implement S3 or Cloudinary integration (see File Uploads Handling section).

### Frontend Shows 404 on Page Refresh
**Solution**: Configure Netlify's redirect rules for SPA. Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

### Slow Backend Response
**Solutions**:
1. Upgrade Render plan from free to paid instance
2. Add database indexes for frequently queried columns in Neon
3. Implement caching in FastAPI (Redis integration, though requires paid Render)

---

## Deployment Checklist

- [ ] Neon database created and schema/seed data loaded
- [ ] Render backend deployed with correct environment variables
- [ ] Netlify frontend deployed with correct API URL
- [ ] CORS_ORIGINS updated in Render to include Netlify domain
- [ ] Test login functionality end-to-end
- [ ] Test file uploads (if applicable - consider S3/Cloudinary first)
- [ ] Monitor first 24 hours for errors in logs
- [ ] Setup custom domains if needed
- [ ] Enable database backups on Neon
- [ ] Document deployment and admin procedures for team

---

## Quick Redeploy Commands

### Redeploy Backend (if using Render CLI)
```bash
render deploy --service-id=ultimate-college-backend
```

### Redeploy Frontend (if using Netlify CLI)
```bash
cd frontend
netlify deploy --prod --dir=dist
```

---

## Support & Resources

- **Neon Docs**: https://neon.tech/docs/
- **Render Docs**: https://docs.render.com/
- **Netlify Docs**: https://docs.netlify.com/
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Vite Build Docs**: https://vitejs.dev/guide/build.html

---

## Notes for Team

1. **Secrets Management**: Never commit `.env` files. Use platform-specific secrets management (Render env vars, Netlify env vars).

2. **Data Backups**: Regularly backup Neon database:
   ```bash
   # Download backup from Neon dashboard
   # Or use pg_dump if accessing directly
   pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

3. **API Documentation**: Available at `https://ultimate-college-backend.onrender.com/docs` once deployed (FastAPI Swagger UI).

4. **Version Control**: Keep deployment configurations (`render.yaml`, `Procfile`, `.env.example`) in version control but never commit actual secrets.

5. **Monitoring**: Set up alerts for:
   - Backend service down
   - Database connection issues
   - Frontend build failures

---

**Last Updated**: February 2026  
**System**: Ultimate College of Technology ERP  
**Architecture**: FastAPI (Render) + React/Vite (Netlify) + PostgreSQL (Neon)
