import { MiddlewareRoute, authenticate } from "@medusajs/framework";

// Disabled for directory-only mode
// import { storeCartsMiddlewares } from "./carts/middlewares";
// import { storeOrderSetMiddlewares } from "./order-set/middlewares";
import { storeProductsMiddlewares } from "./products/middlewares";
// Disabled for directory-only mode
// import { storeReturnsMiddlewares } from "./returns/middlewares";
import { storeSellerMiddlewares } from "./seller/middlewares";
// Disabled for directory-only mode
// import { storeShippingOptionRoutesMiddlewares } from "./shipping-options/middlewares";
import { storeWishlistMiddlewares } from "./wishlist/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/reviews/*",
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
  {
    matcher: "/store/return-request/*",
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
  // ...storeCartsMiddlewares - disabled for directory-only mode
  // ...storeOrderSetMiddlewares - disabled for directory-only mode
  ...storeProductsMiddlewares,
  ...storeSellerMiddlewares,
  // ...storeShippingOptionRoutesMiddlewares - disabled for directory-only mode
  // ...storeReturnsMiddlewares - disabled for directory-only mode
  ...storeWishlistMiddlewares,
];
