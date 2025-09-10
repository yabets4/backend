import CustomerService from './customer.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new CustomerService();

export default class CustomerController {
  // GET /customers
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const customers = await service.getAllCustomers(prefix, req.query);
      return ok(res, customers);
    } catch (e) {
      next(e);
    }
  }

  // GET /customer/:id
  static async getById(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const customer = await service.getCustomerById(prefix, req.params.id);
      if (!customer) return notFound(res, 'Customer not found');
      return ok(res, customer);
    } catch (e) {
      next(e);
    }
  }

  // POST /customer (with photo upload)
  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;

      // If file uploaded, store path relative to /uploads
      if (req.file) {
        req.body.photo_url = `/uploads/${prefix}/customers/${req.file.filename}`;
      }

      const customer = await service.createCustomer(prefix, req.body);
      return ok(res, customer);
    } catch (e) {
      next(e);
    }
  }

  // PUT /customer/:id (with optional new photo upload)
  static async update(req, res, next) {
    try {
      const prefix = req.tenantPrefix;

      if (req.file) {
        req.body.photo_url = `/uploads/${prefix}/customers/${req.file.filename}`;
      }

      const customer = await service.updateCustomer(prefix, req.params.id, req.body);
      if (!customer) return notFound(res, 'Customer not found');
      return ok(res, customer);
    } catch (e) {
      next(e);
    }
  }

  // DELETE /customer/:id
  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const deleted = await service.deleteCustomer(prefix, req.params.id);
      if (!deleted) return notFound(res, 'Customer not found');
      return ok(res, { success: true });
    } catch (e) {
      next(e);
    }
  }
}
