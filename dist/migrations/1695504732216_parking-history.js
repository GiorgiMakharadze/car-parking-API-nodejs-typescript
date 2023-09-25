"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    CREATE TABLE parking_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        zone_id INTEGER REFERENCES parking_zones(id) ON DELETE CASCADE,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        cost DECIMAL CHECK (cost >= 0) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    COMMENT ON TABLE parking_history IS 'Table to store records of each parking transaction.';
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    DROP TABLE IF EXISTS parking_history;
  `);
}
exports.down = down;
