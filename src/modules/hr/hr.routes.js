import { Router } from 'express';
import EmployeeController from './employee/employee.routes.js';
import LeaveRequestController from './Leave Request/leaveRequest.controller.js';
import AssignedToolController from './assigned Tool/assignedTool.controller.js';
import Attendance from "./attendance/attendance.routes.js"
import ShiftController from './shift/shift.controller.js';
import auth from '../../middleware/auth.middleware.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import permission from '../../middleware/permission.middleware.js';

const r = Router();
r.use(auth(true), authenticateJWT);


r.use('/employee', EmployeeController);
r.use('/attendance', Attendance)

// --- attendance ---


// --- shift ---
r.get('/shift', ShiftController.getAll);
r.get('/shift/:id', ShiftController.getById);
r.get('/shift/employee/:employeeId', ShiftController.getByEmployee);
r.post('/shift', ShiftController.create);
r.put('/shift/:id', ShiftController.update);
r.delete('/shift/:id', ShiftController.delete);

// --- leave-request ---
r.get('/leave-request', LeaveRequestController.getAll);
r.get('/leave-request/:id', LeaveRequestController.getById);
r.get('/leave-request/employee/:employeeId', LeaveRequestController.getByEmployee);
r.post('/leave-request/:id/approve', LeaveRequestController.approve);
r.post('/leave-request/:id/reject', LeaveRequestController.reject);
r.post('/leave-request', LeaveRequestController.create);
r.put('/leave-request/:id', LeaveRequestController.update);
r.delete('/leave-request/:id', LeaveRequestController.delete);

// --- assigned-tools ---
r.get('/assigned-tools', AssignedToolController.getAll);
r.get('/assigned-tools/:id', AssignedToolController.getById);
r.post('/assigned-tools', AssignedToolController.create);
r.put('/assigned-tools/:id', AssignedToolController.update);
r.delete('/assigned-tools/:id', AssignedToolController.delete);


export default r;
