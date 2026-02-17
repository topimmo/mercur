import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
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
