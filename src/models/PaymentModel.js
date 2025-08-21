import pool from '../loaders/db.loader.js';

export default class PaymentModel {
  async create(payment) {
    const keys = Object.keys(payment);
    const cols = keys.map(k => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i+1}`).join(', ');
    const sql = `INSERT INTO payments (${cols}) VALUES (${params}) RETURNING *`;
    const { rows } = await pool.query(sql, Object.values(payment));
    return rows[0];
  }

  async update(id, payment) {
    const keys = Object.keys(payment);
    const set = keys.map((k, i) => `"${k}" = $${i+1}`).join(', ');
    const sql = `UPDATE payments SET ${set} WHERE id = $${keys.length + 1} RETURNING *`;
    const { rows } = await pool.query(sql, [...Object.values(payment), id]);
    return rows[0];
  }

  async findByCompany(companyId) {
    const sql = `SELECT * FROM payments WHERE company_id = $1`;
    const { rows } = await pool.query(sql, [companyId]);
    return rows;
  }
}
