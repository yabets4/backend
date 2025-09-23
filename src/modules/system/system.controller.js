import * as srv from './rbac.service.js';
import { ok } from '../../utils/apiResponse.js';

export default {
  // --- USERS ---
  getAllUsers: async (req, res, next) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const users = await srv.getAllUsers(req.tenantPrefix, limit, offset);
      console.log(users);
      
      return ok(res, users);
    } catch (e) { next(e); }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await srv.getUserById(req.tenantPrefix, req.params.userId);
      return ok(res, user);
    } catch (e) { next(e); }
  },

  createUser: async (req, res, next) => {
    try {
      const created = await srv.createUser(req.tenantPrefix, req.body);
      return ok(res, created);
    } catch (e) { next(e); }
  },

  updateUser: async (req, res, next) => {
    try {
      const updated = await srv.updateUser(req.tenantPrefix, req.params.userId, req.body);
      return ok(res, updated);
    } catch (e) { next(e); }
  },

  removeUser: async (req, res, next) => {
    try {
      await srv.removeUser(req.tenantPrefix, req.params.userId);
      return ok(res, null); // or return ok(res, { message: "User removed" })
    } catch (e) { next(e); }
  },


  // --- ROLES ---
  getAllRoles: async (req, res, next) => {
    try {
      const roles = await srv.getAllRoles(req.tenantPrefix);
      return ok(res, roles);
    } catch (e) { next(e); }
  },

  getRoleById: async (req, res, next) => {
    try {
      const role = await srv.getRoleById(req.tenantPrefix, req.params.roleId);
      return ok(res, role);
    } catch (e) { next(e); }
  },

createRole: async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const created = await srv.createRole(req.tenantPrefix, name, permissions);
    return ok(res, created);
  } catch (e) {
    next(e);
  }
},


updateRole: async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const updated = await srv.updateRole(req.tenantPrefix, req.params.roleId, name, permissions);
    return ok(res, updated);
  } catch (e) {
    next(e);
  }
},

    deleteRole: async (req, res, next) => {
    try {
      const prefix = req.tenantPrefix;
      const roleId = req.params.roleId;
      await srv.deleteRole(prefix, roleId);
      return ok(res, null); // role removed
    } catch (e) {
      next(e);
    }
  },

  // --- PERMISSIONS ---
  getAllPermissions: async (req, res, next) => {
    try {
      const permissions = await srv.getAllPermissions(req.tenantPrefix);
      return ok(res, permissions);
    } catch (e) { next(e); }
  },

  getPermissionById: async (req, res, next) => {
    try {
      const perm = await srv.getPermissionById(req.tenantPrefix, req.params.permissionId);
      return ok(res, perm);
    } catch (e) { next(e); }
  },

  createPermission: async (req, res, next) => {
    try {
      const created = await srv.createPermission(req.tenantPrefix, req.body);
      return ok(res, created);
    } catch (e) { next(e); }
  },

  updatePermission: async (req, res, next) => {
    try {
      const updated = await srv.updatePermission(req.tenantPrefix, req.params.permissionId, req.body);
      return ok(res, updated);
    } catch (e) { next(e); }
  },

  removePermission: async (req, res, next) => {
    try {
      await srv.removePermission(req.tenantPrefix, req.params.permissionId);
      return ok(res, null); // or ok(res, { message: "Permission removed" })
    } catch (e) { next(e); }
  },
  assignRolesToUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const { roles } = req.body; // array of role IDs

      if (!userId) return badRequest(res, 'User ID is required');
      if (!Array.isArray(roles)) return badRequest(res, 'Roles must be an array');

      // Service converts IDs → names and updates RBAC
      const updatedRbac = await srv.addOrUpdateRbac(req.tenantPrefix, userId, roles);

      return ok(res, updatedRbac);
    } catch (e) {
      next(e);
    }
  },

  getRbacByUserId: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      if (!userId) return badRequest(res, 'User ID is required');

      const record = await srv.getRbacByUserId(req.tenantPrefix, userId);
      return ok(res, record || null);
    } catch (e) {
      next(e);
    }
  },


};