import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class LeadModel {
  // --- Leads ---
  async findAll(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('leads', prefix)} ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(prefix, leadId) {
    const leadsTable = tableName('leads', prefix);

    const { rows } = await pool.query(
      `SELECT * FROM ${leadsTable} WHERE lead_id = $1`,
      [leadId]
    );
    if (!rows.length) return null;
    return rows[0];
  }

  async create(prefix, data) {
    const leadsTable = tableName('leads', prefix);

    const {
      lead_id, lead_type, first_name, last_name,
      contact_person_name, contact_person_email, contact_person_job_title,
      phone, address, assigned_to, lead_source, referred_by,
      status, priority, service_requested, notes, attachments
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO ${leadsTable}
      (lead_id, lead_type, first_name, last_name,
      contact_person_name, contact_person_email, contact_person_job_title,
      phone, address, assigned_to, lead_source, referred_by,
      status, priority, service_requested, notes, attachments)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        lead_id, lead_type, first_name, last_name,
        contact_person_name, contact_person_email, contact_person_job_title,
        phone, address, assigned_to, lead_source, referred_by,
        status, priority, service_requested, notes, attachments
      ]
    );
    return rows[0];
  }

  async update(prefix, leadId, data) {
    const leadsTable = tableName('leads', prefix);

    // Dynamically build SET clause
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (!fields.length) return null;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const { rows } = await pool.query(
      `UPDATE ${leadsTable} SET ${setClause}, updated_at = NOW() WHERE lead_id = $${fields.length + 1} RETURNING *`,
      [...values, leadId]
    );

    return rows[0];
  }

  async delete(prefix, leadId) {
    const leadsTable = tableName('leads', prefix);

    const { rowCount } = await pool.query(
      `DELETE FROM ${leadsTable} WHERE lead_id = $1`,
      [leadId]
    );

    return rowCount > 0;
  }
}
