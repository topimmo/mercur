import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { SELLER_MODULE, SellerModuleService } from "../../../../../modules/seller";
import { fetchSellerByAuthActorId } from "../../../../../shared/infra/http/utils/seller";
import { updateSellerWorkflow } from "../../../../../workflows/seller/workflows";
import { VendorSetLocationInputType } from "./validators";

/**
 * @oas [put] /vendor/sellers/me/location
 * operationId: "VendorSetSellerLocation"
 * summary: "Set Own Seller Location"
 * description: "Sets the city and neighborhood for the authenticated seller. Validates that the neighborhood belongs to the city."
 * x-authenticated: true
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
 *   - Vendor Sellers
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const PUT = async (
  req: AuthenticatedMedusaRequest<VendorSetLocationInputType>,
  res: MedusaResponse
) => {
  const sellerModuleService: SellerModuleService = req.scope.resolve(SELLER_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { id } = await fetchSellerByAuthActorId(
    req.auth_context.actor_id,
    req.scope
  );

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
