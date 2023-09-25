"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    ALTER TABLE users 
    ADD COLUMN refresh_token VARCHAR(255),
    ADD COLUMN refresh_token_expires_at TIMESTAMP;
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS refresh_token,
    DROP COLUMN IF EXISTS refresh_token_expires_at;
  `);
}
exports.down = down;
