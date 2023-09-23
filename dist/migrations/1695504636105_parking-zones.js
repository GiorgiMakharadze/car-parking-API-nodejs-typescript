"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    CREATE TABLE parking_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(255) NOT NULL,
        hourly_cost DECIMAL CHECK (hourly_cost > 0) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    COMMENT ON TABLE parking_zones IS 'Table to store parking zones details created by admin.';
    `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    DROP TABLE IF EXISTS parking_zones;
      `);
}
exports.down = down;
