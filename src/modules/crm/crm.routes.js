import { Router } from 'express';
import OrderController from './order/order.controller.js';
import auth from '../../middleware/auth.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import Leads from './lead/lead.routes.js'
import customer from './customer/customers.routes.js'
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requestCounter } from '../../middleware/requestCounter.middleware.js';

const r = Router(); 
r.use(auth(false), authenticateJWT, requestCounter );

r.use('/customers', customer)

// Orders
r.get('/orders', OrderController.getAll);
r.get('/orders/:id', OrderController.getById);
r.post('/orders', permission('order_create'), OrderController.create);
r.patch('/orders/:id/status', permission('order_update'), OrderController.updateStatus);
r.delete('/orders/:id', permission('order_delete'), OrderController.delete);

// leads
r.use('/leads', Leads)

export default r;
