import { toCamelCase } from "../utils";
import pool from "../pool";
import { queryWithCache, clearCache } from "../utils/cache";

/**
 * @class UserRepo
 * @description UserRepo is responsible for handling database queries related to users.
 * @ImportantNote "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */
class UserRepo {
  /**
   * @method addVehicle
   * @description This method is responsible for adding a new vehicle to the database for a user.
   * @param {string} userId - The ID of the user.
   * @param {string} name - The name of the vehicle.
   * @param {string} stateNumber - The state number of the vehicle.
   * @param {string} type - The type of the vehicle.
   * @returns {Object} The newly added vehicle.
   */
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

    const cacheKey = `user:${userId}:vehicles`;
    await clearCache(cacheKey);

    return toCamelCase(rows)[0];
  }

  /**
   * @method getUserVehicles
   * @description This method retrieves all vehicles associated with a user from the database.
   * @param {number} userId - The ID of the user.
   * @returns {Array} An array of user vehicles.
   */
  static async getUserVehicles(userId: number) {
    const cacheKey = `user:${userId}:vehicles`;
    const query = `SELECT * FROM vehicles WHERE user_id = $1;`;
    const params = [userId];

    const cachedRows = await queryWithCache(query, params, cacheKey);

    if (cachedRows) {
      return toCamelCase(cachedRows);
    }

    // If cache miss or any issue with cache, fallback to DB query
    const result = await pool.query(query, params);
    const { rows } = result || { rows: [] };
    return toCamelCase(rows);
  }

  /**
   * @method findVehicleById
   * @description This method retrieves a vehicle by its ID from the database.
   * @param {number} vehicleId - The ID of the vehicle.
   * @returns {Object|null} The vehicle object if found, otherwise null.
   */
  static async findVehicleById(vehicleId: number) {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1;`, [
      vehicleId,
    ]);
    const { rows } = result || { rows: [] };
    return rows.length ? toCamelCase(rows)[0] : null;
  }

  /**
   * @method editVehicle
   * @description This method is responsible for editing the details of an existing vehicle in the database.
   * @param {number} vehicleId - The ID of the vehicle.
   * @param {string} name - The new name of the vehicle.
   * @param {string} stateNumber - The new state number of the vehicle.
   * @param {string} type - The new type of the vehicle.
   * @returns {Object} The updated vehicle.
   */
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

  /**
   * @method deleteVehicle
   * @description This method is responsible for deleting a vehicle from the database.
   * @param {number} vehicleId - The ID of the vehicle.
   * @returns {Object} The deleted vehicle.
   */
  static async deleteVehicle(vehicleId: number) {
    const result = await pool.query(
      `DELETE FROM vehicles WHERE id = $1 RETURNING *;`,
      [vehicleId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @method addParkingHistory
   * @description This method is responsible for adding parking history for a user in the database.
   * @param {number} userId - The ID of the user.
   * @param {number} vehicleId - The ID of the vehicle.
   * @param {number} parkingZoneId - The ID of the parking zone.
   * @param {Date} endTime - The end time of the parking.
   * @param {number} cost - The cost of the parking.
   * @returns {Object} The newly added parking history.
   */
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

  /**
   * @method findReservationsByUserId
   * @description This method retrieves all reservations associated with a user from the database.
   * @param {number} userId - The ID of the user.
   * @returns {Array} An array of user reservations.
   */
  static async findReservationsByUserId(userId: number) {
    const result = await pool.query(
      `SELECT * FROM parking_history WHERE user_id = $1;`,
      [userId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows);
  }

  /**
   * @method findReservationById
   * @description This method retrieves a reservation by its ID from the database.
   * @param {number} reservationId - The ID of the reservation.
   * @returns {Object|null} The reservation object if found, otherwise null.
   */
  static async findReservationById(reservationId: number) {
    const result = await pool.query(
      `SELECT * FROM parking_history WHERE id = $1;`,
      [reservationId]
    );
    const { rows } = result || { rows: [] };
    return rows.length ? toCamelCase(rows)[0] : null;
  }

  /**
   * @method deleteReservation
   * @description This method is responsible for deleting a reservation from the database.
   * @param {number} reservationId - The ID of the reservation.
   * @returns {Object} The deleted reservation.
   */
  static async deleteReservation(reservationId: number) {
    const result = await pool.query(
      `DELETE FROM parking_history WHERE id = $1 RETURNING *;`,
      [reservationId]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @method updateBalance
   * @description This method updates the balance of a user in the database.
   * @param {number} userId - The ID of the user.
   * @param {number} newBalance - The new balance of the user.
   * @returns {Object} The updated user.
   */
  static async updateBalance(userId: number, newBalance: number) {
    const result = await pool.query(
      `UPDATE users SET balance = $2 WHERE id = $1 RETURNING *;`,
      [userId, newBalance]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }
}

export default UserRepo;
