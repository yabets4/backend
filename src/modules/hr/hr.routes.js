import { Router } from 'express';
import EmployeeController from './employee/employee.routes.js';
import selfRoutes from './self/self.route.js';
import leaveRequestRoutes from './Leave Request/leaveRequest.routes.js';
import AssignedToolController from './assigned Tool/assignedTool.controller.js';
import Attendance from "./attendance/attendance.routes.js"
import ShiftController from './shift/shift.controller.js';
import auth from '../../middleware/auth.middleware.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import auditRoutes from './AuditLog/auditLog.route.js';

const r = Router();
r.use(auth(true), authenticateJWT);


r.use('/employee', EmployeeController);
r.use('/attendance', Attendance)
// current user profile (self)
r.use('/self', selfRoutes);

// Audit logs
r.use('/audit', auditRoutes);

// --- attendance ---


// --- shift ---
r.get('/shift', ShiftController.list);
r.get('/shift/:id', ShiftController.get);
r.get('/shift/employee/:employeeId', ShiftController.getByEmployee);
r.post('/shift', ShiftController.create);
r.put('/shift/:id', ShiftController.update);
r.delete('/shift/:id', ShiftController.delete);

// --- leave-request ---
r.use('/leave-request', leaveRequestRoutes);

// --- assigned-tools ---
r.get('/assigned-tools', AssignedToolController.getAll);
r.get('/assigned-tools/:id', AssignedToolController.getById);
r.post('/assigned-tools', AssignedToolController.create);
r.put('/assigned-tools/:id', AssignedToolController.update);
r.delete('/assigned-tools/:id', AssignedToolController.delete);


export default r;
