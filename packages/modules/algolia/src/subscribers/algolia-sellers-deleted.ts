import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import { AlgoliaEvents, IndexType } from '@mercurjs/framework'

import { ALGOLIA_MODULE, AlgoliaModuleService } from '../modules/algolia'

export default async function algoliaSellersDeletedHandler({
  event,
  container
}: SubscriberArgs<{ ids: string[] }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const algolia = container.resolve<AlgoliaModuleService>(ALGOLIA_MODULE)

    await algolia.batchDelete(IndexType.SELLER, event.data.ids)

    logger.debug(
      `Algolia sync: Successfully deleted ${event.data.ids.length} sellers`
    )
  } catch (error) {
    logger.error(
      `Algolia delete failed for sellers ${event.data.ids.join(', ')}:`,
      error
    )
    throw error
  }
}

export const config: SubscriberConfig = {
  event: AlgoliaEvents.SELLERS_DELETED,
  context: {
    subscriberId: 'algolia-sellers-deleted-handler'
  }
}
