export const defaultAdminCityFields = ["id", "name", "created_at", "updated_at"];

export const adminCityQueryConfig = {
  list: {
    defaults: defaultAdminCityFields,
    isList: true
  },
  retrieve: {
    defaults: defaultAdminCityFields,
    isList: false
  }
}
