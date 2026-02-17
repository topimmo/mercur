import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework";
import { StoreCityParams } from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/cities",
      method: "GET",
      middlewares: [validateAndTransformQuery(StoreCityParams)],
    },
  ],
});
