import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { parseDbConnectionInfo, formatDbConnectionInfo } from '../../utils/db-connection-info'

/**
 * @oas [get] /health
 * operationId: "GetHealth"
 * summary: "Health Check"
 * description: "Check the health status of the API and database connectivity"
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: Overall health status
 *             database:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   description: Database connection status
 *                 info:
 *                   type: string
 *                   description: Database connection information (safe - no credentials)
 *   "503":
 *     description: Service Unavailable
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             error:
 *               type: string
 * tags:
 *   - Health
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let dbConnected = false
  let dbError: string | null = null

  try {
    // Try to query the database to verify connection
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // Simple query to check database connectivity
    await query.graph({
      entity: 'region',
      fields: ['id'],
      pagination: { take: 1 }
    })
    
    dbConnected = true
  } catch (error) {
    dbConnected = false
    dbError = error instanceof Error ? error.message : 'Unknown error'
  }

  const dbInfo = parseDbConnectionInfo(process.env.DATABASE_URL, process.env.NODE_ENV)

  if (dbConnected) {
    res.status(200).json({
      status: 'ok',
      database: {
        connected: true,
        info: formatDbConnectionInfo(dbInfo)
      }
    })
  } else {
    res.status(503).json({
      status: 'error',
      database: {
        connected: false,
        info: formatDbConnectionInfo(dbInfo),
        error: dbError
      }
    })
  }
}
