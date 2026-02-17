import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework";
import { AdminSetSellerLocation } from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/sellers/:id/set-location",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSetSellerLocation)],
    },
  ],
});
