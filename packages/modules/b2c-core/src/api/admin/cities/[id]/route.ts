import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { SELLER_MODULE } from "../../../../modules/seller";
import { AdminUpdateCityType } from "../validators";

/**
 * @oas [get] /admin/cities/{id}
 * operationId: "AdminGetCity"
 * summary: "Get City"
 * description: "Retrieves a specific city by its ID."
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
 *             city:
 *               type: object
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

  const {
    data: [city],
  } = await query.graph(
    {
      entity: "city",
      fields: req.queryConfig.fields,
      filters: {
        id: req.params.id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ city });
}

/**
 * @oas [post] /admin/cities/{id}
 * operationId: "AdminUpdateCity"
 * summary: "Update City"
 * description: "Updates an existing city."
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
  req: MedusaRequest<AdminUpdateCityType>,
  res: MedusaResponse
) => {
  const sellerModuleService = req.scope.resolve(SELLER_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await sellerModuleService.updateCities({
    id: req.params.id,
    ...req.validatedBody,
  });

  const {
    data: [city],
  } = await query.graph({
    entity: "city",
    fields: req.queryConfig.fields,
    filters: { id: req.params.id },
  });

  res.json({ city });
};

/**
 * @oas [delete] /admin/cities/{id}
 * operationId: "AdminDeleteCity"
 * summary: "Delete City"
 * description: "Deletes a city."
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
 *   - Admin Cities
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const sellerModuleService = req.scope.resolve(SELLER_MODULE);

  await sellerModuleService.softDeleteCities(req.params.id);

  res.json({
    id: req.params.id,
    deleted: true,
  });
};
