import pool from "../../../loaders/db.loader.js";

const ReportModel = {
  async getFullReport(companyId) {
    try {
      // 1️⃣ Fetch customers and profiles
      const customersRes = await pool.query(
        `SELECT c.customer_id, cp.customer_type, cp.name, cp.contact_name, cp.contact_phone,
                cp.job_title, cp.email, cp.phone, cp.billing_address, cp.shipping_address,
                cp.tin_number, cp.photo_url, cp.gender, cp.birthday, cp.created_at, cp.updated_at
         FROM customers c
         LEFT JOIN customer_profiles cp
           ON c.company_id = cp.company_id AND c.customer_id = cp.customer_id
         WHERE c.company_id = $1
         ORDER BY c.customer_id`,
        [companyId]
      );
      const customers = customersRes.rows;

      // 2️⃣ Fetch leads, profiles, and attachments
      const leadsRes = await pool.query(
        `SELECT l.lead_id, l.customer_id, l.lead_type, l.name AS lead_name, l.primary_phone,
                l.email AS lead_email, l.address AS lead_address, l.contact_person_name,
                l.contact_person_number, l.contact_person_job, l.created_at AS lead_created_at,
                lp.id AS profile_id, lp.assigned_to, lp.lead_source, lp.referred_by,
                lp.status, lp.priority, lp.service_requested, lp.notes,
                lp.created_at AS profile_created_at, lp.updated_at AS profile_updated_at,
                la.id AS attachment_id, la.file_url, la.description AS attachment_description,
                la.uploaded_at
         FROM leads l
         LEFT JOIN leads_profile lp
           ON l.company_id = lp.company_id AND l.lead_id = lp.lead_id
         LEFT JOIN leads_attachments la
           ON l.company_id = la.company_id AND l.lead_id = la.lead_id
         WHERE l.company_id = $1
         ORDER BY l.lead_id, lp.updated_at DESC, la.uploaded_at ASC`,
        [companyId]
      );
      const leadsRows = leadsRes.rows;

      // Group leads by customer_id
      const leadsMap = {};
      for (const row of leadsRows) {
        if (!leadsMap[row.customer_id]) leadsMap[row.customer_id] = {};

        if (!leadsMap[row.customer_id][row.lead_id]) {
          leadsMap[row.customer_id][row.lead_id] = {
            lead_id: row.lead_id,
            lead_type: row.lead_type,
            lead_name: row.lead_name,
            primary_phone: row.primary_phone,
            email: row.lead_email,
            address: row.lead_address,
            contact_person_name: row.contact_person_name,
            contact_person_number: row.contact_person_number,
            contact_person_job: row.contact_person_job,
            created_at: row.lead_created_at,
            profiles: []
          };
        }

        // Add profile if exists
        if (row.profile_id) {
          let profile = leadsMap[row.customer_id][row.lead_id].profiles.find(p => p.profile_id === row.profile_id);
          if (!profile) {
            profile = {
              profile_id: row.profile_id,
              assigned_to: row.assigned_to,
              lead_source: row.lead_source,
              referred_by: row.referred_by,
              status: row.status,
              priority: row.priority,
              service_requested: row.service_requested,
              notes: row.notes,
              created_at: row.profile_created_at,
              updated_at: row.profile_updated_at,
              attachments: []
            };
            leadsMap[row.customer_id][row.lead_id].profiles.push(profile);
          }

          // Add attachment if exists
          if (row.attachment_id) {
            profile.attachments.push({
              id: row.attachment_id,
              file_url: row.file_url,
              description: row.attachment_description,
              uploaded_at: row.uploaded_at
            });
          }
        }
      }

      // 3️⃣ Fetch quotes and items
      const quotesRes = await pool.query(
        `SELECT q.quote_id, q.lead_id, q.service_inquired, q.discount_percent, q.tax_rate,
                q.expiration_date, q.internal_margin_percent, q.version, q.status, q.payment_terms,
                q.delivery_terms, q.created_at AS quote_created_at, q.updated_at AS quote_updated_at,
                qi.id AS item_id, qi.name AS item_name, qi.quantity, qi.unit_price, qi.description AS item_description,
                qia.id AS item_attachment_id, qia.file_url AS item_file_url, qia.file_type, qia.description AS item_attachment_description, qia.uploaded_at AS item_uploaded_at,
                qa.id AS quote_attachment_id, qa.file_url AS quote_file_url, qa.description AS quote_attachment_description, qa.uploaded_at AS quote_uploaded_at
         FROM quotes q
         LEFT JOIN quote_items qi
           ON q.company_id = qi.company_id AND q.quote_id = qi.quote_id
         LEFT JOIN quote_item_attachments qia
           ON qi.id = qia.quote_item_id
         LEFT JOIN quote_attachments qa
           ON q.company_id = qa.company_id AND q.quote_id = qa.quote_id
         WHERE q.company_id = $1
         ORDER BY q.quote_id, qi.id, qia.id, qa.id`,
        [companyId]
      );
      const quotesRows = quotesRes.rows;

      const quotesMap = {};
      for (const row of quotesRows) {
        if (!quotesMap[row.quote_id]) {
          quotesMap[row.quote_id] = {
            quote_id: row.quote_id,
            lead_id: row.lead_id,
            service_inquired: row.service_inquired,
            discount_percent: row.discount_percent,
            tax_rate: row.tax_rate,
            expiration_date: row.expiration_date,
            internal_margin_percent: row.internal_margin_percent,
            version: row.version,
            status: row.status,
            payment_terms: row.payment_terms,
            delivery_terms: row.delivery_terms,
            created_at: row.quote_created_at,
            updated_at: row.quote_updated_at,
            items: [],
            attachments: []
          };
        }

        // Attach items
        if (row.item_id) {
          let item = quotesMap[row.quote_id].items.find(i => i.id === row.item_id);
          if (!item) {
            item = {
              id: row.item_id,
              name: row.item_name,
              quantity: row.quantity,
              unit_price: row.unit_price,
              description: row.item_description,
              attachments: []
            };
            quotesMap[row.quote_id].items.push(item);
          }

          if (row.item_attachment_id) {
            item.attachments.push({
              id: row.item_attachment_id,
              file_url: row.item_file_url,
              file_type: row.file_type,
              description: row.item_attachment_description,
              uploaded_at: row.item_uploaded_at
            });
          }
        }

        // Attach quote-level attachments
        if (row.quote_attachment_id) {
          quotesMap[row.quote_id].attachments.push({
            id: row.quote_attachment_id,
            file_url: row.quote_file_url,
            description: row.quote_attachment_description,
            uploaded_at: row.quote_uploaded_at
          });
        }
      }

      // 4️⃣ Fetch orders and items
      const ordersRes = await pool.query(
        `SELECT o.order_id, o.quote_id, o.lead_id, o.status, o.order_date, o.delivery_date, o.total_amount,
                oi.id AS item_id, oi.product_name, oi.quantity, oi.unit_price, oi.description AS item_description
         FROM orders o
         LEFT JOIN order_items oi
           ON o.company_id = oi.company_id AND o.order_id = oi.order_id
         WHERE o.company_id = $1
         ORDER BY o.order_id, oi.id`,
        [companyId]
      );
      const ordersRows = ordersRes.rows;

      const ordersMap = {};
      for (const row of ordersRows) {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            quote_id: row.quote_id,
            lead_id: row.lead_id,
            status: row.status,
            order_date: row.order_date,
            delivery_date: row.delivery_date,
            total_amount: row.total_amount,
            items: []
          };
        }
        if (row.item_id) {
          ordersMap[row.order_id].items.push({
            id: row.item_id,
            product_name: row.product_name,
            quantity: row.quantity,
            unit_price: row.unit_price,
            description: row.item_description
          });
        }
      }

      return {
  customers,
  leads: Object.values(leadsMap).flatMap(obj => Object.values(obj)),
  quotes: Object.values(quotesMap),
  orders: Object.values(ordersMap)
};

    } catch (err) {
      console.error('Error generating report:', err);
      throw new Error('Could not generate report');
    }
  }
};

export default ReportModel;
