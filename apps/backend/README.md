# Mercur Backend

Marketplace backend for Mercur.

## Prerequisites

- Node.js v20+
- PostgreSQL
- Git CLI

## Scripts

- `yarn build` - Build the backend
- `yarn seed` - Seed the database
- `yarn start` - Start the backend
- `yarn dev` - Start the backend in development mode
- `yarn db:migrate` - Run migrations and module links
- `yarn test:integration:http` - Run API integration tests
- `yarn test:integration:modules` - Run module integration tests
- `yarn test:unit` - Run unit tests
- `yarn format` - Format the code
- `yarn lint` - Lint the code
- `yarn lint:fix` - Fix lint errors
- `yarn generate:oas` - Generate OpenAPI specification

## Deployment

### Railway Deployment

**Important**: This is a monorepo project. You must build from the repository root, not from `/apps/backend`.

**Railway Configuration:**
```yaml
Root Directory: (leave empty - use repository root)
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn workspace api start
```

**Why?** The `api` workspace depends on internal packages (`@mercurjs/framework`, `@mercurjs/b2c-core`, etc.) that must be built first. Using `yarn build` from the monorepo root ensures all dependencies are built in the correct order via Turbo.

See [RAILWAY_CONFIG.md](../../RAILWAY_CONFIG.md) for quick reference or [RAILWAY_DEPLOYMENT_GUIDE.md](../../RAILWAY_DEPLOYMENT_GUIDE.md) for detailed documentation.

### Local Production Build Test

```bash
# From repository root
cd ../..

# Clean build artifacts
rm -rf apps/backend/.medusa packages/framework/dist packages/modules/*/.medusa

# Test production build
yarn install --frozen-lockfile && yarn build

# Verify no TypeScript errors
# Should output: "Tasks: 10 successful, 10 total"
```
