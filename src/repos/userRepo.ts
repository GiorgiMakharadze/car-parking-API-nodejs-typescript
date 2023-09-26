import { toCamelCase } from "../utils";
import pool from "../pool";
import AdminRepo from "./adminRepo";

class UserRepo {
  static async addVehicle(
    userId: any,
    name: string,
    stateNumber: string,
    type: string,
    parkingZoneId: number
  ) {
    const parkingZone = await AdminRepo.findParkingZoneById(parkingZoneId);
    if (!parkingZone) {
      throw new Error(`Parking zone with id ${parkingZoneId} not found`);
    }

    const result = await pool.query(
      `INSERT INTO vehicles (user_id, name, state_number, type) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [userId, name, stateNumber, type]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async editVehicle(
    vehicleId: any,
    name: string,
    stateNumber: string,
    type: string
  ) {
    const result = await pool.query(
      `UPDATE vehicles SET name = $2, state_number = $3, type = $4 WHERE id = $1 RETURNING *;`,
      [vehicleId, name, stateNumber, type]
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
    return toCamelCase(rows)[0];
  }
}

export default UserRepo;
