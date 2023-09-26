"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const pool_1 = __importDefault(require("../pool"));
/**
 * @class AdminRepo
 * @description AdminRepo is responsible for handling database queries related to parking zones.
 */
class AdminRepo {
    /**
     * @method createParkingZone
     * @description Creates a new parking zone.
     * @param name - Name of the parking zone.
     * @param address - Address of the parking zone.
     * @param hourlyCost - Hourly cost for parking.
     * @returns The newly created parking zone object in camelCase format.
     */
    static async createParkingZone(name, address, hourlyCost) {
        const result = await pool_1.default.query(`INSERT INTO parking_zones (name, address, hourly_cost) VALUES ($1, $2, $3) RETURNING *;`, [name, address, hourlyCost]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    /**
     * @method findAllParkingZones
     * @description Finds all parking zones.
     * @returns An array of all parking zones in camelCase format.
     */
    static async findAllParkingZones() {
        const result = await pool_1.default.query(`SELECT * FROM parking_zones;`);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows);
    }
    /**
     * @method findParkingZoneById
     * @description Finds a parking zone by its ID.
     * @param zoneId - The ID of the parking zone.
     * @returns The parking zone object in camelCase format, or null if no zone is found.
     */
    static async findParkingZoneById(zoneId) {
        const result = await pool_1.default.query(`SELECT * FROM parking_zones WHERE id = $1;`, [zoneId]);
        const { rows } = result;
        if (!rows.length) {
            return null;
        }
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    /**
     * @method findParkingZoneByName
     * @description Finds a parking zone by its name.
     * @param name - The name of the parking zone.
     * @returns The parking zone object in camelCase format, or null if no zone is found.
     */
    static async findParkingZoneByName(name) {
        const result = await pool_1.default.query(`SELECT * FROM parking_zones WHERE name = $1;`, [name]);
        const { rows } = result;
        if (!rows.length) {
            return null;
        }
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    /**
     * @method updateParkingZone
     * @description Updates an existing parking zone.
     * @param id - ID of the parking zone.
     * @param name - New name of the parking zone.
     * @param address - New address of the parking zone.
     * @param hourlyCost - New hourly cost for parking.
     * @returns The updated parking zone object in camelCase format.
     */
    static async updateParkingZone(id, name, address, hourlyCost) {
        const result = await pool_1.default.query(`UPDATE parking_zones SET name = $2, address = $3, hourly_cost = $4 WHERE id = $1 RETURNING *;`, [id, name, address, hourlyCost]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
    /**
     * @method deleteParkingZone
     * @description Deletes a parking zone.
     * @param id - ID of the parking zone to be deleted.
     * @returns The deleted parking zone object in camelCase format.
     */
    static async deleteParkingZone(id) {
        const result = await pool_1.default.query(`DELETE FROM parking_zones WHERE id = $1 RETURNING *;`, [id]);
        const { rows } = result || { rows: [] };
        return (0, utils_1.toCamelCase)(rows)[0];
    }
}
exports.default = AdminRepo;
