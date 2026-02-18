# Railway Deployment Analysis - Mercur Monorepo

## Executive Summary

This document provides the **exact** answers to Railway deployment configuration questions based on analyzing the actual repository files.

---

## 1. What is the exact workspace name of the backend service?

**Answer: `api`**

**Source:** `/home/runner/work/mercur/mercur/apps/backend/package.json`

```json
{
  "name": "api",
  "version": "0.0.1",
  "description": "A starter for Medusa projects.",
  ...
}
```

The backend workspace is named `api` (not `backend`). While the directory is `apps/backend/`, the package name in package.json is `api`.

---

## 2. Does the backend have a "build" script? If yes, what is the correct build command?

**Answer: Yes, the backend has a "build" script.**

**Source:** `/home/runner/work/mercur/mercur/apps/backend/package.json`

```json
{
  "scripts": {
    "build": "medusa build",
    "build:symlink": "medusa build && ln -s .medusa/server/public/ public",
    "build:windows": "medusa build && node -e \"const fs=require('fs');const path=require('path');const target='.medusa/server/public/';const link='public';try{if(fs.existsSync(link))fs.rmSync(link,{recursive:true,force:true});fs.symlinkSync(target,link,process.platform==='win32'?'junction':'dir');console.log('✔ Symlink created:',link,'→',target);}catch(e){console.error('✖ Failed to create symlink:',e.message);process.exit(1);}\"",
    ...
  }
}
```

The backend build script is:
- **Script name:** `build`
- **Command:** `medusa build`
- **Output directory:** `.medusa/`

---

## 3. What is the correct start command to run the backend in production?

**Answer:** `medusa start --types=false`

**Source:** `/home/runner/work/mercur/mercur/apps/backend/package.json`

```json
{
  "scripts": {
    "start": "medusa start --types=false",
    "dev": "medusa develop --types=false",
    ...
  }
}
```

The production start command is:
- **Script name:** `start`
- **Command:** `medusa start --types=false`
- **Note:** The `--types=false` flag skips type generation which is appropriate for production

---

## 4. What should be the exact Railway configuration?

### ⚠️ Critical Understanding: This is a Yarn Workspaces Monorepo

The repository uses:
- **Yarn Workspaces** to manage multiple packages
- **Turbo** to orchestrate builds across workspace dependencies
- **Internal workspace dependencies** (`@mercurjs/*`) that must be built BEFORE the backend

**Workspace structure:**
```
mercur/
├── package.json (root workspace configuration)
├── turbo.json (build orchestration)
├── apps/
│   └── backend/ (workspace name: "api")
└── packages/
    ├── framework/ (workspace dependency: @mercurjs/framework)
    └── modules/ (workspace dependencies: @mercurjs/*)
```

**Dependency chain:**
```
@mercurjs/framework (no deps)
    ↓
@mercurjs/b2c-core, @mercurjs/commission, etc. (depend on framework)
    ↓
api (depends on all @mercurjs/* packages)
```

### ✅ Correct Railway Configuration

Railway MUST run from the repository root to access all workspace packages:

```yaml
Service Name: api
Root Directory: / (leave empty, defaults to repository root)
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn workspace api start
```

### Explanation:

**Build Command:** `yarn install --frozen-lockfile && yarn build`
- `yarn install --frozen-lockfile` - Installs all dependencies deterministically
- `yarn build` - Executes the root workspace's build script which runs `turbo run build`
- Turbo analyzes `turbo.json` and builds packages in dependency order:
  1. First: `@mercurjs/framework`
  2. Second: `@mercurjs/b2c-core`, `@mercurjs/commission`, etc.
  3. Finally: `api` (backend)

**Start Command:** `yarn workspace api start`
- Runs the `start` script from the `api` workspace (apps/backend)
- Executes: `medusa start --types=false`
- Must be run from repository root since Railway's root directory is `/`

---

## ❌ Why Other Configurations Fail

### ❌ Configuration 1: Using `yarn workspace api build`
```yaml
Root Directory: /
Build Command: yarn workspace api build  # ❌ WRONG
Start Command: yarn workspace api start
```

**Why it fails:**
- Only builds the `api` workspace, skipping dependencies
- TypeScript errors: "Cannot find module '@mercurjs/framework'"
- Workspace dependencies are not built

### ❌ Configuration 2: Using `/apps/backend` as root
```yaml
Root Directory: /apps/backend  # ❌ WRONG
Build Command: yarn build
Start Command: yarn start
```

**Why it fails:**
- Isolates the build from the monorepo structure
- Cannot access workspace packages in `packages/`
- yarn.lock is at repository root, not in `/apps/backend`

---

## Verification Steps

From the repository root, verify the commands work:

### 1. Clean build test:
```bash
# Clean all build artifacts
rm -rf apps/backend/.medusa packages/framework/dist packages/modules/*/.medusa

# Test the exact Railway build command
yarn install --frozen-lockfile && yarn build

# Should complete without TypeScript errors ✅
```

### 2. Test start command:
```bash
# Test the exact Railway start command
yarn workspace api start

# Should start the Medusa server ✅
```

---

## Supporting Documentation

The repository already contains comprehensive Railway deployment documentation:

1. **[RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md)** - Quick reference with correct configuration
2. **[RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)** - Detailed explanation of build failures and monorepo setup
3. **[RAILWAY_502_TROUBLESHOOTING.md](./RAILWAY_502_TROUBLESHOOTING.md)** - Runtime errors and 502 issues

---

## Final Answer Summary

| Question | Answer |
|----------|--------|
| **1. Backend workspace name** | `api` |
| **2. Backend build script** | Yes: `medusa build` |
| **3. Backend start command** | `medusa start --types=false` |
| **4a. Railway Build Command** | `yarn install --frozen-lockfile && yarn build` |
| **4b. Railway Start Command** | `yarn workspace api start` |
| **4c. Railway Root Directory** | `/` (repository root, leave empty) |

---

## Next Steps

1. ✅ Update Railway service configuration with the correct settings above
2. ✅ Ensure Root Directory is set to `/` (or left empty)
3. ✅ Set Build Command to: `yarn install --frozen-lockfile && yarn build`
4. ✅ Set Start Command to: `yarn workspace api start`
5. ✅ Trigger a new deployment
6. ✅ Verify build succeeds in Railway logs

---

**Generated:** 2026-02-18  
**Repository:** topimmo/mercur  
**Purpose:** Railway deployment configuration analysis
