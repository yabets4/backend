import { Router } from 'express';
import ctrl from './finance.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createTransactionSchema, updateTransactionSchema } from './finance.validation.js';

const r = Router(); r.use(auth(true), tenant);
r.get('/', permission('finance_read'), ctrl.list);
r.get('/:id', permission('finance_read'), ctrl.get);
r.post('/', permission('finance_write'), validate(createTransactionSchema), ctrl.create);
r.put('/:id', permission('finance_write'), validate(updateTransactionSchema), ctrl.update);
r.patch('/:id', permission('finance_write'), validate(updateTransactionSchema), ctrl.update);
r.delete('/:id', permission('finance_delete'), ctrl.remove);
export default r;
