import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * @oas [get] /store/cities/{id}/neighborhoods
 * operationId: "StoreGetCityNeighborhoods"
 * summary: "List Neighborhoods for City"
 * description: "Retrieves a list of neighborhoods for a specific city."
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     description: The ID of the city.
 *   - name: offset
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *   - name: limit
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             neighborhoods:
 *               type: array
 *             count:
 *               type: integer
 *             offset:
 *               type: integer
 *             limit:
 *               type: integer
 * tags:
 *   - Store Cities
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: neighborhoods, metadata } = await query.graph({
    entity: "neighborhood",
    fields: req.queryConfig.fields,
    filters: {
      city_id: req.params.id,
    },
    pagination: req.queryConfig.pagination,
  });

  res.json({
    neighborhoods,
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take,
  });
};
