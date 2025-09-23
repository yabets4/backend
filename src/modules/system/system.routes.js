import { Router } from 'express';
import ctrl from './system.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';

const r = Router();

r.use(auth(true));
r.use(tenant);

// Roles
r.get('/role', ctrl.getAllRoles);
r.get('/role/:roleId', ctrl.getRoleById);
r.post('/role', ctrl.createRole);
r.put('/role/:roleId', ctrl.updateRole);
r.delete('/role/:roleId', ctrl.deleteRole);

// RBAC
r.get('/role/user/:userId', ctrl.getRbacByUserId);
r.put('/role/assign/:userId', ctrl.assignRolesToUser);

// Users
r.get('/users', ctrl.getAllUsers);
r.get('/users/:userId', ctrl.getUserById);
r.post('/users', ctrl.createUser);
r.put('/users/:userId', ctrl.updateUser);
r.delete('/users/:userId', ctrl.removeUser);

export default r;
