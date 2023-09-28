import { toCamelCase } from "../utils";
import pool from "../pool";
import AdminRepo from "./adminRepo";

/**
 * @class UserRepo
 * @description UserRepo is responsible for handling database queries related to users.
 * @ImportantNote "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */

class UserRepo {
  static async addVehicle(
    userId: string,
    name: string,
    stateNumber: string,
    type: string
  ) {
    const result = await pool.query(
      `INSERT INTO vehicles (user_id, name, state_number, type) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [userId as any, name, stateNumber, type]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async editVehicle(
    vehicleId: number,
    name: string,
    stateNumber: string,
    type: string
  ) {
    const result = await pool.query(
      `UPDATE vehicles SET name = $2, state_number = $3, type = $4 WHERE id = $1 RETURNING *;`,
      [vehicleId as any, name, stateNumber, type]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async deleteVehicle(vehicleId: number) {
    const result = await pool.query(
      `DELETE FROM vehicles WHERE id = $1 RETURNING *;`,
      [vehicleId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async getUserVehicles(userId: number) {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE user_id = $1;`,
      [userId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows);
  }

  static async findVehicleById(vehicleId: number) {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1;`, [
      vehicleId,
    ]);
    const { rows } = result || { rows: [] };
    return rows.length ? toCamelCase(rows)[0] : null;
  }

  static async addParkingHistory(
    userId: number,
    vehicleId: number,
    parkingZoneId: number,
    endTime: Date,
    cost: number
  ) {
    const result = await pool.query(
      `INSERT INTO parking_history (user_id, vehicle_id, zone_id, end_time, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [userId, vehicleId, parkingZoneId, endTime, cost] as any
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async deleteReservation(reservationId: number) {
    const result = await pool.query(
      `DELETE FROM parking_history WHERE id = $1 RETURNING *;`,
      [reservationId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async findReservationsByUserId(userId: number) {
    const result = await pool.query(
      `SELECT * FROM parking_history WHERE user_id = $1;`,
      [userId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows);
  }

  static async findReservationById(reservationId: number) {
    const result = await pool.query(
      `SELECT * FROM parking_history WHERE id = $1;`,
      [reservationId]
    );
    const { rows } = result || { rows: [] };
    return rows.length ? toCamelCase(rows)[0] : null;
  }

  static async updateBalance(userId: number, newBalance: number) {
    console.log("Updating to new balance:", newBalance);
    const result = await pool.query(
      `UPDATE users SET balance = $2 WHERE id = $1 RETURNING *;`,
      [userId, newBalance]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }
}

export default UserRepo;
