"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const pool_1 = __importDefault(require("../pool"));
const adminRepo_1 = __importDefault(require("./adminRepo"));
class UserRepo {
    static async addVehicle(userId, name, stateNumber, type, parkingZoneId) {
        const parkingZone = await adminRepo_1.default.findParkingZoneById(parkingZoneId);
        if (!parkingZone) {
            throw new Error(`Parking zone with id ${parkingZoneId} not found`);
        }
        const result = await pool_1.default.query(`INSERT INTO vehicles (user_id, name, state_number, type) VALUES ($1, $2, $3, $4) RETURNING *;`, [userId, name, stateNumber, type]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async editVehicle(vehicleId, name, stateNumber, type, parkingZoneId) {
        const result = await pool_1.default.query(`UPDATE vehicles SET name = $2, state_number = $3, type = $4, parking_zone_id = $5 WHERE id = $1 RETURNING *;`, [vehicleId, name, stateNumber, type, parkingZoneId]);
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
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    static async findVehicleById(vehicleId) {
        const result = await pool_1.default.query(`SELECT * FROM vehicles WHERE id = $1;`, [
            vehicleId,
        ]);
        const { rows } = result || { rows: [] };
        return rows.length ? (0, utils_1.toCamelCase)(rows)[0] : null;
    }
}
exports.default = UserRepo;
