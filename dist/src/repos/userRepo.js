"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const pool_1 = __importDefault(require("../pool"));
/**
 * @class UserRepo
 * @description UserRepo is responsible for handling database queries related to users.
 * @ImportantNote "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */
class UserRepo {
    static async addVehicle(userId, name, stateNumber, type) {
        const result = await pool_1.default.query(`INSERT INTO vehicles (user_id, name, state_number, type) VALUES ($1, $2, $3, $4) RETURNING *;`, [userId, name, stateNumber, type]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async editVehicle(vehicleId, name, stateNumber, type) {
        const result = await pool_1.default.query(`UPDATE vehicles SET name = $2, state_number = $3, type = $4 WHERE id = $1 RETURNING *;`, [vehicleId, name, stateNumber, type]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async deleteVehicle(vehicleId) {
        const result = await pool_1.default.query(`DELETE FROM vehicles WHERE id = $1 RETURNING *;`, [vehicleId]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async getUserVehicles(userId) {
        const result = await pool_1.default.query(`SELECT * FROM vehicles WHERE user_id = $1;`, [userId]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows);
    }
    static async findVehicleById(vehicleId) {
        const result = await pool_1.default.query(`SELECT * FROM vehicles WHERE id = $1;`, [
            vehicleId,
        ]);
        const { rows } = result || { rows: [] };
        return rows.length ? (0, utils_1.toCamelCase)(rows)[0] : null;
    }
    static async addParkingHistory(userId, vehicleId, parkingZoneId, endTime, cost) {
        const result = await pool_1.default.query(`INSERT INTO parking_history (user_id, vehicle_id, zone_id, end_time, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, [userId, vehicleId, parkingZoneId, endTime, cost]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async deleteReservation(reservationId) {
        const result = await pool_1.default.query(`DELETE FROM parking_history WHERE id = $1 RETURNING *;`, [reservationId]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async findReservationById(reservationId) {
        const result = await pool_1.default.query(`SELECT * FROM parking_history WHERE id = $1;`, [reservationId]);
        const { rows } = result || { rows: [] };
        return rows.length ? (0, utils_1.toCamelCase)(rows)[0] : null;
    }
    static async updateBalance(userId, newBalance) {
        console.log("Updating to new balance:", newBalance);
        const result = await pool_1.default.query(`UPDATE users SET balance = $2 WHERE id = $1 RETURNING *;`, [userId, newBalance]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
}
exports.default = UserRepo;
