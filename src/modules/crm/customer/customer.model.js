import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class CustomerModel {
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('customers', prefix)} ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, customerId) {
    const custTable = tableName('customers', prefix);
    const { rows } = await pool.query(
      `SELECT * FROM ${custTable} WHERE customer_id = $1`,
      [customerId]
    );
    return rows[0] || null;
  }

  async create(prefix, data) {
    const custTable = tableName('customers', prefix);

    const {
      customer_type,
      name,
      contact_name,
      contact_phone,
      job_title,
      email,
      phone,
      billing_address,
      shipping_address,
      tin_number,
      photo_url,
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO ${custTable}
      (customer_type, name, contact_name, contact_phone, job_title, email, phone, billing_address, shipping_address, tin_number, photo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        customer_type,
        name,
        contact_name || null,
        contact_phone || null,
        job_title || null,
        email || null,
        phone || null,
        billing_address,
        shipping_address || null,
        tin_number || null,
        photo_url || null,
      ]
    );

    return rows[0];
  }

  async update(prefix, customerId, data) {
    const custTable = tableName('customers', prefix);

    const fields = Object.keys(data);
    const values = Object.values(data);

    if (!fields.length) return null;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE ${custTable} SET ${setClause}, updated_at = NOW() WHERE customer_id = $${fields.length + 1} RETURNING *`;

    const { rows } = await pool.query(query, [...values, customerId]);
    return rows[0] || null;
  }

  async delete(prefix, customerId) {
    const custTable = tableName('customers', prefix);
    const { rowCount } = await pool.query(
      `DELETE FROM ${custTable} WHERE customer_id = $1`,
      [customerId]
    );
    return rowCount > 0;
  }
}
