import { Router } from 'express';
import CustomerController from './customer/customer.controller.js';
import OrderController from './order/order.controller.js';
import LeadController from './lead/lead.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import { uploadCustomerPhoto } from '../../middleware/multer.middleware.js';

const r = Router(); r.use(auth(false), tenant);

r.get('/customer', CustomerController.getAll);
r.get('/customer/:id', CustomerController.getById);
r.post('/customer', uploadCustomerPhoto.single('photo'), CustomerController.create);
r.put('/customer/:id', uploadCustomerPhoto.single('photo'), CustomerController.update);
r.delete('/customer/:id', permission('crm_delete'), CustomerController.delete);

// Orders
r.get('/orders', OrderController.getAll);
r.get('/orders/:id', OrderController.getById);
r.post('/orders', permission('order_create'), OrderController.create);
r.patch('/orders/:id/status', permission('order_update'), OrderController.updateStatus);
r.delete('/orders/:id', permission('order_delete'), OrderController.delete);


// leads
r.get('/leads', LeadController.getAll);
r.get('/lead/:id', LeadController.getById);
r.post('/lead', permission('crm_create'), LeadController.create);
r.post('/lead/:id/export', permission('crm_export'), LeadController.exportToCustomer);
r.put('/lead/:id', permission('crm_update'), LeadController.update);
r.delete('/lead/:id', permission('crm_delete'), LeadController.delete);



export default r;
