export const vendorSellerFields = [
  "id",
  "store_status",
  "approved",
  "subscription_status",
  "name",
  "handle",
  "description",
  "photo",
  "address_line",
  "city_id",
  "city.id",
  "city.name",
  "neighborhood_id",
  "neighborhood.id",
  "neighborhood.name",
  "postal_code",
  "country_code",
  "tax_id",
];

export const vendorSellerQueryConfig = {
  list: {
    defaults: vendorSellerFields,
    isList: true,
  },
  retrieve: {
    defaults: vendorSellerFields,
    isList: false,
  },
};

export const vendorOnboardingFields = [
  "id",
  "seller_id",
  "store_information",
  "stripe_connection",
  "locations_shipping",
  "products",
  "created_at",
  "updated_at",
];

export const vendorOnboardingQueryConfig = {
  retrieve: {
    defaults: vendorOnboardingFields,
    isList: false,
  },
};
