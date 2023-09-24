/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("users", {
    refresh_token: {
      type: "VARCHAR(255)",
      notNull: false,
    },
    refresh_token_expires_at: {
      type: "TIMESTAMP",
      notNull: false,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("users", ["refresh_token", "refresh_token_expires_at"]);
}
