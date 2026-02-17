import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type StoreNeighborhoodParamsType = z.infer<
  typeof StoreNeighborhoodParams
>;
export const StoreNeighborhoodParams = createFindParams({
  offset: 0,
  limit: 50,
});
