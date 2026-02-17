import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type StoreCityParamsType = z.infer<typeof StoreCityParams>;
export const StoreCityParams = createFindParams({
  offset: 0,
  limit: 50,
});
