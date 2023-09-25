import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE users 
    ADD COLUMN refresh_token VARCHAR(255),
    ADD COLUMN refresh_token_expires_at TIMESTAMP;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS refresh_token,
    DROP COLUMN IF EXISTS refresh_token_expires_at;
  `);
}
