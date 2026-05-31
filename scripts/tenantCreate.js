/**
 * Create a new tenant: run migrations & optional seeding.
 * Usage: node scripts/tenantCreate.js abebe --seed
 */
import { spawn } from 'child_process';

const TENANT_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,30}$/;

const tenant = process.argv[2];
const seed = process.argv.includes('--seed');
if (!tenant) {
  console.error('Usage: node scripts/tenantCreate.js <tenantPrefix> [--seed]');
  process.exit(1);
}
if (!TENANT_RE.test(tenant)) {
  console.error('Tenant prefix must match ^[a-zA-Z][a-zA-Z0-9_]{0,30}$ (alphanumeric + underscore, starts with letter, max 31 chars)');
  process.exit(1);
}

// tenant is validated against TENANT_RE before this line — safe to use
const run = (cmd, args=[]) => {
  // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
  const childProcess = spawn(cmd, args, { stdio: 'inherit' });
  return new Promise((res, rej)=>{
    childProcess.on('close', code => code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`)));
  });
};

(async ()=>{
  await run('node', ['scripts/migrate.js', tenant]);
  if (seed) await run('node', ['scripts/seed.js', tenant]);
  console.log(`Tenant ${tenant} is ready`);
})();
