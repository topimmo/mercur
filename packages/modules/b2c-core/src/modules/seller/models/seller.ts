import { model } from "@medusajs/framework/utils";

import { StoreStatus, SubscriptionStatus } from "@mercurjs/framework";
import { City } from "./city";
import { MemberInvite } from "./invite";
import { Member } from "./member";
import { Neighborhood } from "./neighborhood";
import { SellerOnboarding } from "./onboarding";

export const Seller = model.define("seller", {
  id: model.id({ prefix: "sel" }).primaryKey(),
  store_status: model.enum(StoreStatus).default(StoreStatus.ACTIVE),
  approved: model.boolean().default(false),
  subscription_status: model
    .enum(SubscriptionStatus)
    .default(SubscriptionStatus.INACTIVE),
  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().searchable().nullable(),
  photo: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  address_line: model.text().nullable(),
  state: model.text().nullable(),
  postal_code: model.text().nullable(),
  country_code: model.text().nullable(),
  tax_id: model.text().nullable(),
  city_id: model.text().nullable(),
  city: model.belongsTo(() => City).nullable(),
  neighborhood_id: model.text().nullable(),
  neighborhood: model.belongsTo(() => Neighborhood).nullable(),
  members: model.hasMany(() => Member),
  invites: model.hasMany(() => MemberInvite),
  onboarding: model.hasOne(() => SellerOnboarding).nullable(),
});
