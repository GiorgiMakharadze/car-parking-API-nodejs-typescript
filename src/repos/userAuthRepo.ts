import toCamelCase from "../utils/toCamelCase";
import pool from "../pool";

/**
 * @description In the following methods, we use "as any" due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */

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
    hashedPassword: string,
    securityQuestion: string,
    securityAnswer: string
  ) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, security_question, security_answer) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [username, email, hashedPassword, securityQuestion, securityAnswer]
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
      userId as any,
    ]);
  }

  static async saveRefreshToken(userId: number, refreshToken: string | null) {
    const expiryDate = refreshToken
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;
    await pool.query(
      `UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3;`,
      [refreshToken, expiryDate, userId as any]
    );
  }

  static async findByRefreshToken(refreshToken: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE refresh_token = $1;`,
      [refreshToken]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async findByUsername(username: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1;`,
      [username]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  static async updatePassword(userId: number, hashedPassword: string) {
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2;`, [
      hashedPassword,
      userId as any,
    ]);
  }

  static async invalidateRefreshToken(userId: number) {
    await pool.query(
      `UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1;`,
      [userId as any]
    );
  }
}

export default UserRepo;
