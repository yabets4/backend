import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../loaders/db.loader.js';   // your pg Pool
import { appConfig } from '../config/index.js';
import { ok, badRequest, unauthorized } from '../utils/apiResponse.js';

const r = Router();

r.post('/auth/login', async (req, res) => {
  const { company, email, password, gps } = req.body || {};
  if (!company || !email || !password || !gps) {
    return badRequest(res, 'company, email, password and gps required');
  }

  // Build tenant-specific table name
  const tableName = `${company.toLowerCase()}_users`;

  try {
    // Ensure table exists
    const checkTable = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [tableName]
    );
    if (!checkTable.rows[0].exists) {
      return badRequest(res, `Unknown company: ${company}`);
    }

    // Fetch user
    const result = await pool.query(
      `SELECT id, email, password, role FROM ${tableName} WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return unauthorized(res, 'User not found');

    // TEMP: plain-text password check
    if (user.password !== password) return unauthorized(res, 'Invalid credentials');
    console.log('Input password:', password);
    console.log('DB password:', user.password);


    // Create JWT
    const token = jwt.sign(
      {
        sub: user.email,
        roles: [user.role],
        tenantPrefix: company.toLowerCase(),
      },
      appConfig.jwtSecret,
      { expiresIn: '12h' }
    );

    // Save session in DB
    await pool.query(
      `INSERT INTO login_sessions (email, company, role, gps_lat, gps_lon)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.email, company.toLowerCase(), user.role, gps.lat, gps.lon]
    );

    // Respond with token + session data
    return ok(res, {
      token,
      company: company.toLowerCase(),
      role: user.role,
      gps,
    });
  } catch (err) {
    console.error('Login error:', err);
    return badRequest(res, 'Login failed');
  }
});

export default r;
