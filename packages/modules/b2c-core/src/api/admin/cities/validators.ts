import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type AdminCityParamsType = z.infer<typeof AdminCityParams>;
export const AdminCityParams = createFindParams({
  offset: 0,
  limit: 50,
});

export type AdminCreateCityType = z.infer<typeof AdminCreateCity>;
export const AdminCreateCity = z
  .object({
    name: z.string().min(1, "City name is required"),
  })
  .strict();

export type AdminUpdateCityType = z.infer<typeof AdminUpdateCity>;
export const AdminUpdateCity = z
  .object({
    name: z.string().min(1, "City name is required").optional(),
  })
  .strict();
