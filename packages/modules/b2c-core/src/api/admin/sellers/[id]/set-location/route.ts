import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { SELLER_MODULE, SellerModuleService } from "../../../../../modules/seller";
import { updateSellerWorkflow } from "../../../../../workflows/seller/workflows";
import { AdminSetSellerLocationType } from "./validators";

/**
 * @oas [post] /admin/sellers/{id}/set-location
 * operationId: "AdminSetSellerLocation"
 * summary: "Set Seller Location"
 * description: "Sets the city and neighborhood for a seller. Validates that the neighborhood belongs to the city."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     description: The ID of the seller.
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           city_id:
 *             type: string
 *             nullable: true
 *             description: The ID of the city. Required if neighborhood_id is provided.
 *           neighborhood_id:
 *             type: string
 *             nullable: true
 *             description: The ID of the neighborhood.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             seller:
 *               type: object
 * tags:
 *   - Admin Sellers
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (
  req: MedusaRequest<AdminSetSellerLocationType>,
  res: MedusaResponse
) => {
  const sellerModuleService = req.scope.resolve<SellerModuleService>(SELLER_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;
  const { city_id, neighborhood_id } = req.validatedBody;

  // Validate neighborhood belongs to city if both are provided
  if (neighborhood_id && city_id) {
    const neighborhood = await sellerModuleService.retrieveNeighborhood(
      neighborhood_id
    );

    if (neighborhood.city_id !== city_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Neighborhood ${neighborhood_id} does not belong to city ${city_id}`
      );
    }
  }

  // Update seller location
  await updateSellerWorkflow(req.scope).run({
    input: {
      id,
      city_id,
      neighborhood_id,
    },
  });

  const {
    data: [seller],
  } = await query.graph({
    entity: "seller",
    fields: req.queryConfig.fields,
    filters: { id },
  });

  res.json({ seller });
};
