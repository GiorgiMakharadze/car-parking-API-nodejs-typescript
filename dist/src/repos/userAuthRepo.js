"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toCamelCase_1 = __importDefault(require("../utils/toCamelCase"));
const pool_1 = __importDefault(require("../pool"));
class UserRepo {
    static async findByEmail(email) {
        const result = await pool_1.default.query(`SELECT * FROM users WHERE email = $1;`, [
            email,
        ]);
        const { rows } = result || { rows: [] };
        return (0, toCamelCase_1.default)(rows)[0];
    }
    static async createUser(username, email, hashedPassword) {
        const result = await pool_1.default.query(`INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;`, [username, email, hashedPassword]);
        const { rows } = result || { rows: [] };
        return (0, toCamelCase_1.default)(rows)[0];
    }
    static async incrementFailedLoginAttempts(userId) {
        await pool_1.default.query(`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1;`, [userId]);
    }
    static async resetFailedLoginAttempts(userId) {
        await pool_1.default.query(`UPDATE users SET failed_login_attempts = 0 WHERE id = $1;`, [userId]);
    }
    static async updateChecksum(userId, checksum) {
        await pool_1.default.query(`UPDATE users SET checksum = $1 WHERE id = $2;`, [
            checksum,
            /**
             * @description I am using "as any" here due to a TypeScript error indicating a type mismatch
             * with the pg library. The library accepts numbers for query parameters,
             * but TypeScript expects strings.
             */
            userId,
        ]);
    }
}
exports.default = UserRepo;
