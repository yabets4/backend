import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class LeaveRequestModel {
  // --- Leave Requests ---
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('leave_requests', prefix)} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, id) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('leave_requests', prefix)} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmployeeId(prefix, employeeId) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('leave_requests', prefix)} 
       WHERE employee_id = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(prefix, data) {
    const leaveTable = tableName('leave_requests', prefix);
    const { employee_id, leave_type, start_date, end_date, reason, approver_comments, created_by } = data;

    const { rows } = await pool.query(
      `INSERT INTO ${leaveTable} 
      (employee_id, leave_type, start_date, end_date, reason, approver_comments, created_by) 
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [employee_id, leave_type, start_date, end_date, reason || null, approver_comments || null, created_by || null]
    );

    return rows[0];
  }

  async update(prefix, id, data) {
    const leaveTable = tableName('leave_requests', prefix);
    const { employee_id, leave_type, start_date, end_date, reason, approver_comments, created_by } = data;

    const { rows } = await pool.query(
      `UPDATE ${leaveTable} 
       SET employee_id=$1, leave_type=$2, start_date=$3, end_date=$4, reason=$5, approver_comments=$6, created_by=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, reason || null, approver_comments || null, created_by || null, id]
    );

    return rows[0];
  }

  async delete(prefix, id) {
    const leaveTable = tableName('leave_requests', prefix);
    const { rows } = await pool.query(
      `DELETE FROM ${leaveTable} WHERE id=$1 RETURNING *`,
      [id]
    );
    return rows[0];
  }


async approve(prefix, id, approver_comments) {
  const leaveTable = tableName('leave_requests', prefix);
  const { rows } = await pool.query(
    `UPDATE ${leaveTable}
     SET status='Approved', approver_comments=$1, updated_at=NOW()
     WHERE id=$2
     RETURNING *`,
    [approver_comments || null, id]
  );
  return rows[0];
}

async reject(prefix, id, approver_comments) {
  const leaveTable = tableName('leave_requests', prefix);
  const { rows } = await pool.query(
    `UPDATE ${leaveTable}
     SET status='Rejected', approver_comments=$1, updated_at=NOW()
     WHERE id=$2
     RETURNING *`,
    [approver_comments || null, id]
  );
  return rows[0];
}
}