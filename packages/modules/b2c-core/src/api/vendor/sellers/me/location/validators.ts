import { z } from "zod";

export type VendorSetLocationInputType = z.infer<typeof VendorSetLocationInput>;
export const VendorSetLocationInput = z
  .object({
    city_id: z.string().nullable(),
    neighborhood_id: z.string().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // If neighborhood_id is provided, city_id must also be provided
      if (data.neighborhood_id && !data.city_id) {
        return false;
      }
      return true;
    },
    {
      message: "city_id is required when neighborhood_id is provided",
      path: ["city_id"],
    }
  );
