import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { SELLER_MODULE } from "../../../modules/seller";
import { AdminCreateCityType } from "./validators";

/**
 * @oas [get] /admin/cities
 * operationId: "AdminListCities"
 * summary: "List Cities"
 * description: "Retrieves a list of cities."
 * x-authenticated: true
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
 *   - Admin Cities
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: cities, metadata } = await query.graph({
    entity: "city",
    fields: req.queryConfig.fields,
    pagination: req.queryConfig.pagination,
  });

  res.json({
    cities,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
}

/**
 * @oas [post] /admin/cities
 * operationId: "AdminCreateCity"
 * summary: "Create City"
 * description: "Creates a new city."
 * x-authenticated: true
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required:
 *           - name
 *         properties:
 *           name:
 *             type: string
 *             description: The name of the city.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             city:
 *               type: object
 * tags:
 *   - Admin Cities
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (
  req: MedusaRequest<AdminCreateCityType>,
  res: MedusaResponse
) => {
  const sellerModuleService = req.scope.resolve(SELLER_MODULE);

  const city = await sellerModuleService.createCities(req.validatedBody);

  res.json({ city });
};
