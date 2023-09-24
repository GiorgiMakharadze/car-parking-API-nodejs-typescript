"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = exports.shorthands = void 0;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.addColumn("users", {
        failed_login_attempts: {
            type: "INT",
            notNull: true,
            default: 0,
        },
    });
    // Adding the checksum column which can be nullable
    pgm.addColumn("users", {
        checksum: {
            type: "VARCHAR(64)",
            notNull: false,
        },
    });
}
exports.up = up;
async function down(pgm) {
    pgm.dropColumn("users", "checksum");
    pgm.dropColumn("users", "failed_login_attempts");
}
exports.down = down;
