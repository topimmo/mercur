import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import { AlgoliaEvents, IndexType } from '@mercurjs/framework'

import { ALGOLIA_MODULE, AlgoliaModuleService } from '../modules/algolia'
import {
  filterSellersByStatus,
  findAndTransformAlgoliaSellers
} from '../subscribers/utils'

export default async function algoliaSellersChangedHandler({
  event,
  container
}: SubscriberArgs<{ ids: string[] }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const algolia = container.resolve<AlgoliaModuleService>(ALGOLIA_MODULE)

    const { approved, other } = await filterSellersByStatus(
      container,
      event.data.ids
    )

    logger.debug(
      `Algolia sync: Processing ${event.data.ids.length} sellers - ${approved.length} to upsert, ${other.length} to delete`
    )

    const sellersToInsert = approved.length
      ? await findAndTransformAlgoliaSellers(container, approved)
      : []

    await algolia.batch(IndexType.SELLER, sellersToInsert, other)

    logger.debug(
      `Algolia sync: Successfully synced ${sellersToInsert.length} sellers`
    )
  } catch (error) {
    logger.error(
      `Algolia sync failed for sellers ${event.data.ids.join(', ')}:`,
      error
    )
    throw error
  }
}

export const config: SubscriberConfig = {
  event: AlgoliaEvents.SELLERS_CHANGED,
  context: {
    subscriberId: 'algolia-sellers-changed-handler'
  }
}
