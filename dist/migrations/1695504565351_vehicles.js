"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    CREATE TABLE vehicles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        state_number VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(255) NOT NULL CHECK (type IN ('Sedan', 'Hatchback', 'SUV', 'Truck')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    COMMENT ON TABLE vehicles IS 'Table to store vehicles each user adds.';
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    DROP TABLE IF EXISTS vehicles;
  `);
}
exports.down = down;
