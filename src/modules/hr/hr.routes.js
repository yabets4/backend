import { Router } from 'express';
import ctrl from './hr.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema } from './hr.validation.js';

const r = Router(); r.use(auth(true), tenant);
r.get('/', permission('hr_read'), ctrl.list);
r.get('/:id', permission('hr_read'), ctrl.get);
r.post('/', permission('hr_write'), validate(createEmployeeSchema), ctrl.create);
r.put('/:id', permission('hr_write'), validate(updateEmployeeSchema), ctrl.update);
r.patch('/:id', permission('hr_write'), validate(updateEmployeeSchema), ctrl.update);
r.delete('/:id', permission('hr_delete'), ctrl.remove);
export default r;
