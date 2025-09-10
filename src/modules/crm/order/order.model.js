import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class OrderModel {
  // --- Orders ---
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('orders', prefix)} ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, orderId) {
    const orderTable = tableName('orders', prefix);
    const itemTable = tableName('order_items', prefix);

    const { rows: orderRows } = await pool.query(
      `SELECT * FROM ${orderTable} WHERE order_id = $1`,
      [orderId]
    );
    if (!orderRows.length) return null;

    const order = orderRows[0];

    const { rows: items } = await pool.query(
      `SELECT * FROM ${itemTable} WHERE order_id = $1`,
      [orderId]
    );

    return { ...order, items };
  }

  async create(prefix, data) {
    const orderTable = tableName('orders', prefix);
    const itemTable = tableName('order_items', prefix);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        customer_id,
        billing_address,
        shipping_address,
        notes,
        items
      } = data;

      // Insert order
      const { rows } = await client.query(
        `INSERT INTO ${orderTable} (customer_id, billing_address, shipping_address, notes)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [customer_id, billing_address, shipping_address, notes || null]
      );

      const order = rows[0];
      const orderId = order.order_id;

      // Insert order items
      if (items?.length) {
        for (const item of items) {
          await client.query(
            `INSERT INTO ${itemTable} (order_id, product_id, quantity, unit_price)
             VALUES ($1,$2,$3,$4)`,
            [orderId, item.product_id, item.quantity, item.unit_price]
          );
        }
      }

      await client.query('COMMIT');

      return await this.findById(prefix, orderId);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async updateStatus(prefix, orderId, status) {
    const orderTable = tableName('orders', prefix);
    const { rows } = await pool.query(
      `UPDATE ${orderTable}
       SET status = $1
       WHERE order_id = $2
       RETURNING *`,
      [status, orderId]
    );
    return rows[0] || null;
  }

  async delete(prefix, orderId) {
    const orderTable = tableName('orders', prefix);
    const { rowCount } = await pool.query(
      `DELETE FROM ${orderTable} WHERE order_id = $1`,
      [orderId]
    );
    return rowCount > 0;
  }
}
