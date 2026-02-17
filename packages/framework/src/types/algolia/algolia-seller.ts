import { z } from "zod";
import { StoreStatus, SubscriptionStatus } from "../seller";

export type AlgoliaSeller = z.infer<typeof AlgoliaSellerValidator>;
export const AlgoliaSellerValidator = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  store_status: z.nativeEnum(StoreStatus),
  approved: z.boolean(),
  subscription_status: z.nativeEnum(SubscriptionStatus),
  city_id: z.string().nullable(),
  neighborhood_id: z.string().nullable(),
  city: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  neighborhood: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
});
