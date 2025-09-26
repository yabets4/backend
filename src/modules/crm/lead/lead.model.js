import pool from "../../../loaders/db.loader.js";

export const LeadsModel = {
  // --- Helper to fetch attachments for multiple lead_ids ---
  async _fetchAttachments(leadIds) {
    if (!leadIds.length) return {};
    const result = await pool.query(
      `SELECT * FROM leads_attachments WHERE lead_id = ANY($1::text[]) ORDER BY uploaded_at DESC`,
      [leadIds]
    );
    const map = {};
    result.rows.forEach(row => {
      if (!map[row.lead_id]) map[row.lead_id] = [];
      map[row.lead_id].push(row);
    });
    return map;
  },

  // --- Fetch all leads with attachments ---
  async findAll(companyId) {
    const result = await pool.query(
      `
      SELECT 
        l.lead_id,
        l.company_id,
        l.created_at,
        lp.lead_type,
        lp.name,
        lp.primary_phone,
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
        lp.created_at as profile_created_at,
        lp.updated_at as profile_updated_at
      FROM leads l
      LEFT JOIN leads_profile lp 
        ON l.lead_id = lp.lead_id
      WHERE l.company_id = $1
      ORDER BY l.created_at DESC
      `,
      [companyId]
    );

    const leads = result.rows;
    const leadIds = leads.map(l => l.lead_id);
    const attachmentsMap = await this._fetchAttachments(leadIds);

    // Attach files to each lead
    return leads.map(lead => ({
      ...lead,
      attachments: attachmentsMap[lead.lead_id] || []
    }));
  },

  // --- Fetch single lead with attachments ---
  async findById(companyId, leadId) {
    const result = await pool.query(
      `
      SELECT 
        l.lead_id,
        l.company_id,
        l.created_at,
        lp.*
      FROM leads l
      LEFT JOIN leads_profile lp 
        ON l.lead_id = lp.lead_id
      WHERE l.company_id = $1 AND l.lead_id = $2
      LIMIT 1
      `,
      [companyId, leadId]
    );

    if (!result.rows.length) return null;

    const lead = result.rows[0];
    const attachments = await this._fetchAttachments([leadId]);
    return { ...lead, attachments: attachments[leadId] || [] };
  },

  // --- Insert lead + attachments together ---
  async insert(companyId, data, attachments = []) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if phone already exists for this company
    const exists = await client.query(
      `SELECT 1 
       FROM leads_profile lp
       JOIN leads l ON lp.lead_id = l.lead_id
       WHERE l.company_id = $1 AND lp.primary_phone = $2`,
      [companyId, data.primary_phone]
    );

    if (exists.rowCount > 0) {
      await client.query("ROLLBACK");
      return null; // phone exists, do not create lead
    }

    // Increment next_lead_number
    const nextNumRes = await client.query(
      `UPDATE companies
       SET next_lead_number = next_lead_number + 1
       WHERE company_id = $1
       RETURNING next_lead_number`,
      [companyId]
    );

    const lead_id = `LEAD-${String(nextNumRes.rows[0].next_lead_number).padStart(2, "0")}`;

    // Insert into leads
    const leadRes = await client.query(
      `INSERT INTO leads (lead_id, company_id)
       VALUES ($1, $2)
       RETURNING lead_id, company_id, created_at`,
      [lead_id, companyId]
    );
    const lead = leadRes.rows[0];

    // Insert profile
    const profileRes = await client.query(
      `INSERT INTO leads_profile (
        lead_id, lead_type, name, primary_phone, email, address,
        contact_person_name, contact_person_email, contact_person_job,
        assigned_to, lead_source, referred_by, status, priority,
        service_requested, notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        lead_id,
        data.lead_type,
        data.name,
        data.primary_phone,
        data.email,
        data.address,
        data.contact_person_name,
        data.contact_person_email,
        data.contact_person_job,
        data.assigned_to,
        data.lead_source,
        data.referred_by,
        data.status || "New",
        data.priority || "Medium",
        data.service_requested,
        data.notes || null,
      ]
    );

    // Insert attachments if any
    const insertedAttachments = [];
    for (const att of attachments) {
      const attRes = await client.query(
        `INSERT INTO leads_attachments (lead_id, file_url, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [lead_id, att.file_url, att.description || null]
      );
      insertedAttachments.push(attRes.rows[0]);
    }

    await client.query("COMMIT");

    return { ...lead, latest_profile: profileRes.rows[0], attachments: insertedAttachments };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
,

  // --- Update lead + attachments ---
  async update(companyId, leadId, data, newAttachments = [], existingAttachments = []) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update lead profile
    const profileRes = await client.query(
      `UPDATE leads_profile
       SET
         lead_type = COALESCE($1, lead_type),
         name = COALESCE($2, name),
         primary_phone = COALESCE($3, primary_phone),
         email = COALESCE($4, email),
         address = COALESCE($5, address),
         contact_person_name = COALESCE($6, contact_person_name),
         contact_person_email = COALESCE($7, contact_person_email),
         contact_person_job = COALESCE($8, contact_person_job),
         assigned_to = COALESCE($9, assigned_to),
         lead_source = COALESCE($10, lead_source),
         referred_by = COALESCE($11, referred_by),
         status = COALESCE($12, status),
         priority = COALESCE($13, priority),
         service_requested = COALESCE($14, service_requested),
         notes = COALESCE($15, notes),
         updated_at = CURRENT_TIMESTAMP
       WHERE lead_id = $16
       RETURNING *`,
      [
        data.lead_type,
        data.name,
        data.primary_phone,
        data.email,
        data.address,
        data.contact_person_name,
        data.contact_person_email,
        data.contact_person_job,
        data.assigned_to,
        data.lead_source,
        data.referred_by,
        data.status,
        data.priority,
        data.service_requested,
        data.notes,
        leadId,
      ]
    );

    // Update existing attachments
    for (const att of existingAttachments) {
      await client.query(
        `UPDATE leads_attachments SET description=$1 WHERE id=$2 AND lead_id=$3`,
        [att.description || null, att.id, leadId]
      );
    }

    // Insert new attachments
    for (const att of newAttachments) {
      await client.query(
        `INSERT INTO leads_attachments (lead_id, file_url, description)
         VALUES ($1, $2, $3)`,
        [leadId, att.file_url, att.description || null]
      );
    }

    await client.query("COMMIT");

    // Fetch all attachments including existing ones
    const allAttachments = await this._fetchAttachments([leadId]);

    return { ...profileRes.rows[0], attachments: allAttachments[leadId] || [] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
},

  // --- Delete lead (attachments cascade automatically via FK) ---
  async remove(companyId, leadId) {
    const result = await pool.query(
      `DELETE FROM leads
       WHERE company_id = $1 AND lead_id = $2
       RETURNING *`,
      [companyId, leadId]
    );
    return result.rows[0];
  }
};
