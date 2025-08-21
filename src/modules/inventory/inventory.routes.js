import { Router } from 'express';
import ctrl from './inventory.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createInventorySchema, updateInventorySchema } from './inventory.validation.js';

const r = Router(); r.use(auth(true), tenant);
r.get('/', permission('inventory_read'), ctrl.list);
r.get('/:id', permission('inventory_read'), ctrl.get);
r.post('/', permission('inventory_write'), validate(createInventorySchema), ctrl.create);
r.put('/:id', permission('inventory_write'), validate(updateInventorySchema), ctrl.update);
r.patch('/:id', permission('inventory_write'), validate(updateInventorySchema), ctrl.update);
r.delete('/:id', permission('inventory_delete'), ctrl.remove);
export default r;
