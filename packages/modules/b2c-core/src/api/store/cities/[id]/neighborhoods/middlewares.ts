import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import { StoreNeighborhoodParams } from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/cities/:id/neighborhoods",
      method: "GET",
      middlewares: [validateAndTransformQuery(StoreNeighborhoodParams)],
    },
  ],
});
