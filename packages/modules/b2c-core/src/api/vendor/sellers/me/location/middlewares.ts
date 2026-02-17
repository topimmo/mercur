import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { VendorSetLocationInput } from "./validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/sellers/me/location",
      method: "PUT",
      middlewares: [validateAndTransformBody(VendorSetLocationInput)],
    },
  ],
});
