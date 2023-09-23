"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,4}$'),
      password VARCHAR(255) NOT NULL,
      balance DECIMAL CHECK (balance >= 0) DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  COMMENT ON TABLE users IS 'Table to store user information, including authentication details and balance.';
      `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    DROP TABLE IF EXISTS users;
      `);
}
exports.down = down;
