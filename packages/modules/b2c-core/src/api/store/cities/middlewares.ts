import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
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
