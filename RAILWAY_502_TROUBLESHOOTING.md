# Railway 502 Bad Gateway Troubleshooting Guide

## Problem: 502 Bad Gateway with No Runtime Logs

If you see **502 Bad Gateway** ("Application failed to respond") and **no runtime logs** in the last 15 minutes after a successful build, this guide will help you diagnose and fix the issue.

---

## Root Causes for 502 with No Logs

The most common causes are:

1. **Application not listening on the correct PORT** (Railway sets this dynamically)
2. **Application not binding to 0.0.0.0** (binding only to localhost won't work)
3. **Missing required environment variables** causing the app to crash immediately on start
4. **Database connection failure** preventing the app from starting
5. **Application startup crash** before logging is initialized

---

## Step-by-Step Diagnosis & Fixes

### 1. Verify Service is Running on Correct Port

**Problem:** Railway assigns a dynamic `PORT` environment variable (often 3000, 8080, or other values). Medusa must listen on this port, not a hardcoded port.

**✅ How to Fix:**

Medusa reads the `PORT` environment variable by default. Ensure your Railway service has:

**Railway Environment Variables:**
```bash
PORT=9000  # Railway will override this with the actual assigned port
HOST=0.0.0.0  # Required - bind to all network interfaces, not just localhost
```

**Important:** 
- Railway will automatically set `PORT` to the correct value (you don't need to set it manually in most cases)
- The key issue is that Medusa must bind to `0.0.0.0`, not `127.0.0.1` or `localhost`

**How to Check:**
1. Go to your Railway service → **Variables** tab
2. Confirm `HOST=0.0.0.0` is set
3. Medusa will automatically use Railway's `PORT` variable

---

### 2. Set Required HOST and PORT Configuration

**Railway Configuration:**

In Railway service settings → **Variables**:

```bash
# Required for Railway
HOST=0.0.0.0
PORT=9000  # Optional - Railway sets this automatically
```

**Why `HOST=0.0.0.0` is Critical:**

- Default behavior: Apps often bind to `127.0.0.1` (localhost only)
- Railway needs: Apps must bind to `0.0.0.0` (all network interfaces) 
- Without this: Railway's reverse proxy cannot reach your app → 502 error
- With this: Railway can route external traffic to your container

---

### 3. Required Environment Variables for Medusa

**Minimum Required Variables:**

```bash
# Database (CRITICAL - app won't start without this)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security Secrets (CRITICAL - app won't start without these)
JWT_SECRET=your-random-secret-min-32-chars
COOKIE_SECRET=your-random-secret-min-32-chars

# CORS Configuration (CRITICAL - defines allowed origins)
STORE_CORS=https://your-storefront.com,http://localhost:3000
ADMIN_CORS=https://your-admin.com,http://localhost:8000
VENDOR_CORS=https://your-vendor.com,http://localhost:7000
AUTH_CORS=https://your-backend.com,http://localhost:9000

# Backend URL (for email templates, webhooks)
BACKEND_URL=https://your-railway-domain.up.railway.app

# Optional but Recommended
NODE_ENV=production
REDIS_URL=redis://host:6379  # If using Redis for cache
```

**Additional Variables for Plugins:**

If you're using specific Medusa plugins, you'll need:

```bash
# Stripe (if using payment-stripe-connect)
STRIPE_SECRET_API_KEY=sk_live_xxxxx

# Algolia (if using algolia module)
ALGOLIA_API_KEY=your-api-key
ALGOLIA_APP_ID=your-app-id

# Resend (if using resend notifications)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# S3/File Storage (if using S3 file module)
S3_ACCESS_KEY_ID=xxxxx
S3_SECRET_ACCESS_KEY=xxxxx
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_FILE_URL=https://your-bucket.s3.amazonaws.com
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com

# Panel URLs (for cross-linking)
ADMIN_PANEL_URL=https://your-admin.com
VENDOR_PANEL_URL=https://your-vendor.com
STOREFRONT_URL=https://your-storefront.com
```

**⚠️ What Happens if These Are Missing:**

- `DATABASE_URL` missing → App crashes immediately with database connection error
- `JWT_SECRET` or `COOKIE_SECRET` missing → App refuses to start (security requirement)
- CORS variables missing → API will reject all requests (CORS errors)
- Plugin API keys missing → Plugin initialization fails, app may crash

---

### 4. Confirm Postgres is Attached and DATABASE_URL is Present

**How to Verify:**

**Option A: Check Railway Dashboard**
1. Go to your Railway project
2. Click on your **API service**
3. Go to **Variables** tab
4. Look for `DATABASE_URL` variable
   - ✅ If present: Shows as `postgres://...` (value hidden for security)
   - ❌ If missing: You need to add Postgres

**Option B: Check Service Dependencies**
1. In Railway project view, look for lines connecting services
2. Your **API service** should have a line connecting to **Postgres**
3. If not connected, add Postgres:
   - Click **"+ New"** → **Database** → **Add PostgreSQL**
   - Railway will auto-generate `DATABASE_URL` variable

**Option C: View Raw Variables**
1. Go to API service → **Variables** tab
2. Click **"Show raw variables"** or **"All variables"**
3. Scroll to find `DATABASE_URL`
4. Format should be: `postgresql://user:password@host:port/database`

**Manual DATABASE_URL Setup (if not auto-generated):**

If you have an external Postgres database:

```bash
# Format
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE

# Example
DATABASE_URL=postgresql://postgres:mypassword@containers-us-west-xxx.railway.app:5432/railway

# With SSL (for Railway Postgres)
# Railway Postgres requires SSL by default - Medusa handles this in production mode
DATABASE_URL=postgresql://postgres:mypassword@containers-us-west-xxx.railway.app:5432/railway
```

**Database Migrations:**

After DATABASE_URL is set, run migrations:

1. **Option A: Add to Build Command** (Recommended)
   ```bash
   Build Command: yarn install --frozen-lockfile && yarn build && yarn workspace api db:migrate
   ```

2. **Option B: One-time Manual Migration**
   - Go to Railway service → **Deployments** tab
   - Click latest deployment → **View Logs**
   - Find **Build logs** section
   - Add migration to build command (see Option A)

---

### 5. Check Railway Logs and Expand Time Range

**Where to Find Logs:**

**A. Runtime Logs (Application Console Output)**
1. Go to your Railway project
2. Click your **API service**
3. Click **Deployments** tab
4. Click on the **latest deployment**
5. **Deploy Logs** section shows runtime logs

**B. Build Logs (Compilation/Build Output)**
1. Same as above, but look at **Build Logs** section
2. Shows `yarn build` output, migrations, etc.

**C. Change Time Range**
1. On the logs view, look for time filter (top-right or inline)
2. Default is usually "Last 15 minutes"
3. Change to:
   - **Last 1 hour** - to see earlier startup logs
   - **Last 24 hours** - to see all recent deploys
   - **All logs** - complete history

**D. Search Logs**
1. Use the search box to filter for:
   - `ERROR` - find errors
   - `Listening` - confirm server started
   - `DATABASE` - database connection issues
   - `PORT` - port binding issues

**Common Log Patterns:**

**✅ Success Pattern (App is Running):**
```
Building...
Build succeeded
Starting...
Server listening on: 0.0.0.0:9000
```

**❌ Failure Pattern 1 (Missing DATABASE_URL):**
```
Building...
Build succeeded
Starting...
Error: Connection terminated unexpectedly
    at Connection.<anonymous> (node_modules/pg/lib/client.js:...)
Error: Missing required environment variable: DATABASE_URL
```

**❌ Failure Pattern 2 (Wrong PORT/HOST):**
```
Building...
Build succeeded
Starting...
(No further logs - process exits silently)
```
→ This indicates app crashed before logging initialized, likely PORT/HOST issue

**❌ Failure Pattern 3 (CORS Errors After Startup):**
```
Server listening on: 0.0.0.0:9000
GET /health 200
OPTIONS /store/products - CORS error: Origin not allowed
```
→ App is running but CORS is misconfigured

**How to Access Older Logs:**

If you see **"No logs in last 15 minutes"**:

1. **Expand time range** to "Last 1 hour" or "Last 24 hours"
2. Look at **previous deployments** (older builds may have error logs)
3. Check **Build logs** vs **Deploy logs** (separate sections)
4. If still no logs → app is crashing immediately on start (see fixes above)

**Enable Verbose Logging:**

Add to Railway environment variables:
```bash
LOG_LEVEL=debug
DEBUG=*
```

---

### 6. Recommended Final Railway Configuration

**Complete Railway Service Configuration:**

```yaml
Service Name: api (or backend)
Root Directory: / (leave empty - use monorepo root)

Build Command:
  yarn install --frozen-lockfile && yarn build && yarn workspace api db:migrate

Start Command:
  yarn workspace api start

Watch Paths: (optional - auto-deploy on changes)
  /apps/backend/**
  /packages/**
```

**Complete Environment Variables:**

```bash
# ========================================
# REQUIRED - Core Configuration
# ========================================

# Host & Port (Railway sets PORT automatically, but HOST is critical)
HOST=0.0.0.0

# Database (Auto-generated when you add Railway Postgres)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# Security Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-random-secret-min-32-chars
COOKIE_SECRET=another-random-secret-min-32-chars

# CORS - Replace with your actual domains
STORE_CORS=https://your-storefront.com
ADMIN_CORS=https://your-admin.com
VENDOR_CORS=https://your-vendor.com
AUTH_CORS=https://api.your-domain.com

# Backend URL - Use your Railway-generated domain
BACKEND_URL=https://api-production-xxxx.up.railway.app

# ========================================
# RECOMMENDED
# ========================================

NODE_ENV=production

# Redis (if using caching/sessions)
# Add Redis database in Railway, it will auto-generate REDIS_URL
# REDIS_URL=redis://host:6379

# ========================================
# OPTIONAL - Plugin Configuration
# ========================================

# Stripe Payment
STRIPE_SECRET_API_KEY=sk_live_xxxxx

# Algolia Search
ALGOLIA_API_KEY=your-api-key
ALGOLIA_APP_ID=your-app-id

# Resend Email
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# S3 File Storage
# S3_ACCESS_KEY_ID=xxxxx
# S3_SECRET_ACCESS_KEY=xxxxx
# S3_REGION=us-east-1
# S3_BUCKET=your-bucket
# S3_FILE_URL=https://your-bucket.s3.amazonaws.com
# S3_ENDPOINT=https://s3.us-east-1.amazonaws.com

# Panel URLs
ADMIN_PANEL_URL=https://admin.your-domain.com
VENDOR_PANEL_URL=https://vendor.your-domain.com
STOREFRONT_URL=https://www.your-domain.com
```

---

## Quick Troubleshooting Checklist

Use this checklist to diagnose your 502 error:

### ✅ Pre-Deployment Checklist

- [ ] **Railway Postgres Added**: Project has Postgres database service
- [ ] **DATABASE_URL Present**: Check Variables tab for DATABASE_URL
- [ ] **Environment Variables Set**: All required variables configured (see Section 3)
- [ ] **Build Command Correct**: `yarn install --frozen-lockfile && yarn build && yarn workspace api db:migrate`
- [ ] **Start Command Correct**: `yarn workspace api start`
- [ ] **Root Directory**: Set to `/` or left empty (monorepo root)
- [ ] **HOST Variable Set**: `HOST=0.0.0.0` in environment variables

### 🔍 Post-Deployment Diagnosis

- [ ] **Check Build Logs**: Did build complete successfully? Look for "Build succeeded"
- [ ] **Check Deploy Logs**: Expand time range to "Last 1 hour", look for startup errors
- [ ] **Search for "Listening"**: Does log show "Server listening on: 0.0.0.0:XXXX"?
- [ ] **Search for "ERROR"**: Any database, environment, or plugin errors?
- [ ] **Verify DATABASE_URL**: Raw variables tab shows postgres:// connection string?
- [ ] **Test Database Connection**: Run migration in build command (see Section 4)
- [ ] **Check Service Status**: Railway dashboard shows service as "Active" (green)?

### 🐛 Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| **502 + No Logs** | App crashing before logging initialized | Add `HOST=0.0.0.0`, check DATABASE_URL |
| **Build succeeds, Deploy silent** | Missing DATABASE_URL or secrets | Add required env vars (Section 3) |
| **"Cannot connect to database"** | DATABASE_URL missing/incorrect | Attach Postgres, verify variable |
| **CORS errors in logs** | CORS variables not set | Add STORE_CORS, ADMIN_CORS, etc. |
| **"Port already in use"** | Multiple instances, wrong PORT | Railway manages PORT, ensure using env var |
| **Logs show "Listening" but 502** | HOST not 0.0.0.0 | Set `HOST=0.0.0.0` |

---

## Testing Locally to Simulate Railway

To test Railway configuration locally:

```bash
# 1. Set environment variables (create .env in apps/backend)
cd /home/runner/work/mercur/mercur
cp apps/backend/.env.template apps/backend/.env

# 2. Edit .env with Railway-like values
HOST=0.0.0.0
PORT=9000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketplace
# ... add other variables ...

# 3. Clean build (simulate Railway build)
rm -rf apps/backend/.medusa packages/*/dist packages/modules/*/.medusa
yarn install --frozen-lockfile
yarn build

# 4. Run migrations
yarn workspace api db:migrate

# 5. Start app (simulate Railway start)
yarn workspace api start

# 6. Test from another terminal
curl http://0.0.0.0:9000/health
# Should return: {"status":"ok"} or similar

# 7. Test from localhost (simulates Railway proxy)
curl http://localhost:9000/health
# Should also work if HOST=0.0.0.0
```

**If this works locally but fails on Railway:**
- Compare local .env with Railway environment variables
- Check Railway uses same build/start commands
- Verify Railway Postgres is actually connected (link in project graph)

---

## Understanding Railway Networking

**How Railway Routes Traffic:**

```
Internet → Railway Proxy (your-app.up.railway.app)
           ↓ (forwards to PORT on HOST)
       Your Container (0.0.0.0:$PORT)
           ↓
       Medusa App (must listen on 0.0.0.0)
```

**Common Mistakes:**

❌ **Wrong:** App listens on `127.0.0.1:9000` (localhost only)
- Railway proxy cannot reach it → 502

✅ **Correct:** App listens on `0.0.0.0:9000` (all interfaces)
- Railway proxy can reach it → Success

❌ **Wrong:** Hardcoded port `app.listen(3000)`
- Railway assigns different PORT → 502

✅ **Correct:** Use environment PORT `app.listen(process.env.PORT || 9000)`
- Medusa does this by default

---

## Advanced Debugging

### View Railway Deployment Details

**Via Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs

# View environment variables
railway variables

# Run command in Railway environment
railway run medusa db:migrate
```

### Health Check Endpoint

Add a health check to verify app is running:

**Test from Railway Logs:**
1. Wait for "Server listening..." log
2. In browser, visit: `https://your-app.up.railway.app/health`
3. Should return JSON: `{"status":"ok"}` or similar

**If /health returns 502:**
- App is not actually listening (check HOST/PORT)
- App crashed after showing "listening" log (check for errors after)

**If /health returns 404:**
- App is running but no health endpoint
- Medusa should have default `/health` endpoint
- Check Medusa version and configuration

---

## Still Not Working?

If you've followed all steps and still see 502:

1. **Share Logs**: Export Railway logs (copy/paste from logs viewer)
2. **Verify Variables**: Screenshot of Variables tab (hide secrets)
3. **Build Output**: Share full build log output
4. **Local Test**: Confirm `yarn build && yarn workspace api start` works locally
5. **Deployment History**: Check if previous deployments worked (Railway → Deployments)

**Get Help:**
- [Mercur Discord Community](https://discord.gg/NTWNa49S)
- [Railway Discord](https://discord.gg/railway)
- [Medusa Discord](https://discord.gg/medusajs)

---

## Summary: Most Common Fix

**For 90% of 502 + No Logs cases, this fixes it:**

1. **Add Railway Postgres Database**
   - Click "+ New" → Database → Add PostgreSQL
   - Railway auto-generates `DATABASE_URL`

2. **Set Environment Variables**
   ```bash
   HOST=0.0.0.0
   JWT_SECRET=your-random-secret-min-32-chars
   COOKIE_SECRET=another-random-secret-min-32-chars
   STORE_CORS=https://your-storefront.com
   ADMIN_CORS=https://your-admin.com
   VENDOR_CORS=https://your-vendor.com
   AUTH_CORS=https://your-backend.com
   BACKEND_URL=https://your-railway-domain.up.railway.app
   ```

3. **Update Build Command**
   ```bash
   yarn install --frozen-lockfile && yarn build && yarn workspace api db:migrate
   ```

4. **Redeploy**
   - Railway → Deployments → Click "Deploy" or trigger new deployment
   - Watch logs for "Server listening on: 0.0.0.0:XXXX"
   - Test: `https://your-app.up.railway.app/health`

**Expected Success Pattern:**
```
✔ Build completed
✔ Running migrations
✔ Starting application
Server listening on: 0.0.0.0:3000
```

---

**See Also:**
- [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) - Build failures and monorepo setup
- [RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md) - Quick reference configuration
