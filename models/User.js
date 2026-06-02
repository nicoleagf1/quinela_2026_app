const db = require('../config/db');

class User {
  static async create({ firstName, lastName, email, passwordHash, role = 'user' }) {
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role, created_at`,
      [firstName, lastName, email, passwordHash, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async countUsers() {
    const result = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
  }

  static async getAll() {
    const result = await db.query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async update(id, { firstName, lastName, email, role }) {
    await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = $4
       WHERE id = $5`,
      [firstName, lastName, email, role, id]
    );
  }
}

module.exports = User;
