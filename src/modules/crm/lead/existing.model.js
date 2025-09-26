import pool from "../../../loaders/db.loader.js";

const ContactsModel = {
  // ======== Leads ========
  async findAllLeads(companyId) {
    const result = await pool.query(
      `
      SELECT 
        l.lead_id AS id,
        'lead' AS type,
        l.company_id,
        l.created_at,
        lp.lead_type AS category,
        lp.name,
        lp.primary_phone AS phone,
        lp.email,
        lp.address,
        lp.contact_person_name,
        lp.contact_person_email,
        lp.contact_person_job,
        lp.assigned_to,
        lp.lead_source,
        lp.referred_by,
        lp.status,
        lp.priority,
        lp.service_requested,
        lp.notes,
        lp.created_at AS profile_created_at,
        lp.updated_at AS profile_updated_at
      FROM leads l
      LEFT JOIN leads_profile lp 
        ON l.lead_id = lp.lead_id
      WHERE l.company_id = $1
      ORDER BY l.created_at DESC
      `,
      [companyId]
    );

    const leads = result.rows;
    const leadIds = leads.map(l => l.id);
    const attachmentsMap = await this._fetchLeadAttachments(leadIds);

    return leads.map(lead => ({
      ...lead,
      attachments: attachmentsMap[lead.id] || []
    }));
  },

  async _fetchLeadAttachments(leadIds) {
    if (!leadIds.length) return {};

    const result = await pool.query(
      `SELECT * FROM leads_attachments WHERE lead_id = ANY($1::text[])`,
      [leadIds]
    );

    const map = {};
    for (const att of result.rows) {
      if (!map[att.lead_id]) map[att.lead_id] = [];
      map[att.lead_id].push(att);
    }
    return map;
  },

  // ======== Customers ========
  async findAllCustomers(companyId) {
    const result = await pool.query(
      `
      SELECT 
        c.customer_id AS id,
        'customer' AS type,
        c.company_id,
        c.created_at,
        cp.customer_type AS category,
        cp.name,
        cp.contact_name,
        COALESCE(cp.contact_phone, cp.phone) AS phone,
        cp.job_title,
        cp.email,
        cp.billing_address,
        cp.shipping_address,
        cp.tin_number,
        cp.photo_url,
        cp.gender,
        cp.birthday
      FROM customers c
      LEFT JOIN customer_profiles cp 
        ON c.customer_id = cp.customer_pk
      WHERE c.company_id = $1
      ORDER BY c.created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  },

  // ======== Merge Leads + Customers ========
  async findAllContacts(companyId) {
    const [leads, customers] = await Promise.all([
      this.findAllLeads(companyId),
      this.findAllCustomers(companyId)
    ]);

    // Merge and sort by created_at descending
    const contacts = [...leads, ...customers].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return contacts;
  }
};

module.exports = ContactsModel;
