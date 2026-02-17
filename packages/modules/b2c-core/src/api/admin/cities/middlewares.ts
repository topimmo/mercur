import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import {
  AdminCityParams,
  AdminCreateCity,
  AdminUpdateCity,
} from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/cities",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminCityParams)],
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
