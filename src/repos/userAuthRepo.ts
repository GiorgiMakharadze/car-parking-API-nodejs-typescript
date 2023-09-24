import toCamelCase from "../utils/toCamelCase";
import pool from "../pool";

class UserRepo {
  static async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1;`, [
      email,
    ]);
    const { rows } = result || { rows: [] };

    return toCamelCase(rows)[0];
  }

  static async createUser(
    username: string,
    email: string,
    hashedPassword: string
  ) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [username, email, hashedPassword]
    );

    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async incrementFailedLoginAttempts(userId: number) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1;`,
      [userId]
    );
  }

  static async resetFailedLoginAttempts(userId: number) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0 WHERE id = $1;`,
      [userId]
    );
  }

  static async updateChecksum(userId: number, checksum: string) {
    await pool.query(`UPDATE users SET checksum = $1 WHERE id = $2;`, [
      checksum,
      /**
       * @description I'am using "as any" here due to a TypeScript error indicating a type mismatch
       * with the pg library that I'am using. The library accepts numbers for query parameters,
       * but TypeScript expects strings.
       */
      userId as any,
    ]);
  }

  static async saveRefreshToken(userId: number, refreshToken: string | null) {
    await pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2;`, [
      refreshToken,
      userId as any,
    ]);
  }

  static async findByRefreshToken(refreshToken: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE refresh_token = $1;`,
      [refreshToken]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }
}

export default UserRepo;
