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
}

export default UserRepo;
