import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import {
  AdminCityParams,
  AdminCreateCity,
  AdminUpdateCity,
} from "./validators";
import { adminCityQueryConfig } from "./query-config";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/cities",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminCityParams, adminCityQueryConfig.list)],
    },
    {
      matcher: "/admin/cities",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateCity)],
    },
    {
      matcher: "/admin/cities/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateCity)],
    },
  ],
});
