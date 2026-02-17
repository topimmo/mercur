# Railway Configuration Quick Reference

## ✅ Correct Configuration

### Service Settings
```
Service Name: api
Root Directory: (leave empty or "/")
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn workspace api start
```

## 🔴 Incorrect Configuration (Current - Causes Build Failure)

### Current Settings That Fail
```
Service Name: api
Root Directory: /apps/backend
Build Command: yarn workspace api build
Start Command: yarn workspace api start
```

### Why This Fails
- Root directory `/apps/backend` isolates the build from the monorepo
- `yarn workspace api build` doesn't build workspace dependencies
- TypeScript can't find `@mercurjs/*` modules because they haven't been built yet

## 🎯 What the Fix Does

1. **Uses monorepo root**: Gives access to all workspace packages
2. **Builds all dependencies**: `yarn build` uses Turbo to build in correct order
3. **Respects dependency graph**: Framework → Modules → API
4. **Production-ready**: Uses `--frozen-lockfile` for deterministic builds

## 📊 Build Order (via Turbo)

```
Step 1: @mercurjs/framework (no dependencies)
         ↓
Step 2: @mercurjs/b2c-core, @mercurjs/commission, etc. (depend on framework)
         ↓
Step 3: api (depends on all workspace packages)
```

## 🧪 Local Testing

```bash
# Clean everything
rm -rf apps/backend/.medusa packages/framework/dist packages/modules/*/.medusa

# Test the Railway build command
yarn install --frozen-lockfile && yarn build

# Should complete without TypeScript errors ✅
```

## 📝 See Full Documentation

For detailed explanation, alternatives, and troubleshooting, see [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)

## 🚀 Next Steps

1. Update Railway service configuration with the correct settings above
2. Trigger a new deployment
3. Verify build succeeds in Railway logs

---

**Need Help?** Join [Mercur Discord](https://discord.gg/NTWNa49S)
