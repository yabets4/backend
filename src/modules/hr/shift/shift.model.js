import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class ShiftModel {
  // --- Shifts ---
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('shift', prefix)} ORDER BY shift_date ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, id) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('shift', prefix)} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmployeeId(prefix, employeeId) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('shift', prefix)} WHERE employee_id = $1 ORDER BY shift_date ASC`,
      [employeeId]
    );
    return rows;
  }

  async create(prefix, data) {
    const shiftTable = tableName('shift', prefix);
    const { employee_id, shift_date, start_time, end_time, location_name, notes } = data;

    const { rows } = await pool.query(
      `INSERT INTO ${shiftTable} 
      (employee_id, shift_date, start_time, end_time, location_name, notes)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [employee_id, shift_date, start_time, end_time, location_name || null, notes || null]
    );

    return rows[0];
  }

  async update(prefix, id, data) {
    const shiftTable = tableName('shift', prefix);
    const { employee_id, shift_date, start_time, end_time, location_name, notes } = data;

    const { rows } = await pool.query(
      `UPDATE ${shiftTable} 
       SET employee_id=$1, shift_date=$2, start_time=$3, end_time=$4, location_name=$5, notes=$6
       WHERE id=$7
       RETURNING *`,
      [employee_id, shift_date, start_time, end_time, location_name || null, notes || null, id]
    );

    return rows[0];
  }

  async delete(prefix, id) {
    const shiftTable = tableName('shift', prefix);
    const { rows } = await pool.query(
      `DELETE FROM ${shiftTable} WHERE id=$1 RETURNING *`,
      [id]
    );
    return rows[0];
  }
}
