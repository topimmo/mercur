import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import {
  AdminCreateNeighborhood,
  AdminNeighborhoodParams,
  AdminUpdateNeighborhood,
} from "./validators";
import { adminNeighborhoodQueryConfig } from "./query-config";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/neighborhoods",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminNeighborhoodParams, adminNeighborhoodQueryConfig.list)],
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
