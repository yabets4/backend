import OrderService from './order.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new OrderService();

export default class OrderController {
  // GET /orders
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const orders = await service.getAllOrders(prefix, req.query);
      return ok(res, orders);
    } catch (e) {
      next(e);
    }
  }

  // GET /orders/:id
  static async getById(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const order = await service.getOrderById(prefix, req.params.id);
      if (!order) return notFound(res, 'Order not found');
      return ok(res, order);
    } catch (e) {
      next(e);
    }
  }

  // POST /orders
  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const order = await service.createOrder(prefix, req.body);
      return ok(res, order);
    } catch (e) {
      next(e);
    }
  }

  // PATCH /orders/:id/status
  static async updateStatus(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const order = await service.updateOrderStatus(prefix, req.params.id, req.body.status);
      if (!order) return notFound(res, 'Order not found');
      return ok(res, order);
    } catch (e) {
      next(e);
    }
  }

  // DELETE /orders/:id
  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const success = await service.deleteOrder(prefix, req.params.id);
      if (!success) return notFound(res, 'Order not found');
      return ok(res, { deleted: true });
    } catch (e) {
      next(e);
    }
  }
}
