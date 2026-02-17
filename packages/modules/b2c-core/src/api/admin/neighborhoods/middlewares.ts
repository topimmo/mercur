import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import {
  AdminCreateNeighborhood,
  AdminNeighborhoodParams,
  AdminUpdateNeighborhood,
} from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/neighborhoods",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminNeighborhoodParams)],
    },
    {
      matcher: "/admin/neighborhoods",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateNeighborhood)],
    },
    {
      matcher: "/admin/neighborhoods/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateNeighborhood)],
    },
  ],
});
