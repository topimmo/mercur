import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260217193151 extends Migration {
  override async up(): Promise<void> {
    // Create cities table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "city" (
        "id" text NOT NULL,
        "name" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "city_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create neighborhoods table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "neighborhood" (
        "id" text NOT NULL,
        "name" text NOT NULL,
        "city_id" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "neighborhood_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add foreign key from neighborhood to city
    this.addSql(`
      ALTER TABLE "neighborhood" 
      ADD CONSTRAINT "neighborhood_city_id_foreign" 
      FOREIGN KEY ("city_id") REFERENCES "city" ("id") 
      ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    // Add city_id and neighborhood_id to seller table
    this.addSql(`
      ALTER TABLE IF EXISTS "seller" 
      ADD COLUMN IF NOT EXISTS "approved" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "subscription_status" text NOT NULL DEFAULT 'INACTIVE',
      ADD COLUMN IF NOT EXISTS "city_id" text NULL,
      ADD COLUMN IF NOT EXISTS "neighborhood_id" text NULL;
    `);

    // Add foreign keys from seller to city and neighborhood
    this.addSql(`
      ALTER TABLE "seller" 
      ADD CONSTRAINT "seller_city_id_foreign" 
      FOREIGN KEY ("city_id") REFERENCES "city" ("id") 
      ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    this.addSql(`
      ALTER TABLE "seller" 
      ADD CONSTRAINT "seller_neighborhood_id_foreign" 
      FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood" ("id") 
      ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    // Add indexes for better query performance
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_city_id" 
      ON "seller" ("city_id");
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_neighborhood_id" 
      ON "seller" ("neighborhood_id");
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_neighborhood_city_id" 
      ON "neighborhood" ("city_id");
    `);
  }

  override async down(): Promise<void> {
    // Remove indexes
    this.addSql(`DROP INDEX IF EXISTS "IDX_neighborhood_city_id";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_seller_neighborhood_id";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_seller_city_id";`);

    // Remove foreign keys from seller
    this.addSql(
      `ALTER TABLE "seller" DROP CONSTRAINT IF EXISTS "seller_neighborhood_id_foreign";`
    );
    this.addSql(
      `ALTER TABLE "seller" DROP CONSTRAINT IF EXISTS "seller_city_id_foreign";`
    );

    // Remove columns from seller
    this.addSql(`ALTER TABLE "seller" DROP COLUMN IF EXISTS "neighborhood_id";`);
    this.addSql(`ALTER TABLE "seller" DROP COLUMN IF EXISTS "city_id";`);
    this.addSql(
      `ALTER TABLE "seller" DROP COLUMN IF EXISTS "subscription_status";`
    );
    this.addSql(`ALTER TABLE "seller" DROP COLUMN IF EXISTS "approved";`);

    // Remove foreign key from neighborhood
    this.addSql(
      `ALTER TABLE "neighborhood" DROP CONSTRAINT IF EXISTS "neighborhood_city_id_foreign";`
    );

    // Drop tables
    this.addSql(`DROP TABLE IF EXISTS "neighborhood";`);
    this.addSql(`DROP TABLE IF EXISTS "city";`);
  }
}
