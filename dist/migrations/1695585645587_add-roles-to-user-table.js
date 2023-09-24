"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    ALTER TABLE users
    ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    ALTER TABLE users
    DROP COLUMN role;
  `);
}
exports.down = down;
