# Railway Deployment Guide for Mercur Monorepo

## Problem Overview

Railway builds were failing with TypeScript errors when trying to build the `api` workspace:
```
Cannot find module '@mercurjs/framework' or its corresponding type declarations
Cannot find module '@mercurjs/b2c-core/modules/seller' or its corresponding type declarations
Cannot find module '@mercurjs/b2c-core/workflows' or its corresponding type declarations
Cannot find module '@mercurjs/commission/workflows' or its corresponding type declarations
```

## Root Cause

The issue occurs because:

1. **Monorepo structure**: This is a Yarn workspaces monorepo with multiple interdependent packages
2. **Build outputs are gitignored**: The `dist/` and `.medusa/` directories are not committed to git
3. **Railway build isolation**: When using `yarn workspace api build`, only the `api` workspace is built
4. **Dependency build order**: The workspace dependencies (`@mercurjs/framework`, `@mercurjs/b2c-core`, etc.) must be built BEFORE the `api` workspace
5. **Turbo dependency graph**: The `turbo.json` defines build dependencies with `"dependsOn": ["^build"]`, but direct workspace commands bypass Turbo

## Production-Ready Solution

### Option 1: Recommended - Use Monorepo Root (Preferred)

This is the cleanest solution that properly respects the monorepo structure.

**Railway Configuration:**
```yaml
Service: api
Root Directory: / (leave empty or set to repository root)
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn workspace api start
```

**Why this works:**
- Builds all workspace dependencies in correct order via Turbo
- Respects the dependency graph defined in `turbo.json`
- No custom scripts or workarounds needed
- Works exactly like local development

### Option 2: Alternative - Keep /apps/backend Root

If you must use `/apps/backend` as root directory (e.g., for other Railway services), you need to build from the monorepo root:

**Railway Configuration:**
```yaml
Service: api
Root Directory: /apps/backend
Build Command: cd ../.. && yarn install --frozen-lockfile && yarn build && cd apps/backend
Start Command: yarn start
```

**Why this works:**
- Changes to monorepo root to run the full build
- Returns to backend directory for start command
- Ensures all dependencies are built

### Option 3: Custom Build Script (Not Recommended)

Create a build script that handles dependency building:

**apps/backend/package.json:**
```json
{
  "scripts": {
    "build:railway": "yarn install --frozen-lockfile && cd ../.. && yarn build && cd apps/backend",
    "build": "medusa build"
  }
}
```

**Railway Configuration:**
```yaml
Build Command: yarn build:railway
Start Command: yarn start
```

**Why this is not recommended:**
- Adds complexity and maintenance burden
- Duplicates build logic
- Can drift from local development setup

## What Changed in This Fix

1. **turbo.json**: Added `.medusa/**` to build outputs to properly cache Medusa plugin builds
   ```json
   "outputs": ["dist/**", ".medusa/**"]
   ```

## Verification Checklist

Before deploying to Railway, verify locally:

### 1. Clean Build Test
```bash
# From repository root
cd /home/runner/work/mercur/mercur

# Clean all build artifacts
rm -rf apps/backend/.medusa
rm -rf packages/framework/dist
rm -rf packages/modules/*/.medusa

# Install dependencies
yarn install --frozen-lockfile

# Run full build (simulates Railway)
yarn build

# Verify build succeeded
echo $?  # Should output: 0
```

### 2. Verify Workspace Dependencies Are Built
```bash
# Check framework package
ls -la packages/framework/dist/

# Check b2c-core module
ls -la packages/modules/b2c-core/.medusa/

# Check commission module
ls -la packages/modules/commission/.medusa/

# Check api build
ls -la apps/backend/.medusa/
```

### 3. Verify Start Command Works
```bash
# From repository root
yarn workspace api start
```

