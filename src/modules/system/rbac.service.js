// src/modules/system/rbac.service.js
import RbacModel from './rbac.model.js';

const rbacModel = new RbacModel();

// --- Roles ---
export const getAllRoles = async (prefix, limit = 50, offset = 0) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.findRoles(prefix, { limit, offset });
};

export const getRoleById = async (prefix, roleId) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.findRoleById(prefix, roleId);
};

export const createRole = async (prefix, name, permissions = []) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.createRole(prefix, { name, permissions });
};


export const updateRole = async (prefix, roleId, name, permissions = []) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.updateRole(prefix, roleId, { name, permissions });
};

export const deleteRole = async (prefix, roleId) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.removeRole(prefix, roleId);
};

// --- RBAC (user → role assignments) ---
export const getRbacByUserId = async (prefix, userId) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.findRbacByUserId(prefix, userId);
};

export const addOrUpdateRbac = async (prefix, userId, roleIds = []) => {
  if (!prefix) throw new Error('Tenant prefix is required');

  // Convert role IDs → role names using the internal RbacModel
  const roleNames = [];
  for (const id of roleIds) {
    const role = await rbacModel.findRoleById(prefix, id);
    if (role) roleNames.push(role.name);
  }

  // Upsert RBAC record with role names
  return rbacModel.upsertRbac(prefix, userId, roleNames);
}


// --- Users ---
export const getAllUsers = async (prefix, limit = 50, offset = 0) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.findUsers(prefix, { limit, offset });
};

export const getUserById = async (prefix, userId) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.findUserById(prefix, userId);
};

export const createUser = async (prefix, payload) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.createUser(prefix, payload);
};

export const updateUser = async (prefix, userId, payload) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.updateUser(prefix, userId, payload);
};

export const deleteUser = async (prefix, userId) => {
  if (!prefix) throw new Error('Tenant prefix is required');
  return rbacModel.removeUser(prefix, userId);
};
