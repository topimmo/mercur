import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { SELLER_MODULE, SellerModuleService } from "../../../modules/seller";
import { AdminCreateNeighborhoodType } from "./validators";

/**
 * @oas [get] /admin/neighborhoods
 * operationId: "AdminListNeighborhoods"
 * summary: "List Neighborhoods"
 * description: "Retrieves a list of neighborhoods."
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
 *             neighborhoods:
 *               type: array
 *             count:
 *               type: integer
 *             offset:
 *               type: integer
 *             limit:
 *               type: integer
 * tags:
 *   - Admin Neighborhoods
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: neighborhoods, metadata } = await query.graph({
    entity: "neighborhood",
    fields: req.queryConfig.fields,
    pagination: req.queryConfig.pagination,
  });

  res.json({
    neighborhoods,
    count: metadata?.count ?? 0,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  });
}

/**
 * @oas [post] /admin/neighborhoods
 * operationId: "AdminCreateNeighborhood"
 * summary: "Create Neighborhood"
 * description: "Creates a new neighborhood."
 * x-authenticated: true
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required:
 *           - name
 *           - city_id
 *         properties:
 *           name:
 *             type: string
 *             description: The name of the neighborhood.
 *           city_id:
 *             type: string
 *             description: The ID of the city this neighborhood belongs to.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             neighborhood:
 *               type: object
 * tags:
 *   - Admin Neighborhoods
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (
  req: MedusaRequest<AdminCreateNeighborhoodType>,
  res: MedusaResponse
) => {
  const sellerModuleService = req.scope.resolve<SellerModuleService>(SELLER_MODULE);

  // Validate city exists
  try {
    await sellerModuleService.retrieveCity(req.validatedBody.city_id);
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `City with ID ${req.validatedBody.city_id} not found`
    );
  }

  const neighborhood = await sellerModuleService.createNeighborhoods(
    req.validatedBody
  );

  res.json({ neighborhood });
};
