import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class FinishedProductModel {
  // --- Finished Products ---
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('finished_product', prefix)} ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, productCode) {
    const table = tableName('finished_product', prefix);
    const { rows } = await pool.query(
      `SELECT * FROM ${table} WHERE product_code = $1`,
      [productCode]
    );
    return rows[0] || null;
  }

  async create(prefix, data) {
    const table = tableName('finished_product', prefix);
    const {
      product_code,
      product_name,
      category,
      location_name,
      selling_price,
      production_cost,
      initial_stock,
      min_stock,
      key_raw_materials,
      description
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO ${table} 
        (product_code, product_name, category, location_name, selling_price, production_cost, initial_stock, min_stock, key_raw_materials, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        product_code,
        product_name,
        category,
        location_name || null,
        selling_price,
        production_cost,
        initial_stock || 0,
        min_stock || 0,
        key_raw_materials || [],
        description || null
      ]
    );

    return rows[0];
  }

  async update(prefix, productCode, data) {
    const table = tableName('finished_product', prefix);
    const fields = [];
    const values = [];
    let i = 1;

    for (const key in data) {
      fields.push(`${key} = $${i}`);
      values.push(data[key]);
      i++;
    }
    values.push(productCode);

    const { rows } = await pool.query(
      `UPDATE ${table} SET ${fields.join(', ')}, updated_at = NOW() WHERE product_code = $${i} RETURNING *`,
      values
    );

    return rows[0];
  }

  async delete(prefix, productCode) {
    const table = tableName('finished_product', prefix);
    const { rows } = await pool.query(
      `DELETE FROM ${table} WHERE product_code = $1 RETURNING *`,
      [productCode]
    );
    return rows[0];
  }
}
