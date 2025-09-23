import pool from '../../../loaders/db.loader.js';

export default class CompanyModel {
  // CREATE
  static async createCompany(data) {
    const query = `
      INSERT INTO company_profiles
      (company_name, legal_name, registration_number, physical_address, default_currency,
       industry, business_model, pricing_tier, company_logo, tin_document, business_license, trade_license)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *;
    `;
    const values = [
      data.company_name, data.legal_name, data.registration_number, data.physical_address, data.default_currency,
      data.industry, data.business_model, data.pricing_tier, data.company_logo, data.tin_document, data.business_license, data.trade_license
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // READ ALL
  static async fetchAllCompanies() {
    const result = await pool.query('SELECT * FROM company_profiles ORDER BY created_at DESC');
    return result.rows;
  }

  // READ ONE
  static async fetchCompanyById(company_id) {
    const result = await pool.query('SELECT * FROM company_profiles WHERE company_id=$1', [company_id]);
    return result.rows[0];
  }

  // UPDATE
  static async updateCompany(company_id, data) {
    const setFields = [];
    const values = [];
    let idx = 1;

    for (let key in data) {
      if (data[key] !== undefined) {
        setFields.push(`${key}=$${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    const query = `
      UPDATE company_profiles
      SET ${setFields.join(', ')}, updated_at=NOW()
      WHERE company_id=$${idx}
      RETURNING *;
    `;
    values.push(company_id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // DELETE
  static async deleteCompany(company_id) {
    await pool.query('DELETE FROM company_profiles WHERE company_id=$1', [company_id]);
  }


  static async createUser(data) {
    const { company_id, name, email, phone, password, role } = data;
    const query = `
      INSERT INTO users
      (company_id, name, email, phone, password, role)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;
    const values = [company_id, name, email, phone, password, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createPayment(data) {
    const { company_id, billing_contact_name, billing_email, billing_address, payment_method, payment_details } = data;
    const query = `
      INSERT INTO payments
      (company_id, billing_contact_name, billing_email, billing_address, payment_method, payment_details)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;
    const values = [company_id, billing_contact_name, billing_email, billing_address, payment_method, payment_details];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createLocations(company_id, locations) {
    const query = `
      INSERT INTO locations (company_id, name, address, contact, operational_hours)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *;
    `;

    const results = [];
    for (let loc of locations) {
      const values = [company_id, loc.name, loc.address, loc.contact, loc.operational_hours];
      const res = await pool.query(query, values);
      results.push(res.rows[0]);
    }
    return results;
  }
}
