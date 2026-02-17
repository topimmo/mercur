export const defaultAdminNeighborhoodFields = [
  "id",
  "name",
  "city_id",
  "created_at",
  "updated_at",
];

export const adminNeighborhoodQueryConfig = {
  list: {
    defaults: defaultAdminNeighborhoodFields,
    isList: true
  },
  retrieve: {
    defaults: defaultAdminNeighborhoodFields,
    isList: false
  }
}
