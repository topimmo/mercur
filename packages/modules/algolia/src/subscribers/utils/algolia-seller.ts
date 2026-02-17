import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { AlgoliaSeller } from '@mercurjs/framework'

export async function findAndTransformAlgoliaSellers(
  container: any,
  sellerIds: string[]
): Promise<AlgoliaSeller[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: sellers } = await query.graph({
    entity: 'seller',
    fields: [
      'id',
      'name',
      'handle',
      'description',
      'photo',
      'store_status',
      'approved',
      'subscription_status',
      'city_id',
      'neighborhood_id',
      'city.id',
      'city.name',
      'neighborhood.id',
      'neighborhood.name'
    ],
    filters: {
      id: sellerIds
    }
  })

  return sellers
}

export async function filterSellersByStatus(
  container: any,
  sellerIds: string[]
): Promise<{
  approved: string[]
  other: string[]
}> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: sellers } = await query.graph({
    entity: 'seller',
    fields: ['id', 'approved', 'subscription_status'],
    filters: {
      id: sellerIds
    }
  })

  const approved: string[] = []
  const other: string[] = []

  sellers.forEach((seller: any) => {
    if (seller.approved && seller.subscription_status === 'ACTIVE') {
      approved.push(seller.id)
    } else {
      other.push(seller.id)
    }
  })

  return { approved, other }
}
