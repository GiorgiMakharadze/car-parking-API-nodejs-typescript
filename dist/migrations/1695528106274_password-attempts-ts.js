"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    ALTER TABLE users 
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN checksum VARCHAR(64);
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS failed_login_attempts,
    DROP COLUMN IF EXISTS checksum;
  `);
}
exports.down = down;
