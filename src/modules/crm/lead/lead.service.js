import LeadModel from './lead.model.js';
import pool from '../../../loaders/db.loader.js';
import { tableName } from '../../../utils/prefix.utils.js';

export default class LeadService {
  constructor() {
    this.model = new LeadModel();
  }

  async getAllLeads(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getLeadById(prefix, leadId) {
    return await this.model.findById(prefix, leadId);
  }

  async createLead(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateLead(prefix, leadId, data) {
    return await this.model.update(prefix, leadId, data);
  }

  async deleteLead(prefix, leadId) {
    return await this.model.delete(prefix, leadId);
  }

  async exportLeadToCustomer(prefix, leadId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lead = await this.model.findById(prefix, leadId);
      if (!lead) throw new Error('Lead not found');

      const customersTable = tableName('customers', prefix);

      // Map lead fields → customer fields
      let customerName = lead.lead_type === 'Company'
        ? lead.contact_person_name || lead.first_name + ' ' + (lead.last_name || '')
        : lead.first_name + ' ' + (lead.last_name || '');

      const { rows } = await client.query(
        `INSERT INTO ${customersTable}
        (customer_id, customer_type, name, contact_name, phone, address, tin_number, created_at, updated_at)
        VALUES (
          concat('CUST-', lpad(nextval(pg_get_serial_sequence('${customersTable}','id'))::text, 4, '0')),
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
        RETURNING *`,
        [
          lead.lead_type,
          customerName,
          lead.contact_person_name || null,
          lead.phone,
          lead.address,
          null // tin_number optional, maybe from lead.notes or custom field
        ]
      );

      // Optionally update lead status
      await this.model.update(prefix, leadId, { status: 'Converted' });

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
