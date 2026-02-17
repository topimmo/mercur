export const storeSellerFields = [
  'id',
  'store_status',
  'name',
  'handle',
  'description',
  'photo',
  'address_line',
  'city_id',
  'city.id',
  'city.name',
  'neighborhood_id',
  'neighborhood.id',
  'neighborhood.name',
  'postal_code',
  'country_code',
  'tax_id'
]

export const storeSellerQueryConfig = {
  list: {
    defaults: storeSellerFields,
    isList: true
  },
  retrieve: {
    defaults: storeSellerFields,
    isList: false
  }
}
