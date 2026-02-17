import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework";
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
