import OrderModel from './order.model.js';

export default class OrderService {
  constructor() {
    this.model = new OrderModel();
  }

  async getAllOrders(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getOrderById(prefix, orderId) {
    return await this.model.findById(prefix, orderId);
  }

  async createOrder(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateOrderStatus(prefix, orderId, status) {
    return await this.model.updateStatus(prefix, orderId, status);
  }

  async deleteOrder(prefix, orderId) {
    return await this.model.delete(prefix, orderId);
  }
}
