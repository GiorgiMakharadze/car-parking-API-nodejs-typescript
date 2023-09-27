import { toCamelCase } from "../utils";
import pool from "../pool";
import { QueryResultRow } from "pg";
/**
 * @class AdminRepo
 * @description AdminRepo is responsible for handling database queries related to parking zones.
 * @ImportantNote "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
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
  static async createParkingZone(
    name: string,
    address: string,
    hourlyCost: number
  ) {
    const result = await pool.query(
      `INSERT INTO parking_zones (name, address, hourly_cost) VALUES ($1, $2, $3) RETURNING *;`,
      [name, address, hourlyCost as any]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @method findAllParkingZones
   * @description Finds all parking zones.
   * @returns An array of all parking zones in camelCase format.
   */
  static async findAllParkingZones() {
    const result = await pool.query(`SELECT * FROM parking_zones;`);
    const { rows } = result || { rows: [] };
    return toCamelCase(rows);
  }

  /**
   * @method findParkingZoneById
   * @description Finds a parking zone by its ID.
   * @param zoneId - The ID of the parking zone.
   * @returns The parking zone object in camelCase format, or null if no zone is found.
   */
  static async findParkingZoneById(zoneId: number) {
    const result = await pool.query(
      `SELECT * FROM parking_zones WHERE id = $1;`,
      [zoneId]
    );
    const { rows } = result as { rows: QueryResultRow[] };
    if (!rows.length) {
      return null;
    }

    return toCamelCase(rows)[0];
  }

  /**
   * @method findParkingZoneByName
   * @description Finds a parking zone by its name.
   * @param name - The name of the parking zone.
   * @returns The parking zone object in camelCase format, or null if no zone is found.
   */
  static async findParkingZoneByName(name: string) {
    const result = await pool.query(
      `SELECT * FROM parking_zones WHERE name = $1;`,
      [name]
    );
    const { rows } = result as { rows: QueryResultRow[] };
    if (!rows.length) {
      return null;
    }
    return toCamelCase(rows)[0];
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
  static async updateParkingZone(
    id: number,
    name: string,
    address: string,
    hourlyCost: number
  ) {
    const result = await pool.query(
      `UPDATE parking_zones SET name = $2, address = $3, hourly_cost = $4 WHERE id = $1 RETURNING *;`,
      [id, name, address, hourlyCost as any]
    );

    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @method deleteParkingZone
   * @description Deletes a parking zone.
   * @param id - ID of the parking zone to be deleted.
   * @returns The deleted parking zone object in camelCase format.
   */
  static async deleteParkingZone(id: number) {
    const result = await pool.query(
      `DELETE FROM parking_zones WHERE id = $1 RETURNING *;`,
      [id]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async deleteUser(userId: number) {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *;`,
      [userId]
    );
    const { rows } = result || { rows: [] };
    if (!rows.length) {
      return null;
    }
    return toCamelCase(rows)[0];
  }

  static async grantAdminRights(userId: number | string) {
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE id = $1 RETURNING *;`,
      [userId as any]
    );
    const { rows } = result || { rows: [] };
    if (!rows.length) {
      return null;
    }
    return toCamelCase(rows)[0];
  }
}

export default AdminRepo;
