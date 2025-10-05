import pool from "../../loaders/db.loader.js"; // or whatever DB wrapper you use

export async function getCompanyNameById(companyID) {
  const { rows } = await pool.query('SELECT company_name FROM companies WHERE company_id = $1', [companyID]);
  return rows[0]?.name || null;
}
