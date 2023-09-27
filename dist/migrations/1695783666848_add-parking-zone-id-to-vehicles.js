"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
  pgm.sql(`
    ALTER TABLE vehicles
    ADD COLUMN parking_zone_id INTEGER REFERENCES parking_zones(id) ON DELETE SET NULL;
  `);
}
exports.up = up;
async function down(pgm) {
  pgm.sql(`
    ALTER TABLE vehicles
    DROP COLUMN IF EXISTS parking_zone_id;
  `);
}
exports.down = down;
