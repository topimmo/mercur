import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * @oas [get] /store/cities
 * operationId: "StoreGetCities"
 * summary: "List Cities"
 * description: "Retrieves a list of cities available in the store."
 * parameters:
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
 *             cities:
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

  const { data: cities, metadata } = await query.graph({
    entity: "city",
    fields: req.queryConfig.fields,
    pagination: req.queryConfig.pagination,
  });

  res.json({
    cities,
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take,
  });
};
