// src/modules/systemAdmin/customers/customer.model.js
import pool from '../../../loaders/db.loader.js';

export const CustomersModel = {
  async findAll(companyId) {
  const result = await pool.query(
    `
    SELECT 
      c.id,
      c.customer_id,
      c.company_id,
      c.created_at,
      cp.customer_type,
      cp.name,
      cp.contact_name,
      cp.contact_phone,
      cp.job_title,
      cp.email,
      cp.phone,
      cp.billing_address,
      cp.shipping_address,
      cp.tin_number,
      cp.photo_url,
      cp.gender,
      cp.birthday
    FROM customers c
    LEFT JOIN customer_profiles cp 
      ON c.company_id = cp.company_id AND c.customer_id = cp.customer_id
    WHERE c.company_id = $1
    ORDER BY c.created_at DESC
    `,
    [companyId]
  );
  return result.rows;
},

async findById(companyId, customerId) {
  const result = await pool.query(
    `
    SELECT 
      c.id,
      c.customer_id,
      c.company_id,
      c.created_at,
      cp.customer_type,
      cp.name,
      cp.contact_name,
      cp.contact_phone,
      cp.job_title,
      cp.email,
      cp.phone,
      cp.billing_address,
      cp.shipping_address,
      cp.tin_number,
      cp.photo_url,
      cp.gender,
      cp.birthday
    FROM customers c
    LEFT JOIN customer_profiles cp 
      ON c.company_id = cp.company_id AND c.customer_id = cp.customer_id
    WHERE c.company_id = $1 
      AND c.customer_id = $2
    LIMIT 1
    `,
    [companyId, customerId]
  );
  return result.rows[0];
},


  async insert(companyId, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: Get next customer number
    const nextNumRes = await client.query(
      `UPDATE companies
       SET next_customer_number = next_customer_number + 1
       WHERE company_id = $1
       RETURNING next_customer_number`,
      [companyId]
    );
    const nextNum = nextNumRes.rows[0].next_customer_number;
    const customer_id = `CUS-${String(nextNum).padStart(2, "0")}`;

    // Step 2: Insert into customers
    const customerRes = await client.query(
      `INSERT INTO customers (company_id, customer_id)
       VALUES ($1, $2)
       RETURNING id, company_id, customer_id`,
      [companyId, customer_id]
    );
    const customer = customerRes.rows[0];

    // Step 3: Insert into customer_profiles with company_id for FK
    const profileRes = await client.query(
      `INSERT INTO customer_profiles (
        company_id, customer_id, customer_type, name, contact_name, contact_phone,
        job_title, email, phone, billing_address, shipping_address,
        tin_number, photo_url, gender, birthday
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        customer.company_id,
        customer.customer_id,
        data.customer_type || "Individual",
        data.name || "Unnamed",
        data.contact_name || null,
        data.contact_phone || null,
        data.job_title || null,
        data.email || null,
        data.phone || null,
        data.billing_address || null,
        data.shipping_address || null,
        data.tin_number || null,
        data.photo_url || null,
        data.gender || null,
        data.birthday || null,
      ]
    );

    await client.query("COMMIT");

    return { ...customer, latest_profile: profileRes.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
,


  async update(companyId, customerId, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sanitizedData = {};
    for (const key in data) {
      sanitizedData[key] = data[key] !== undefined ? data[key] : null;
    }

    const query = `
      INSERT INTO customer_profiles (
        company_id, customer_id,
        customer_type, name, email, phone, tin_number,
        billing_address, shipping_address, photo_url, gender, birthday,
        contact_name, contact_phone, job_title, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT (company_id, customer_id) DO UPDATE SET
        customer_type = EXCLUDED.customer_type,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        tin_number = EXCLUDED.tin_number,
        billing_address = EXCLUDED.billing_address,
        shipping_address = EXCLUDED.shipping_address,
        photo_url = EXCLUDED.photo_url,
        gender = EXCLUDED.gender,
        birthday = EXCLUDED.birthday,
        contact_name = EXCLUDED.contact_name,
        contact_phone = EXCLUDED.contact_phone,
        job_title = EXCLUDED.job_title,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      companyId,
      customerId,
      sanitizedData.customer_type || "Individual",
      sanitizedData.name || "Unnamed",
      sanitizedData.email || null,
      sanitizedData.phone || null,
      sanitizedData.tin_number || null,
      sanitizedData.billing_address || null,
      sanitizedData.shipping_address || null,
      sanitizedData.photo_url || null,
      sanitizedData.gender || null,
      sanitizedData.birthday || null,
      sanitizedData.contact_name || null,
      sanitizedData.contact_phone || null,
      sanitizedData.job_title || null,
    ];

    const { rows } = await client.query(query, values);
    await client.query("COMMIT");

    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
},


  async remove(companyId, customerId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get customer with profile before deletion
    const beforeDelete = await client.query(
      `
      SELECT 
        c.id,
        c.customer_id,
        c.company_id,
        c.created_at,
        cp.customer_type,
        cp.name,
        cp.contact_name,
        cp.contact_phone,
        cp.job_title,
        cp.email,
        cp.phone,
        cp.billing_address,
        cp.shipping_address,
        cp.tin_number,
        cp.photo_url,
        cp.gender,
        cp.birthday
      FROM customers c
      LEFT JOIN customer_profiles cp 
        ON c.customer_id = cp.customer_pk
      WHERE c.company_id = $1 AND c.customer_id = $2
      `,
      [companyId, customerId]
    );

    if (beforeDelete.rows.length === 0) {
      await client.query("ROLLBACK");
      return null; // no customer found
    }

    // Delete customer (profile auto-deletes due to cascade)
    await client.query(
      "DELETE FROM customers WHERE company_id = $1 AND customer_id = $2",
      [companyId, customerId]
    );

    await client.query("COMMIT");
    return beforeDelete.rows[0]; // return deleted record
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
},
};
