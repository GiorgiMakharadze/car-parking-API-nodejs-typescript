"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.sql(`
    ALTER TABLE users
    ADD COLUMN security_question VARCHAR(255),
    ADD COLUMN security_answer VARCHAR(255);
  `);
}
exports.up = up;
async function down(pgm) {
    pgm.sql(`
    ALTER TABLE users
    DROP COLUMN security_question,
    DROP COLUMN security_answer;
  `);
}
exports.down = down;
