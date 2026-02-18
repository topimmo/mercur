/**
 * Utility to safely extract database connection information from DATABASE_URL
 * without exposing credentials
 */

interface DbConnectionInfo {
  host: string
  port: string
  database: string
  sslEnabled: boolean
}

/**
 * Parse DATABASE_URL and extract safe connection information
 * @param databaseUrl - The database connection URL
 * @param nodeEnv - The NODE_ENV to determine SSL settings
 * @returns Safe connection information without credentials
 */
export function parseDbConnectionInfo(
  databaseUrl: string | undefined,
  nodeEnv: string | undefined
): DbConnectionInfo | null {
  if (!databaseUrl) {
    return null
  }

  try {
    const url = new URL(databaseUrl)
    
    return {
      host: url.hostname,
      port: url.port || '5432', // Default PostgreSQL port
      database: url.pathname.slice(1), // Remove leading slash
      sslEnabled: nodeEnv === 'production'
    }
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error)
    return null
  }
}

/**
 * Format database connection info for logging
 * @param info - Database connection information
 * @returns Formatted string for logging
 */
export function formatDbConnectionInfo(info: DbConnectionInfo | null): string {
  if (!info) {
    return 'Database connection info not available'
  }

  return `Database: ${info.database} | Host: ${info.host}:${info.port} | SSL: ${info.sslEnabled ? 'enabled' : 'disabled'}`
}
