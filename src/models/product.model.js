import pool from '../loaders/db.loader.js';
import { tableName } from '../utils/prefix.utils.js';

// Generic CRUD using dynamic table name
export default class BaseModel {
  constructor(baseTable) { this.baseTable = baseTable; }

  table(prefix) { return tableName(this.baseTable, prefix); }

  async findAll(prefix, { limit=50, offset=0 }={}) {
    const sql = `SELECT * FROM ${this.table(prefix)} ORDER BY id DESC LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(sql, [limit, offset]);
    return rows;
  }

  async findById(prefix, id) {
    const sql = `SELECT * FROM ${this.table(prefix)} WHERE id = $1`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  async create(prefix, payload) {
    const keys = Object.keys(payload);
    const cols = keys.map(k => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i+1}`).join(', ');
    const sql = `INSERT INTO ${this.table(prefix)} (${cols}) VALUES (${params}) RETURNING *`;
    const { rows } = await pool.query(sql, Object.values(payload));
    return rows[0];
  }

  async update(prefix, id, payload) {
    const keys = Object.keys(payload);
    const set = keys.map((k, i) => `"${k}" = $${i+1}`).join(', ');
    const sql = `UPDATE ${this.table(prefix)} SET ${set} WHERE id = $${keys.length+1} RETURNING *`;
    const { rows } = await pool.query(sql, [...Object.values(payload), id]);
    return rows[0] || null;
  }

  async remove(prefix, id) {
    const sql = `DELETE FROM ${this.table(prefix)} WHERE id = $1`;
    await pool.query(sql, [id]);
    return true;
  }
  async createTableIfNotExists(prefix) {
  const tableName = this.table(prefix);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password TEXT NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
}
