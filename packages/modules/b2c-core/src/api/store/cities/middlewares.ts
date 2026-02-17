import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework";
import { StoreCityParams } from "./validators";
import { storeCityQueryConfig } from "./query-config";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/cities",
      method: "GET",
      middlewares: [validateAndTransformQuery(StoreCityParams, storeCityQueryConfig.list)],
    },
  ],
});
