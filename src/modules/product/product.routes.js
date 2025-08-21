import { Router } from 'express';
import controller from './product.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';

const router = Router();
router.use(auth(true), tenant);

router.get('/', permission('product_read'), controller.list);
router.get('/:id', permission('product_read'), controller.get);
router.post('/', permission('product_write'), validate(createProductSchema), controller.create);
router.put('/:id', permission('product_write'), validate(updateProductSchema), controller.update);
router.patch('/:id', permission('product_write'), validate(updateProductSchema), controller.update);
router.delete('/:id', permission('product_delete'), controller.remove);

export default router;
