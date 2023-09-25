import { toCamelCase } from "../utils";
import pool from "../pool";
import { QueryResultRow } from "pg";

/**
 * @class UserRepo
 * @description UserRepo is responsible for handling database queries related to users.
 * "as any" is used in methods due to a TypeScript error.
 * The pg library accepts numbers for query parameters, but TypeScript expects strings.
 * This type assertion is necessary to align the data types with the library's expectations.
 */
class UserRepo {
  /**
   * @method findByEmail
   * @description Finds a user by their email address.
   * @param email - User's email address.
   * @returns The user object in camelCase format or undefined if not found.
   */
  static async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1;`, [
      email,
    ]);
    const { rows } = result || { rows: [] };
    return toCamelCase(rows)[0];
  }

  /**
   * @method createUser
   * @description Creates a new user.
   * @param username - New user's username.
   * @param email - New user's email address.
   * @param hashedPassword - New user's hashed password.
   * @param securityQuestion - New user's security question.
   * @param securityAnswer - New user's security answer.
   * @param role - New user's role.
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
   * @method countUsers
   * @description Counts the total number of users.
   * @returns The total count of users.
   */
  static async countUsers() {
    const result = await pool.query("SELECT COUNT(*) FROM users;");
    return parseInt(result?.rows[0].count);
  }

  /**
   * @method findById
   * @description Find a user by their ID.
   * @param userId - The ID of the user.
   * @returns The user object in camelCase format, or null if no user is found.
   */
  static async findById(userId: string) {
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
   * @method incrementFailedLoginAttempts
   * @description Increment the number of failed login attempts for a specific user.
   * @param userId - The ID of the user.
   */
  static async incrementFailedLoginAttempts(userId: string) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1;`,
      [userId]
    );
  }

  /**
   * @method resetFailedLoginAttempts
   * @description Reset the number of failed login attempts for a specific user.
   * @param userId - The ID of the user.
   */
  static async resetFailedLoginAttempts(userId: string) {
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0 WHERE id = $1;`,
      [userId]
    );
  }

  /**
   * @method updateChecksum
   * @description Update the checksum for a specific user.
   * @param userId - The ID of the user.
   * @param checksum - The new checksum.
   */
  static async updateChecksum(userId: string, checksum: string) {
    await pool.query(`UPDATE users SET checksum = $1 WHERE id = $2;`, [
      checksum,
      userId as any,
    ]);
  }

  /**
   * @method saveRefreshToken
   * @description Save a refresh token for a specific user.
   * @param userId - The ID of the user.
   * @param refreshToken - The new refresh token.
   */
  static async saveRefreshToken(userId: string, refreshToken: string | null) {
    const expiryDate = refreshToken
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null;
    await pool.query(
      `UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3;`,
      [refreshToken, expiryDate, userId as any]
    );
  }

  /**
   * @method findByRefreshToken
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
   * @method findByUsername
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
   * @method updatePassword
   * @description Update the password for a specific user.
   * @param userId - The ID of the user.
   * @param hashedPassword - The new hashed password.
   */
  static async updatePassword(userId: string, hashedPassword: string) {
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2;`, [
      hashedPassword,
      userId as any,
    ]);
  }

  /**
   * @method invalidateRefreshToken
   * @description Invalidate a user's refresh token.
   * @param userId - The ID of the user.
   */
  static async invalidateRefreshToken(userId: string) {
    await pool.query(
      `UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1;`,
      [userId as any]
    );
  }
}

export default UserRepo;
