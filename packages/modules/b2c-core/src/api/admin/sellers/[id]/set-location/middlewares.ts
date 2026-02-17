import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
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
