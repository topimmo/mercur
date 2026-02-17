import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework";
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
