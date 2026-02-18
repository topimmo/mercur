import { defineConfig, loadEnv } from '@medusajs/framework/utils'
import { parseDbConnectionInfo, formatDbConnectionInfo } from './src/utils/db-connection-info'

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

// Log database connection info at startup (safe - no credentials)
const dbInfo = parseDbConnectionInfo(process.env.DATABASE_URL, process.env.NODE_ENV)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔌 Database Connection Info:')
console.log('   ' + formatDbConnectionInfo(dbInfo))
console.log('   Pool: min=' + poolMin + ', max=' + poolMax)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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
      ...(process.env.NODE_ENV === 'production' ? {
        connection: { 
          ssl: {
            rejectUnauthorized: false
          }
        }
      } : {})
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,

      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
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
