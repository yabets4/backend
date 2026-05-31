import pool from '../src/loaders/db.loader.js';

async function seed(prefix) {
  // Validate prefix to prevent SQL injection (same pattern as migrate.js)
  if (!/^[a-zA-Z][a-zA-Z0-9_]{0,30}$/.test(prefix)) {
    throw new Error('Invalid tenant prefix');
  }
  await pool.query(`INSERT INTO ${prefix}_products (name, sku, price, stock)
                    VALUES ('Sample Product','SKU-1', 9.99, 100)
                    ON CONFLICT DO NOTHING;`);
  await pool.query(`INSERT INTO ${prefix}_customers (name, email, phone)
                    VALUES ('First Customer','first@demo.com','+251900000000');`);
}

const tenant = process.argv[2];
if (!tenant) { console.error('Usage: node scripts/seed.js <tenantPrefix>'); process.exit(1); }
seed(tenant.toLowerCase())
  .then(()=>{ console.log('Seeded for', tenant); process.exit(0); })
  .catch((e)=>{ console.error(e); process.exit(1); });
