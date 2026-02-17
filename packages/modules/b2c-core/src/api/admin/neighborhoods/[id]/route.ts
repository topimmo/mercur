import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { SELLER_MODULE, SellerModuleService } from "../../../../modules/seller";
import { AdminUpdateNeighborhoodType } from "../validators";

/**
 * @oas [get] /admin/neighborhoods/{id}
 * operationId: "AdminGetNeighborhood"
 * summary: "Get Neighborhood"
 * description: "Retrieves a specific neighborhood by its ID."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
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
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [neighborhood],
  } = await query.graph(
    {
      entity: "neighborhood",
      fields: req.queryConfig.fields,
      filters: {
        id: req.params.id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ neighborhood });
}

/**
 * @oas [post] /admin/neighborhoods/{id}
 * operationId: "AdminUpdateNeighborhood"
 * summary: "Update Neighborhood"
 * description: "Updates an existing neighborhood."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           city_id:
 *             type: string
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
  req: MedusaRequest<AdminUpdateNeighborhoodType>,
  res: MedusaResponse
) => {
  const sellerModuleService = req.scope.resolve<SellerModuleService>(SELLER_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Validate city exists if city_id is provided
  if (req.validatedBody.city_id) {
    try {
      await sellerModuleService.retrieveCity(req.validatedBody.city_id);
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `City with ID ${req.validatedBody.city_id} not found`
      );
    }
  }

  await sellerModuleService.updateNeighborhoods({
    id: req.params.id,
    ...req.validatedBody,
  });

  const {
    data: [neighborhood],
  } = await query.graph({
    entity: "neighborhood",
    fields: req.queryConfig.fields,
    filters: { id: req.params.id },
  });

  res.json({ neighborhood });
};

/**
 * @oas [delete] /admin/neighborhoods/{id}
 * operationId: "AdminDeleteNeighborhood"
 * summary: "Delete Neighborhood"
 * description: "Deletes a neighborhood."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             deleted:
 *               type: boolean
 * tags:
 *   - Admin Neighborhoods
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const sellerModuleService = req.scope.resolve<SellerModuleService>(SELLER_MODULE);

  await sellerModuleService.softDeleteNeighborhoods(req.params.id);

  res.json({
    id: req.params.id,
    deleted: true,
  });
};
