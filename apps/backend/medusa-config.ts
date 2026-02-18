import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Database pool configuration with validation
const poolMin = parseInt(process.env.DB_POOL_MIN || '0', 10)
const poolMax = parseInt(process.env.DB_POOL_MAX || '5', 10)

// Validate parsed values are numbers
if (isNaN(poolMin)) {
  throw new Error(
    `DB_POOL_MIN must be a valid number, got: ${process.env.DB_POOL_MIN}`
  )
}
if (isNaN(poolMax)) {
  throw new Error(
    `DB_POOL_MAX must be a valid number, got: ${process.env.DB_POOL_MAX}`
  )
}

// Ensure min is not greater than max
if (poolMin > poolMax) {
  throw new Error(
    `DB_POOL_MIN (${poolMin}) cannot be greater than DB_POOL_MAX (${poolMax})`
  )
}

// Determine if SSL should be enabled for database connection
// Enable SSL for Railway, Heroku, AWS RDS, and other cloud providers
// Also enable in production or when DATABASE_SSL env var is explicitly set
const requiresSsl = (() => {
  // Explicit SSL configuration takes precedence
  if (process.env.DATABASE_SSL === 'true') return true
  
  // Detect Railway environment using Railway-specific environment variables
  // Railway Postgres (including private URLs) require SSL
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    return true
  }
  
  // Enable SSL in production environments
  if (process.env.NODE_ENV === 'production') return true
  
  // Auto-detect cloud providers from DATABASE_URL hostname
  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL)
      const hostname = dbUrl.hostname.toLowerCase()
      
      return (
        hostname.endsWith('.railway.app') ||
        hostname.endsWith('.railway.internal') ||
        hostname.endsWith('.herokuapp.com') ||
        hostname.endsWith('.rds.amazonaws.com') ||
        hostname.endsWith('.postgres.database.azure.com') ||
        hostname.endsWith('.supabase.co')
      )
    } catch (error) {
      // If URL parsing fails, fall back to production check only
      console.warn('Failed to parse DATABASE_URL for SSL detection, falling back to non-SSL mode:', error)
      return false
    }
  }
  
  return false
})()

module.exports = defineConfig({
  admin: {
    disable: true // Disable built-in admin - using separate admin-panel container
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: poolMin,
        max: poolMax,
        acquireTimeoutMillis: 60000
      },
      ...(requiresSsl ? {
        connection: {
          ssl: {
            rejectUnauthorized: false
          }
        }
      } : {})
    },
    http: {
      port: parseInt(process.env.PORT || '9000', 10),
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      // @ts-expect-error: vendorCors is a custom extension used by @mercurjs/b2c-core
      vendorCors: process.env.VENDOR_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret'
    }
  },
  plugins: [
    {
      resolve: '@mercurjs/b2c-core',
      options: {}
    },
    {
      resolve: '@mercurjs/commission',
      options: {}
    },
    {
      resolve: '@mercurjs/algolia',
      options: {
        apiKey: process.env.ALGOLIA_API_KEY,
        appId: process.env.ALGOLIA_APP_ID
      }
    },
    {
      resolve: '@mercurjs/reviews',
      options: {}
    },
    {
      resolve: '@mercurjs/requests',
      options: {}
    },
    {
      resolve: '@mercurjs/resend',
      options: {}
    }
  ],
  modules: [
    ...(process.env.S3_ACCESS_KEY_ID
      ? [
          {
            resolve: "@medusajs/medusa/file",
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/file-s3',
                  id: 's3',
                  options: {
                    file_url: process.env.S3_FILE_URL,
                    access_key_id: process.env.S3_ACCESS_KEY_ID,
                    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                    region: process.env.S3_REGION,
                    bucket: process.env.S3_BUCKET,
                    endpoint: process.env.S3_ENDPOINT
                  }
                }
              ]
            }
          }
        ]
      : []),
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve:
              '@mercurjs/payment-stripe-connect/providers/stripe-connect',
            id: 'stripe-connect',
            options: {
              apiKey: process.env.STRIPE_SECRET_API_KEY
            }
          }
        ]
      }
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@mercurjs/resend/providers/resend',
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL
            }
          },
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              channels: ['feed', 'seller_feed']
            }
          }
        ]
      }
    },
    {
      resolve: '@medusajs/index'
    }
  ]
})
