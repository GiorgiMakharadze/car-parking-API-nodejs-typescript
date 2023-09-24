"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.addColumn("users", {
        refresh_token: {
            type: "VARCHAR(255)",
            notNull: false,
        },
        refresh_token_expires_at: {
            type: "TIMESTAMP",
            notNull: false,
        },
    });
}
exports.up = up;
async function down(pgm) {
    pgm.dropColumns("users", ["refresh_token", "refresh_token_expires_at"]);
}
exports.down = down;
