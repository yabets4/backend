import { Router } from 'express';
import ctrl from './crm.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createCRMSchema, updateCRMSchema } from './crm.validation.js';

const r = Router(); r.use(auth(true), tenant);
r.get('/', permission('crm_read'), ctrl.list);
r.get('/:id', permission('crm_read'), ctrl.get);
r.post('/', permission('crm_write'), validate(createCRMSchema), ctrl.create);
r.put('/:id', permission('crm_write'), validate(updateCRMSchema), ctrl.update);
r.patch('/:id', permission('crm_write'), validate(updateCRMSchema), ctrl.update);
r.delete('/:id', permission('crm_delete'), ctrl.remove);
export default r;
