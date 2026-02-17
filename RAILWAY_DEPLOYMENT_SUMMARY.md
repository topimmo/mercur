# Railway Deployment Configuration - Final Summary

This document provides the **exact configuration** needed for Railway deployment of the Mercur backend.

## ✅ Correct Railway Configuration

### Service Settings

```yaml
Service Name: api
Root Directory: / (leave empty - use monorepo root)

Build Command:
  yarn install --frozen-lockfile && yarn build

Start Command:
  yarn workspace api start

Watch Paths: (optional - auto-deploy on changes)
  /apps/backend/**
  /packages/**
```

### Required Environment Variables

Set these in Railway's **Variables** tab:

```bash
# ========================================
# CRITICAL - Server Configuration
# ========================================
# Railway automatically sets PORT - don't override it
# HOST must be set to 0.0.0.0 for Railway to route traffic
HOST=0.0.0.0

# ========================================
# CRITICAL - Database
# ========================================
# Auto-generated when you add Railway Postgres
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# ========================================
# CRITICAL - Security Secrets
# ========================================
# Generate with: openssl rand -base64 32
JWT_SECRET=your-random-secret-min-32-chars
COOKIE_SECRET=another-random-secret-min-32-chars

# ========================================
# CRITICAL - CORS Configuration
# ========================================
# Replace with your actual frontend domains
STORE_CORS=https://your-storefront.com
ADMIN_CORS=https://your-admin.com
VENDOR_CORS=https://your-vendor.com
AUTH_CORS=https://api.your-domain.com

# ========================================
# CRITICAL - Backend URL
# ========================================
# Use your Railway-generated domain
BACKEND_URL=https://api-production-xxxx.up.railway.app

# ========================================
# RECOMMENDED
# ========================================
NODE_ENV=production

# ========================================
# OPTIONAL - Plugin Configuration
# ========================================
# Only needed if you use these features
STRIPE_SECRET_API_KEY=sk_live_xxxxx
ALGOLIA_API_KEY=your-api-key
ALGOLIA_APP_ID=your-app-id
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 📋 Answers to Your Questions

### 1. Correct Start Command for Railway Production

```bash
yarn workspace api start
```

**Why this works:**
- Railway runs from the monorepo root
- `yarn workspace api` targets the `apps/backend` package (named "api" in its package.json)
- The `start` script runs `medusa start --types=false` which starts the pre-built server

### 2. Workspace Name

```
api
```

**Verification:** The workspace name is defined in `/apps/backend/package.json`:
```json
{
  "name": "api",
  ...
}
```

### 3. Server Listening Configuration

✅ **FIXED** - The server now properly listens to `process.env.PORT` and `0.0.0.0`

**What was changed:**
- Updated `/apps/backend/medusa-config.ts` to include:
  ```typescript
  http: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 9000,
    // ... other config
  }
  ```

**How it works:**
- Railway dynamically assigns a port via `process.env.PORT`
- Medusa reads this from the config and listens on that port
- `HOST=0.0.0.0` ensures Railway's proxy can reach the container
- If PORT is not set (local dev), it defaults to 9000

### 4. Build Steps Required Before Start

✅ **YES** - Build is required, but it's handled in the Build Command

**Build process:**
1. `yarn install --frozen-lockfile` - Installs all dependencies
2. `yarn build` - Runs Turbo build for all workspaces:
   - Builds `@mercurjs/framework` (required by other packages)
   - Builds all `@mercurjs/*` modules (b2c-core, commission, algolia, etc.)
   - Builds `api` workspace via `medusa build` → creates `.medusa/` directory

**Start process:**
1. `yarn workspace api start` - Runs `medusa start --types=false`
2. Medusa loads the pre-built code from `.medusa/` directory
3. Server starts listening on configured HOST:PORT

**Important:** The build outputs are in `.medusa/` directory (not `dist/`). This is Medusa v2's build artifact location.

### 5. Package.json Scripts Verification

**Root package.json (`/package.json`):**
```json
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

**Backend package.json (`/apps/backend/package.json`):**
```json
{
  "name": "api",
  "scripts": {
    "build": "medusa build",
    "start": "medusa start --types=false"
  }
}
```

**Turbo configuration (`/turbo.json`):**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".medusa/**"]
    }
  }
}
```

✅ **All scripts are production-ready**

## 🎯 Exact Railway Start Command

```bash
yarn workspace api start
```

This is the **only correct** start command for Railway. Do not use:
- ❌ `medusa start` (won't work from monorepo root)
- ❌ `yarn start` (runs the root workspace, not backend)
- ❌ `cd apps/backend && yarn start` (changes directory, breaks workspace dependencies)
- ❌ `yarn workspace api dev` (development mode, not production)

## 🔍 Build Command Breakdown

```bash
yarn install --frozen-lockfile && yarn build
```

**Step-by-step:**
1. `yarn install --frozen-lockfile`
   - Installs all dependencies from `yarn.lock`
   - `--frozen-lockfile` ensures deterministic builds (required for CI/CD)
   - Installs dependencies for all workspaces (framework, modules, backend)

2. `yarn build`
   - Runs `turbo run build` from root package.json
   - Turbo respects `dependsOn: ["^build"]` in turbo.json
   - Build order (Turbo handles this automatically):
     1. `@mercurjs/framework` (no dependencies)
     2. All `@mercurjs/` modules (depend on framework)
     3. `api` workspace (depends on all modules)

3. **Backend build creates:**
   - `.medusa/server/` - Compiled server code
   - `.medusa/admin/` - Admin panel assets (if enabled)

## 🚨 Common Issues and Fixes

### Issue 1: 502 Bad Gateway with No Logs

**Cause:** App not listening on correct HOST/PORT

**Fix:** ✅ **ALREADY FIXED** in this PR
- `medusa-config.ts` now explicitly sets `host` and `port`
- Ensure `HOST=0.0.0.0` is set in Railway variables

### Issue 2: Build Succeeds but Start Fails

**Cause:** Missing required environment variables

**Fix:** Verify all CRITICAL variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `STORE_CORS`, `ADMIN_CORS`, `VENDOR_CORS`, `AUTH_CORS`
- `HOST=0.0.0.0`

### Issue 3: TypeScript Build Errors

**Cause:** Building from wrong directory (e.g., Root Directory set to `/apps/backend`)

**Fix:** Set Root Directory to `/` (monorepo root) in Railway settings

### Issue 4: Database Connection Errors

**Cause:** Railway Postgres not attached

**Fix:** Add PostgreSQL database in Railway:
1. Click **"+ New"** → **Database** → **Add PostgreSQL**
2. Railway auto-generates `DATABASE_URL`
3. Redeploy

## 📊 Deployment Checklist

Before deploying, verify:

- [ ] **Railway Service Settings:**
  - [ ] Root Directory: `/` (or empty)
  - [ ] Build Command: `yarn install --frozen-lockfile && yarn build`
  - [ ] Start Command: `yarn workspace api start`

- [ ] **Railway Environment Variables:**
  - [ ] `HOST=0.0.0.0`
  - [ ] `DATABASE_URL` (auto-generated from Railway Postgres)
  - [ ] `JWT_SECRET` (min 32 chars)
  - [ ] `COOKIE_SECRET` (min 32 chars)
  - [ ] `STORE_CORS` (your storefront domain)
  - [ ] `ADMIN_CORS` (your admin domain)
  - [ ] `VENDOR_CORS` (your vendor domain)
  - [ ] `AUTH_CORS` (your backend domain)
  - [ ] `BACKEND_URL` (Railway-generated domain)
  - [ ] `NODE_ENV=production`

- [ ] **Railway Resources:**
  - [ ] PostgreSQL database added and connected
  - [ ] (Optional) Redis added if using caching

- [ ] **Code Configuration:**
  - [ ] ✅ `medusa-config.ts` has `host` and `port` configuration (fixed in this PR)

## 🧪 Local Testing (Simulate Railway)

Test Railway configuration locally:

```bash
# 1. Set environment variables (create .env in apps/backend)
cd /home/runner/work/mercur/mercur
cp apps/backend/.env.template apps/backend/.env

# 2. Edit .env with Railway-like values
# HOST=0.0.0.0
# PORT=9000
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketplace
# ... etc

# 3. Clean build (simulate Railway build)
rm -rf apps/backend/.medusa packages/*/dist packages/modules/*/.medusa
yarn install --frozen-lockfile
yarn build

# 4. Start app (simulate Railway start)
yarn workspace api start

# 5. Test from another terminal
curl http://0.0.0.0:9000/health
# Should return: {"status":"ok"} or similar
```

## 📖 Related Documentation

- **[RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md)** - Quick reference
- **[RAILWAY_502_TROUBLESHOOTING.md](./RAILWAY_502_TROUBLESHOOTING.md)** - Detailed troubleshooting
- **[RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)** - Build failures and monorepo setup

## 🎉 Summary

**The exact Railway configuration you should use:**

1. **Build Command:**
   ```bash
   yarn install --frozen-lockfile && yarn build
   ```

2. **Start Command:**
   ```bash
   yarn workspace api start
   ```

3. **Critical Environment Variable:**
   ```bash
   HOST=0.0.0.0
   ```

4. **Workspace Name:**
   ```
   api
   ```

5. **Code Changes:** ✅ Fixed in this PR - `medusa-config.ts` now properly configures PORT and HOST

With these settings, your Railway deployment should:
- ✅ Build successfully
- ✅ Start without errors
- ✅ Listen on Railway's assigned port
- ✅ Bind to 0.0.0.0 (allows Railway proxy to reach it)
- ✅ Return 200 OK instead of 502 Bad Gateway

---

**Need Help?** See troubleshooting docs or join the [Mercur Discord community](https://discord.gg/NTWNa49S)
