import { z } from 'zod'

import { createFindParams } from '@medusajs/medusa/api/utils/validators'

export type StoreGetSellersParamsType = z.infer<typeof StoreGetSellersParams>
export const StoreGetSellersParams = createFindParams({
  offset: 0,
  limit: 50
}).merge(
  z.object({
    city_id: z.string().optional(),
    neighborhood_id: z.string().optional(),
  })
)
