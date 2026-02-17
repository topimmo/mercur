import { model } from "@medusajs/framework/utils";

import { Neighborhood } from "./neighborhood";

export const City = model.define("city", {
  id: model.id({ prefix: "city" }).primaryKey(),
  name: model.text().searchable(),
  neighborhoods: model.hasMany(() => Neighborhood),
});
