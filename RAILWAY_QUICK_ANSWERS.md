# Railway Deployment - Quick Answers

> **📋 Quick reference for Railway deployment configuration**
> 
> For detailed explanation, see [RAILWAY_DEPLOYMENT_ANALYSIS.md](./RAILWAY_DEPLOYMENT_ANALYSIS.md)

---

## Questions & Answers

### 1️⃣ What is the exact workspace name of the backend service?

```
api
```

*(Located in `apps/backend/package.json` → `"name": "api"`)*

---

### 2️⃣ Does the backend have a "build" script? What is the correct build command?

✅ **Yes, it has a build script**

```bash
medusa build
```

*(Located in `apps/backend/package.json` → `"scripts": { "build": "medusa build" }`)*

---

### 3️⃣ What is the correct start command to run the backend in production?

```bash
medusa start --types=false
```

*(Located in `apps/backend/package.json` → `"scripts": { "start": "medusa start --types=false" }`)*

---

### 4️⃣ What should be the exact Railway configuration?

## 🚀 Railway Service Configuration

```yaml
Service Name: api
Root Directory: (leave empty or "/")
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn workspace api start
```

### Copy-Paste Format:

**Root Directory:**
```
/
```
*(Or leave empty - both work)*

**Build Command:**
```
yarn install --frozen-lockfile && yarn build
```

**Start Command:**
```
yarn workspace api start
```

---

## 🔍 Why These Commands?

| Command | Purpose |
|---------|---------|
| `yarn install --frozen-lockfile` | Install dependencies deterministically (production-ready) |
| `yarn build` | Runs `turbo run build` which builds ALL workspace packages in dependency order |
| `yarn workspace api start` | Runs the `start` script from the `api` workspace (apps/backend) |

---

## ⚠️ Common Mistakes to Avoid

❌ **DON'T use:** `yarn workspace api build` (skips workspace dependencies)  
❌ **DON'T set Root Directory to:** `/apps/backend` (isolates from monorepo)  
❌ **DON'T use:** `cd apps/backend && yarn build` (wrong context)

✅ **DO use:** Commands above from repository root `/`

---

## 📊 Build Order (Automatic via Turbo)

```
Step 1: @mercurjs/framework
   ↓
Step 2: @mercurjs/b2c-core, @mercurjs/commission, etc.
   ↓
Step 3: api (backend)
```

This happens automatically when you run `yarn build` from root.

---

## 🧪 Local Testing

Test the exact Railway commands:

```bash
# From repository root
cd /home/runner/work/mercur/mercur

# Clean build
rm -rf apps/backend/.medusa packages/framework/dist packages/modules/*/.medusa

# Test build command (simulates Railway)
yarn install --frozen-lockfile && yarn build

# Test start command
yarn workspace api start
```

---

## 📚 Related Documentation

- **[RAILWAY_DEPLOYMENT_ANALYSIS.md](./RAILWAY_DEPLOYMENT_ANALYSIS.md)** - Complete analysis with detailed explanations
- **[RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md)** - Configuration quick reference
- **[RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)** - Build failures and monorepo setup
- **[RAILWAY_502_TROUBLESHOOTING.md](./RAILWAY_502_TROUBLESHOOTING.md)** - Runtime errors and 502 issues

---

**Last Updated:** 2026-02-18  
**Status:** ✅ Verified and tested
