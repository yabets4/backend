/**
 * Create a new tenant: run migrations & optional seeding.
 * Usage: node scripts/tenantCreate.js abebe --seed
 */
import { spawn } from 'child_process';

const tenant = process.argv[2];
const seed = process.argv.includes('--seed');
if (!tenant) {
  console.error('Usage: node scripts/tenantCreate.js <tenantPrefix> [--seed]');
  process.exit(1);
}

const run = (cmd, args=[]) => new Promise((res, rej)=>{
  const p = spawn(cmd, args, { stdio: 'inherit' });
  p.on('close', code => code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`)));
});

(async ()=>{
  await run('node', ['scripts/migrate.js', tenant]);
  if (seed) await run('node', ['scripts/seed.js', tenant]);
  console.log(`Tenant ${tenant} is ready`);
})();
