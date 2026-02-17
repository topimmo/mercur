import { model } from "@medusajs/framework/utils";

import { City } from "./city";

export const Neighborhood = model.define("neighborhood", {
  id: model.id({ prefix: "nbhd" }).primaryKey(),
  name: model.text().searchable(),
  city_id: model.text(),
  city: model.belongsTo(() => City, { mappedBy: "neighborhoods" }),
});
