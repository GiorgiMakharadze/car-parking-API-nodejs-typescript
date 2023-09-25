import { toCamelCase } from "../utils";
import pool from "../pool";
import { QueryResultRow } from "pg";

/**
 * @description UserRepo is responsible for handling database queries related to users.
 * Note: "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */
class UserRepo {
  /**
   * @description Find a user by their email address.
   * @param email - The email address of the user.
   * @returns The user object in camelCase format.
   */
  static async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1;`, [
      email,
    ]);
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @description Create a new user.
   * @param username - The username of the new user.
   * @param email - The email address of the new user.
   * @param hashedPassword - The hashed password of the new user.
   * @param securityQuestion - The security question of the new user.
   * @param securityAnswer - The security answer of the new user.
   * @param role - The role of the new user.
   * @returns The newly created user object in camelCase format.
   */
  static async createUser(
    username: string,
    email: string,
    hashedPassword: string,
    securityQuestion: string,
    securityAnswer: string,
    role: string
  ) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, security_question, security_answer, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [username, email, hashedPassword, securityQuestion, securityAnswer, role]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @description Count the total number of users.
   * @returns The total count of users.
   */
  static async countUsers() {
    const result = await pool.query("SELECT COUNT(*) FROM users;");
    return parseInt(result?.rows[0].count);
  }

  /**
   * @description Find a user by their ID.
   * @param userId - The ID of the user.
   * @returns The user object in camelCase format, or null if no user is found.
   */
  static async findById(userId: number) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1;`, [
      userId,
    ]);

    const { rows } = result as { rows: QueryResultRow[] };
    if (!rows.length) {
      return null;
    }

    return toCamelCase(rows)[0];
  }

  /**
   * @description Increment the number of failed login attempts for a specific user.
   * @param userId - The ID of the user.
   */
  static async incrementFailedLoginAttempts(userId: number) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1;`,
      [userId]
    );
  }

  /**
   * @description Reset the number of failed login attempts for a specific user.
   * @param userId - The ID of the user.
   */
  static async resetFailedLoginAttempts(userId: number) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0 WHERE id = $1;`,
      [userId]
    );
  }

  /**
   * @description Update the checksum for a specific user.
   * @param userId - The ID of the user.
   * @param checksum - The new checksum.
   */
  static async updateChecksum(userId: number, checksum: string) {
    await pool.query(`UPDATE users SET checksum = $1 WHERE id = $2;`, [
      checksum,
      userId as any,
    ]);
  }

  /**
   * @description Save a refresh token for a specific user.
   * @param userId - The ID of the user.
   * @param refreshToken - The new refresh token.
   */
  static async saveRefreshToken(userId: number, refreshToken: string | null) {
    const expiryDate = refreshToken
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;
    await pool.query(
      `UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3;`,
      [refreshToken, expiryDate, userId as any]
    );
  }

  /**
   * @description Find a user by their refresh token.
   * @param refreshToken - The refresh token associated with the user.
   * @returns The user object in camelCase format.
   */
  static async findByRefreshToken(refreshToken: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE refresh_token = $1;`,
      [refreshToken]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @description Find a user by their username.
   * @param username - The username of the user.
   * @returns The user object in camelCase format.
   */
  static async findByUsername(username: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1;`,
      [username]
    );
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @description Update the password for a specific user.
   * @param userId - The ID of the user.
   * @param hashedPassword - The new hashed password.
   */
  static async updatePassword(userId: number, hashedPassword: string) {
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2;`, [
      hashedPassword,
      userId as any,
    ]);
  }

  /**
   * @description Invalidate a user's refresh token.
   * @param userId - The ID of the user.
   */
  static async invalidateRefreshToken(userId: number) {
    await pool.query(
      `UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1;`,
      [userId as any]
    );
  }
}

export default UserRepo;