### 4. Test Production Build Simulation
```bash
# Simulate Railway environment
rm -rf node_modules
rm -rf apps/backend/node_modules
rm -rf packages/*/node_modules
rm -rf packages/modules/*/node_modules

# Fresh install and build
yarn install --frozen-lockfile && yarn build

# Should complete without TypeScript errors
```

## Understanding the Monorepo Structure

```
mercur/
├── package.json (root, defines workspaces)
├── turbo.json (defines build order and caching)
├── apps/
│   └── backend/ (api workspace)
│       ├── package.json (depends on @mercurjs/*)
│       └── src/
│           └── scripts/seed/ (imports from workspace packages)
└── packages/
    ├── framework/ (builds to dist/)
    └── modules/
        ├── b2c-core/ (builds to .medusa/)
        └── commission/ (builds to .medusa/)
```

## Workspace Dependencies

The `api` workspace depends on internal packages using the `*` version:

**apps/backend/package.json:**
```json
{
  "dependencies": {
    "@mercurjs/framework": "*",
    "@mercurjs/b2c-core": "*",
    "@mercurjs/commission": "*",
    ...
  }
}
```

The `*` version means "use the local workspace version". These packages MUST be built before the `api` workspace can build successfully.

## Why `yarn workspace api build` Fails

Running `yarn workspace api build` directly:
1. Only builds the `api` workspace
2. Does NOT build `@mercurjs/framework`, `@mercurjs/b2c-core`, etc.
3. TypeScript cannot find the module exports because they haven't been built yet
4. Results in "Cannot find module" errors

Running `yarn build` (with Turbo):
1. Analyzes the dependency graph from `turbo.json`
2. Builds `@mercurjs/framework` first (no dependencies)
3. Builds `@mercurjs/b2c-core`, `@mercurjs/commission`, etc. (depend on framework)
4. Finally builds `api` (depends on all the above)
5. Everything works correctly

## Medusa Plugin Build System

Medusa plugins (like `@mercurjs/b2c-core`) use a special build system:
- Build command: `medusa plugin:build`
- Outputs to: `.medusa/server/src/`
- Exports defined in `package.json` point to `.medusa/server/` files

## Common Pitfalls to Avoid

1. **Don't modify package versions**: Keep `@mercurjs/*` dependencies as `"*"` to use local workspace versions
2. **Don't add workspace packages to devDependencies in api**: They should be in `dependencies` if used in production code
3. **Don't exclude seed scripts from build**: If seed scripts import workspace packages, they need those packages built
4. **Don't use `--production` flag**: This skips devDependencies which includes build tools
5. **Don't silence TypeScript errors**: Fix the root cause instead

## Alternative: Excluding Seed Scripts (Not Recommended)

If you wanted to exclude seed scripts from the production build entirely (NOT RECOMMENDED for this codebase):

**apps/backend/tsconfig.json:**
```json
{
  "exclude": [
    "node_modules",
    ".medusa/server",
    ".medusa/admin",
    ".cache",
    "src/scripts"  // Add this
  ]
}
```

**Why this is NOT recommended here:**
- Seed scripts are executed via `medusa exec` which requires them to be compiled
- The `yarn seed` command needs the TypeScript code compiled to JavaScript
- Excluding them would break the seed functionality

## Support

If you encounter issues:
1. Check that Railway is using the correct build command
2. Verify the root directory setting
3. Review Railway build logs for the actual error
4. Test the exact build sequence locally first
5. Join the [Mercur Discord community](https://discord.gg/NTWNa49S) for support

## Summary

✅ **DO:** Use `yarn build` to build all workspace dependencies  
✅ **DO:** Set Railway root to monorepo root  
✅ **DO:** Test locally with clean builds  
✅ **DO:** Use `--frozen-lockfile` for production builds  

❌ **DON'T:** Use `yarn workspace api build` for production  
❌ **DON'T:** Change workspace dependency versions  
❌ **DON'T:** Exclude scripts that are used at runtime  
❌ **DON'T:** Silence TypeScript errors  
