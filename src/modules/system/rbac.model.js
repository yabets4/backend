// src/modules/system/rbac.model.js
import pool from '../../loaders/db.loader.js';
import { tableName } from '../../utils/prefix.utils.js';

export default class RbacModel {
  constructor() {}

  // --- RBAC ---
  async findRbacByUserId(prefix, userId) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('rbac', prefix)} WHERE user_id=$1`,
      [userId]
    );
    return rows[0] || null;
  }

  async upsertRbac(prefix, userId, roles = []) {
    const roleNames = roles.map(r => String(r));
    const existing = await this.findRbacByUserId(prefix, userId);

    if (existing) {
      const { rows } = await pool.query(
        `UPDATE ${tableName('rbac', prefix)}
         SET roles=$1 WHERE id=$2 RETURNING *`,
        [JSON.stringify(roleNames), existing.id]
      );
      return rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO ${tableName('rbac', prefix)} (user_id, roles)
         VALUES ($1, $2) RETURNING *`,
        [userId, JSON.stringify(roleNames)]
      );
      return rows[0];
    }
  }

  // --- Roles table helpers ---
  async findRoles(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('roles', prefix)} ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findRoleById(prefix, roleId) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('roles', prefix)} WHERE id=$1`,
      [roleId]
    );
    return rows[0] || null;
  }

  async createRole(prefix, { name, permissions = [] }) {
    const { rows } = await pool.query(
      `INSERT INTO ${tableName('roles', prefix)} (name, permissions)
       VALUES ($1, $2) RETURNING *`,
      [name, JSON.stringify(permissions)]
    );
    return rows[0];
  }

  async updateRole(prefix, roleId, { name, permissions = [] }) {
    const { rows } = await pool.query(
      `UPDATE ${tableName('roles', prefix)}
       SET name=$1, permissions=$2 WHERE id=$3 RETURNING *`,
      [name, JSON.stringify(permissions), roleId]
    );
    return rows[0] || null;
  }

  async removeRole(prefix, roleId) {
    await pool.query(
      `DELETE FROM ${tableName('roles', prefix)} WHERE id=$1`,
      [roleId]
    );
    return true;
  }
  
  // --- ROLES ---
  async findRoles(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('roles', prefix)} ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findRoleById(prefix, roleId) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('roles', prefix)} WHERE id=$1`,
      [roleId]
    );
    return rows[0] || null;
  }

  async createRole(prefix, { name, permissions = [] }) {
    const { rows } = await pool.query(
      `INSERT INTO ${tableName('roles', prefix)} (name, permissions)
      VALUES ($1, $2) RETURNING *`,
      [name, JSON.stringify(permissions)]
    );
    return rows[0];
  }

  async updateRole(prefix, roleId, { name, permissions = [] }) {
    const { rows } = await pool.query(
      `UPDATE ${tableName('roles', prefix)}
       SET name=$1, permissions=$2 WHERE id=$3 RETURNING *`,
      [name, JSON.stringify(permissions), roleId]
    );
    return rows[0] || null;
  }

  async removeRole(prefix, roleId) {
    await pool.query(`DELETE FROM ${tableName('roles', prefix)} WHERE id=$1`, [roleId]);
    return true;
  }

  // --- USERS ---
  async findUsers(prefix, { limit = 50, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('users', prefix)} ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findUserById(prefix, id) {
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName('users', prefix)} WHERE id=$1`,
      [id]
    );
    return rows[0] || null;
  }

  async createUser(prefix, payload) {
    const keys = Object.keys(payload);
    const cols = keys.map(k => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO ${tableName('users', prefix)} (${cols}) VALUES (${params}) RETURNING *`,
      Object.values(payload)
    );
    return rows[0];
  }

  async updateUser(prefix, id, payload) {
    const keys = Object.keys(payload);
    const set = keys.map((k, i) => `"${k}"=$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE ${tableName('users', prefix)} SET ${set} WHERE id=$${keys.length + 1} RETURNING *`,
      [...Object.values(payload), id]
    );
    return rows[0] || null;
  }

  async removeUser(prefix, id) {
    await pool.query(`DELETE FROM ${tableName('users', prefix)} WHERE id=$1`, [id]);
    return true;
  }
}
