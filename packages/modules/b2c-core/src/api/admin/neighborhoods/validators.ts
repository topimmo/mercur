import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type AdminNeighborhoodParamsType = z.infer<
  typeof AdminNeighborhoodParams
>;
export const AdminNeighborhoodParams = createFindParams({
  offset: 0,
  limit: 50,
});

export type AdminCreateNeighborhoodType = z.infer<
  typeof AdminCreateNeighborhood
>;
export const AdminCreateNeighborhood = z
  .object({
    name: z.string().min(1, "Neighborhood name is required"),
    city_id: z.string().min(1, "City ID is required"),
  })
  .strict();

export type AdminUpdateNeighborhoodType = z.infer<
  typeof AdminUpdateNeighborhood
>;
export const AdminUpdateNeighborhood = z
  .object({
    name: z.string().min(1, "Neighborhood name is required").optional(),
    city_id: z.string().min(1, "City ID is required").optional(),
  })
  .strict();
