import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

import { AlgoliaEvents, SellerEvents } from '@mercurjs/framework'

export default async function sellerUpdatedHandler({
  event,
  container
}: SubscriberArgs<{ id: string }>) {
  const eventBus = container.resolve(Modules.EVENT_BUS)

  // Trigger Algolia sync for the updated seller
  await eventBus.emit({
    name: AlgoliaEvents.SELLERS_CHANGED,
    data: {
      ids: [event.data.id]
    }
  })
}

export const config: SubscriberConfig = {
  event: SellerEvents.SELLER_UPDATED,
  context: {
    subscriberId: 'seller-updated-algolia-handler'
  }
}
