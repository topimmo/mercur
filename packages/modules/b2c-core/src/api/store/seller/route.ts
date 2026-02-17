import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * @oas [get] /store/seller
 * operationId: "StoreGetSellers"
 * summary: "Get sellers"
 * description: "Retrieves the seller list. Only returns sellers with approved=true AND subscription_status=ACTIVE."
 * parameters:
 *   - name: offset
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to skip before starting to collect the result set.
 *   - name: limit
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to return.
 *   - name: city_id
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: Filter sellers by city ID.
 *   - name: neighborhood_id
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: Filter sellers by neighborhood ID.
 *   - name: fields
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: Comma-separated fields to include in the response.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             products:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/StoreSeller"
 *             count:
 *               type: integer
 *               description: The total number of items available
 *             offset:
 *               type: integer
 *               description: The number of items skipped before these items
 *             limit:
 *               type: integer
 *               description: The number of items per page
 * tags:
 *   - Store Sellers
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Build filters
  const filters: any = {
    approved: true,
    subscription_status: 'ACTIVE',
  }

  // Add location filters if provided
  if (req.validatedQuery?.city_id) {
    filters.city_id = req.validatedQuery.city_id
  }

  if (req.validatedQuery?.neighborhood_id) {
    filters.neighborhood_id = req.validatedQuery.neighborhood_id
  }

  const { data: sellers, metadata } = await query.graph({
    entity: 'seller',
    fields: req.queryConfig.fields,
    filters,
    pagination: req.queryConfig.pagination
  })

  res.json({
    sellers,
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take
  })
}
