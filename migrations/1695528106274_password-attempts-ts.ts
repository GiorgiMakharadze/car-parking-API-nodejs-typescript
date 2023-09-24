/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("users", {
    failed_login_attempts: {
      type: "INT",
      notNull: true,
      default: 0,
    },
  });

  // Adding the checksum column which can be nullable
  pgm.addColumn("users", {
    checksum: {
      type: "VARCHAR(64)",
      notNull: false,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("users", "checksum");
  pgm.dropColumn("users", "failed_login_attempts");
}
