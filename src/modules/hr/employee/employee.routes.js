import { Router } from 'express';
import EmployeeController from './employee.controller.js';
import auth from '../../../middleware/auth.middleware.js';
import { uploadEmployeePhoto } from '../../../middleware/multer.middleware.js';

const r = Router();
r.use(auth(true));

// use .fields so multiple files can be uploaded in one request
const employeeUploads = uploadEmployeePhoto.fields([
  { name: 'profile_photo_attachment', maxCount: 1 },
  { name: 'national_id_attachment', maxCount: 1 }
]);

r.get('/',  EmployeeController.getAll);
r.get('/:id',  EmployeeController.getById);
r.get('/:id/leave-balances', EmployeeController.getLeaveBalances);
r.patch('/:id/status', EmployeeController.setStatus);
r.post('/',  uploadEmployeePhoto.any(), EmployeeController.create);
r.put('/:id',  employeeUploads, EmployeeController.update);
r.delete('/:id', EmployeeController.delete);
// Admin: set leave balances for an employee
r.post('/:id/leave-balances', EmployeeController.setLeaveBalances);

export default r;
