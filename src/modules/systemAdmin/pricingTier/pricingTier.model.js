import pool from '../../../loaders/db.loader.js';

export default class PricingTierModel {
  // CREATE a new tier
  static async createPricingTier(data) {
    try {
      const tierIdResult = await pool.query(`
        SELECT 'tier-' || LPAD(
          (COALESCE(MAX(CAST(SPLIT_PART(tier_id,'-',2) AS INT)), 0) + 1)::text,
          2,
          '0'
        ) AS next_tier_id
        FROM pricing_tiers
      `);
      const tier_id = tierIdResult.rows[0].next_tier_id;

      const versionResult = await pool.query(`
        SELECT COALESCE(MAX(version), 0) + 1 AS next_version
        FROM pricing_tiers
      `);
      const version = versionResult.rows[0].next_version;

      const now = new Date();
      const query = `
        INSERT INTO pricing_tiers
        (tier_id, name, monthly_price, annual_price, included_users, total_customer, total_leads, version, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *;
      `;
      const values = [
        tier_id,
        data.name,
        data.monthly_price || 0,
        data.annual_price || 0,
        data.included_users || 1,
        data.total_customer || 0,
        data.total_leads || 0,
        version,
        now,
        now
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error("Error in createPricingTier:", err);
      throw err;
    }
  }

  // READ ALL tiers
  static async fetchAllPricingTiers() {
    try {
      const result = await pool.query('SELECT * FROM pricing_tiers ORDER BY created_at DESC');
      return result.rows;
    } catch (err) {
      console.error("Error in fetchAllPricingTiers:", err);
      throw err;
    }
  }

  // READ latest version of a tier
  static async fetchPricingTierById(tier_id) {
    try {
      const result = await pool.query(`
        SELECT * FROM pricing_tiers
        WHERE tier_id=$1
        ORDER BY version DESC
        LIMIT 1
      `, [tier_id]);
      return result.rows[0];
    } catch (err) {
      console.error("Error in fetchPricingTierById:", err);
      throw err;
    }
  }

  // UPDATE tier (creates new row with same tier_id)
  static async updatePricingTier(tier_id, data) {
    try {
      const versionResult = await pool.query(`
        SELECT COALESCE(MAX(version), 0) + 1 AS next_version
        FROM pricing_tiers
        WHERE tier_id=$1
      `, [tier_id]);
      const version = versionResult.rows[0].next_version;

      const columns = ['tier_id'];
      const values = [tier_id];
      const placeholders = ['$1'];
      let idx = 2;

      for (const key in data) {
        if (data[key] !== undefined) {
          columns.push(key);
          values.push(data[key]);
          placeholders.push(`$${idx}`);
          idx++;
        }
      }

      columns.push('version', 'created_at', 'updated_at');
      const now = new Date();
      values.push(version, now, now);
      placeholders.push(`$${idx}`, `$${idx+1}`, `$${idx+2}`);

      const query = `
        INSERT INTO pricing_tiers (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *;
      `;
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error("Error in updatePricingTier:", err);
      throw err;
    }
  }

  // DELETE all versions of a tier
  static async deletePricingTier(tier_id) {
    try {
      await pool.query('DELETE FROM pricing_tiers WHERE tier_id=$1', [tier_id]);
    } catch (err) {
      console.error("Error in deletePricingTier:", err);
      throw err;
    }
  }
}
